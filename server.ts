import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

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

  // API Route: Submitting Custom Coloring Book Orders
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
