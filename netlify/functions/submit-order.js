const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

exports.handler = async function (event, context) {
  // CORS Headers support
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS OK' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { details, photos, storyFile } = body;

    // Validate request
    if (!details || !details.customer_name || !details.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required customer details (name and email).' })
      };
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please upload at least one photo.' })
      };
    }

    // Retrieve environment variables
    const {
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_ACCOUNT_ID,
      R2_BUCKET_NAME,
      GOOGLE_FORM_ACTION_URL,
      GOOGLE_SHEET_API_URL
    } = process.env;

    // Check if configuration is present
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
      console.warn('Missing R2 environment configuration.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server R2 storage credentials are not configured.' })
      };
    }

    const formActionUrl = GOOGLE_FORM_ACTION_URL || GOOGLE_SHEET_API_URL || 'https://google.com';

    // Initialize Cloudflare R2 (S3 Compatible Client)
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
      }
    });

    const orderId = `ORD_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const imageUrls = [];

    // Helper to decode Base64 data URLs
    const decodeBase64 = (base64String, fallbackType) => {
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

    // 1. Upload All Photo Attachments to Cloudflare R2
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (!photo.base64Data) continue;

      const { contentType, buffer } = decodeBase64(photo.base64Data, photo.type);
      
      // Determine file extension
      let extension = 'png';
      if (contentType && contentType.includes('/')) {
        extension = contentType.split('/')[1];
      } else if (photo.name && photo.name.includes('.')) {
        extension = photo.name.split('.').pop();
      }

      const key = `orders/${orderId}/photo_${i + 1}.${extension}`;

      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType
      }));

      // Generate storage representation URL
      const publicUrl = `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
      imageUrls.push(publicUrl);
    }

    // 2. Upload Story Attachment Document if present
    let storyUrl = 'None';
    if (storyFile && storyFile.base64Data) {
      const { contentType, buffer } = decodeBase64(storyFile.base64Data, storyFile.type);
      
      let extension = 'pdf';
      if (storyFile.name && storyFile.name.includes('.')) {
        extension = storyFile.name.split('.').pop();
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

    // 3. Post formatted data directly to Google Forms invisibly using standard background POST request
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

    console.log(`[Google Form Submission] Sending background POST to ${formActionUrl}...`);
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
    } catch (formErr) {
      // Direct POST to google formResponse might result in CORS or redirect warnings but successfully registers,
      // so we capture and warn without failing the client order creation experience
      console.warn('Google Forms submission background warning (non-fatal):', formErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        orderId,
        imageUrls,
        storyUrl
      })
    };
  } catch (error) {
    console.error('Failure in Netlify submit-order function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process and submit order details.',
        message: error.message
      })
    };
  }
};
