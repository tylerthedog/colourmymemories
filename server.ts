import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit expanded for handling Base64 photo uploads safely
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Ensure persistent data folder exists
  const ordersDir = path.join(process.cwd(), 'orders');
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }

  // API Route: Contact Messages Form
  app.post('/api/contact', (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        res.status(400).json({ error: 'Name, email, and message are required.' });
        return;
      }

      const filePath = path.join(ordersDir, 'contact_messages.json');
      let messagesList: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          messagesList = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {
          messagesList = [];
        }
      }

      const newMessage = {
        name,
        email,
        message,
        timestamp: new Date().toISOString()
      };

      messagesList.unshift(newMessage);
      fs.writeFileSync(filePath, JSON.stringify(messagesList, null, 2));

      console.log(`[Contact Form Received] Name: ${name}, Email: ${email}`);
      res.status(200).json({ status: 'ok', message: 'Message recorded successfully' });
    } catch (err) {
      console.error('Contact form submission backend fail:', err);
      res.status(500).json({ error: 'Failed to record details.' });
    }
  });

  // API Route: Submitting Custom Colouring Book Orders
  app.post('/api/orders', async (req, res) => {
    try {
      const { details, photos, storyFile } = req.body;
      if (!details || !details.customer_name || !details.email || !photos || !Array.isArray(photos)) {
        res.status(400).json({ error: 'Missing customer details or photo list.' });
        return;
      }

      const orderId = `ORD_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

      // 1. Save customer and narrative details
      const orderFile = path.join(ordersDir, `order_${orderId}.json`);
      const orderData = {
        id: orderId,
        details,
        photoCount: photos.length,
        hasStoryFile: !!storyFile,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(orderFile, JSON.stringify(orderData, null, 2));

      // 2. Create subfolder to save photos
      const photosDir = path.join(ordersDir, `photos_${orderId}`);
      fs.mkdirSync(photosDir, { recursive: true });

      photos.forEach((photo: any, index: number) => {
        try {
          // Extracts the binary part from base64 data link (e.g. data:image/png;base64,iVB...)
          const base64Data = photo.base64Data.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          let extension = 'png';
          if (photo.type && photo.type.includes('/')) {
            extension = photo.type.split('/')[1];
          }

          const photoPath = path.join(photosDir, `photo_${index + 1}.${extension}`);
          fs.writeFileSync(photoPath, buffer);
        } catch (innerErr) {
          console.error(`Failed to write photo index ${index} for order ${orderId}:`, innerErr);
        }
      });

      // 3. Save the story file if present
      if (storyFile) {
        try {
          const base64Data = storyFile.base64Data.replace(/^data:application\/\w+;base64,/, '').replace(/^data:text\/plain;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          let extension = 'pdf';
          if (storyFile.name && storyFile.name.includes('.')) {
            const parts = storyFile.name.split('.');
            extension = parts[parts.length - 1];
          }

          const storyPath = path.join(photosDir, `story_document.${extension}`);
          fs.writeFileSync(storyPath, buffer);
        } catch (storyErr) {
          console.error(`Failed to write story file for order ${orderId}:`, storyErr);
        }
      }

      // 4. Update the core index of orders
      const listPath = path.join(ordersDir, 'orders_index.json');
      let ordersList: any[] = [];
      if (fs.existsSync(listPath)) {
        try {
          ordersList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));
        } catch {
          ordersList = [];
        }
      }
      ordersList.unshift({
        id: orderId,
        customer_name: details.customer_name,
        email: details.email,
        phone: details.phone,
        photoCount: photos.length,
        timestamp: orderData.timestamp
      });
      fs.writeFileSync(listPath, JSON.stringify(ordersList, null, 2));

      console.log(`[Order Received ✓] ID: ${orderId}, Name: ${details.customer_name}, Photos: ${photos.length}`);
      res.status(200).json({ status: 'ok', orderId });
    } catch (err) {
      console.error('Order checkout submission backend fail:', err);
      res.status(500).json({ error: 'Failed to process order.' });
    }
  });

  // API Route: Secure Netlify/Serverless submit-order parity handler
  app.post('/api/submit-order', async (req, res) => {
    try {
      const { details, photos, storyFile } = req.body;
      if (!details || !details.customer_name || !details.email) {
        res.status(400).json({ error: 'Missing customer details (name and email).' });
        return;
      }

      if (!photos || !Array.isArray(photos) || photos.length === 0) {
        res.status(400).json({ error: 'Please upload at least one photo.' });
        return;
      }

      const orderId = `ORD_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
      const imageUrls: string[] = [];
      let storyUrl = 'None';

      const {
        R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY,
        R2_ACCOUNT_ID,
        R2_BUCKET_NAME,
        GOOGLE_FORM_ACTION_URL,
        GOOGLE_SHEET_API_URL
      } = process.env;

      const hasR2Config = R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ACCOUNT_ID && R2_BUCKET_NAME;

      const decodeBase64 = (base64String: string, fallbackType?: string) => {
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          return {
            contentType: matches[1],
            buffer: Buffer.from(matches[2], 'base64')
          };
        }
        return {
          contentType: fallbackType || 'application/octet-stream',
          buffer: Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        };
      };

      if (hasR2Config) {
        console.log('[R2 Config Secured] Initializing R2 upload process...');
        const s3 = new S3Client({
          region: 'auto',
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: R2_ACCESS_KEY_ID!,
            secretAccessKey: R2_SECRET_ACCESS_KEY!
          }
        });

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          if (!photo.base64Data) continue;

          const { contentType, buffer } = decodeBase64(photo.base64Data, photo.type);
          
          let extension = 'png';
          if (contentType && contentType.includes('/')) {
            extension = contentType.split('/')[1];
          } else if (photo.name && photo.name.includes('.')) {
            extension = photo.name.split('.').pop()!;
          }

          const key = `orders/${orderId}/photo_${i + 1}.${extension}`;

          await s3.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType
          }));

          imageUrls.push(`https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`);
        }

        if (storyFile && storyFile.base64Data) {
          const { contentType, buffer } = decodeBase64(storyFile.base64Data, storyFile.type);
          
          let extension = 'pdf';
          if (storyFile.name && storyFile.name.includes('.')) {
            extension = storyFile.name.split('.').pop()!;
          }

          const key = `orders/${orderId}/story_document.${extension}`;

          await s3.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType
          }));

          storyUrl = `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
        }
      } else {
        console.warn('[R2 Config Missing] Saving file payloads locally inside the orders directory as developer fallback.');
        
        const photosDir = path.join(ordersDir, `photos_${orderId}`);
        fs.mkdirSync(photosDir, { recursive: true });

        photos.forEach((photo: any, index: number) => {
          try {
            const { contentType, buffer } = decodeBase64(photo.base64Data, photo.type);
            let extension = 'png';
            if (contentType && contentType.includes('/')) {
              extension = contentType.split('/')[1];
            }
            const photoPath = path.join(photosDir, `photo_${index + 1}.${extension}`);
            fs.writeFileSync(photoPath, buffer);
            imageUrls.push(`/orders/photos_${orderId}/photo_${index + 1}.${extension}`);
          } catch (innerErr) {
            console.error(`Local backup photo dump failed for photo ${index}:`, innerErr);
          }
        });

        if (storyFile) {
          try {
            const { contentType, buffer } = decodeBase64(storyFile.base64Data, storyFile.type);
            let extension = 'pdf';
            if (storyFile.name && storyFile.name.includes('.')) {
              extension = storyFile.name.split('.').pop()!;
            }
            const storyPath = path.join(photosDir, `story_document.${extension}`);
            fs.writeFileSync(storyPath, buffer);
            storyUrl = `/orders/photos_${orderId}/story_document.${extension}`;
          } catch (storyErr) {
            console.error('Local backup story dump failed:', storyErr);
          }
        }
      }

      const listPath = path.join(ordersDir, 'orders_index.json');
      let ordersList: any[] = [];
      if (fs.existsSync(listPath)) {
        try {
          ordersList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));
        } catch {
          ordersList = [];
        }
      }
      ordersList.unshift({
        id: orderId,
        customer_name: details.customer_name,
        email: details.email,
        phone: details.phone || '',
        photoCount: photos.length,
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(listPath, JSON.stringify(ordersList, null, 2));

      // Active Google Form Submission Target (Form ID: 1FAIpQLSf9c_gsjPPnxFNN5SGK8i1cqI4P-kx29RF6jKGZ47ZVJrPn2A)
      // Specifying the precise destination endpoint URL for user data submission.
      const formActionUrl = "https://docs.google.com/forms/d/e/1FAIpQLSf9c_gsjPPnxFNN5SGK8i1cqI4P-kx29RF6jKGZ47ZVJrPn2A/formResponse";
      console.log(`[Google Form Submission] Sending background POST to ${formActionUrl}...`);

      const formParams = new URLSearchParams();
      // - Full Name ID: entry.1474310025
      formParams.append('entry.1474310025', details.customer_name || '');
      // - Phone Number ID: entry.1082449212
      formParams.append('entry.1082449212', details.phone || '');
      // - Street Address ID: entry.577022071
      formParams.append('entry.577022071', details.street || '');
      // - City ID: entry.1697465648
      formParams.append('entry.1697465648', details.city || '');
      // - Province ID: entry.1493182288
      formParams.append('entry.1493182288', details.province || '');
      // - Postal Code ID: entry.1143424652
      formParams.append('entry.1143424652', details.postal_code || '');
      // - Country ID: entry.1691663973
      formParams.append('entry.1691663973', details.country || 'South Africa');

      // If built-in email collection is enabled on Google Forms, append the email address
      formParams.append('emailAddress', details.email || '');

      // - Story Details ID: entry.1137043253
      let storyContent = details.story || '';
      storyContent += `\n\n[Email]: ${details.email || ''}`;
      if (imageUrls && imageUrls.length > 0) {
        storyContent += `\n\n[R2 Image URLs]:\n${imageUrls.join('\n')}`;
      }
      if (storyUrl && storyUrl !== 'None') {
        storyContent += `\n\n[Story File URL]: ${storyUrl}`;
      }
      storyContent += `\n\n[Order ID]: ${orderId}`;
      storyContent += `\n[Timestamp]: ${new Date().toISOString()}`;

      formParams.append('entry.1137043253', storyContent);

      try {
        const gFormResponse = await fetch(formActionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formParams.toString()
        });

        if (!gFormResponse.ok) {
          const errText = await gFormResponse.text();
          console.warn('Google Forms did not respond with OK status:', errText);
        } else {
          console.log('[Google Form Submission] Completed successfully!');
        }
      } catch (formErr: any) {
        console.warn('Google Forms submission background warning (non-fatal):', formErr.message);
      }

      console.log(`[Submit-Order Completed ✓] ID: ${orderId}, Name: ${details.customer_name}`);
      res.status(200).json({
        status: 'ok',
        orderId,
        imageUrls,
        storyUrl
      });
    } catch (err: any) {
      console.error('Submit order backend crash:', err);
      res.status(500).json({ error: 'Failed to process order connection.', message: err.message });
    }
  });

  // API Route: Secure Paystack Payment Confirmation
  app.post('/api/confirm-payment', async (req, res) => {
    try {
      const { reference, email, name, amount } = req.body;
      if (!reference || !email) {
        res.status(400).json({ error: 'Missing payment reference or customer email.' });
        return;
      }

      const paymentsFile = path.join(ordersDir, 'payments_index.json');
      let paymentsList: any[] = [];
      if (fs.existsSync(paymentsFile)) {
        try {
          paymentsList = JSON.parse(fs.readFileSync(paymentsFile, 'utf-8'));
        } catch {
          paymentsList = [];
        }
      }

      const newPayment = {
        reference,
        email,
        name: name || 'Not Provided',
        amount: amount || 0,
        timestamp: new Date().toISOString()
      };

      paymentsList.unshift(newPayment);
      fs.writeFileSync(paymentsFile, JSON.stringify(paymentsList, null, 2));

      console.log(`[Paystack Payment Recorded ✓] Ref: ${reference}, Email: ${email}, Amount: ${amount}`);
      res.status(200).json({ status: 'ok', message: 'Transaction saved successfully.', details: newPayment });
    } catch (err: any) {
      console.error('Failed to confirm payment on backend:', err);
      res.status(500).json({ error: 'Internal server error saving transaction.' });
    }
  });

  // API Route: Google Drive Image Proxy
  app.get('/api/image-proxy', async (req, res) => {
    try {
      const fileId = req.query.id as string;
      if (!fileId) {
        res.status(400).send('Missing image id');
        return;
      }

      // Extract raw ID if full Google Drive URL is passed
      let cleanId = fileId;
      const reg1 = /\/d\/([a-zA-Z0-9_-]{25,})/;
      const reg2 = /[?&]id=([a-zA-Z0-9_-]{25,})/;
      const match1 = fileId.match(reg1);
      if (match1) {
        cleanId = match1[1];
      } else {
        const match2 = fileId.match(reg2);
        if (match2) {
          cleanId = match2[1];
        }
      }

      // Safe clean character check
      cleanId = cleanId.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!cleanId || cleanId.length < 15) {
        res.status(400).send('Invalid file id');
        return;
      }

      const urls = [
        `https://drive.google.com/thumbnail?id=${cleanId}&sz=w1000`,
        `https://lh3.googleusercontent.com/d/${cleanId}`,
        `https://drive.google.com/uc?export=download&id=${cleanId}`
      ];

      for (const url of urls) {
        try {
          const fetchRes = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
          });
          if (fetchRes.ok) {
            const contentType = fetchRes.headers.get('content-type') || 'image/png';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            
            const arrayBuffer = await fetchRes.arrayBuffer();
            res.send(Buffer.from(arrayBuffer));
            return;
          }
        } catch (fetchErr) {
          console.error(`Error fetching image from ${url}:`, fetchErr);
        }
      }

      res.status(404).send('Image resource not found');
    } catch (err: any) {
      console.error('Image proxy route error:', err);
      res.status(500).send('Server Error');
    }
  });

  // Serve static folders (e.g. public directory in dev mode and compiled directory in prod mode)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start full-stack server:', error);
});
