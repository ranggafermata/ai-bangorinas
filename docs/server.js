const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_KEY_PRO = process.env.OPENROUTER_API_KEY_PRO || '';

// Add this endpoint
app.get('/api/env', (req, res) => {
  res.json({
    apiUrl: process.env.PUBLIC_API_URL || ''
  });
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Firebase config endpoint
app.get('/api/config', (req, res) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  res.json(firebaseConfig);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, reasoning } = req.body;
    
    // Determine which API key to use
    const isPro = model.includes('nemotron');
    const apiKey = isPro ? OPENROUTER_API_KEY_PRO : OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key not configured on server' });
    }

    const requestBody = {
      model,
      messages,
      stream: true
    };

    if (reasoning) {
      requestBody.reasoning = { enabled: true };
    }

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('Proxy request error:', error);
      res.status(500).json({ error: error.message });
    });

    proxyReq.write(JSON.stringify(requestBody));
    proxyReq.end();

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
