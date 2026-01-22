const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_KEY_PRO = process.env.OPENROUTER_API_KEY_PRO;

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream, reasoning } = req.body;
    
    // Determine which API key to use
    const isPro = model.includes('nemotron');
    const apiKey = isPro ? OPENROUTER_API_KEY_PRO : OPENROUTER_API_KEY;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages,
      stream: true
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'text/event-stream');
    response.data.pipe(res);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));