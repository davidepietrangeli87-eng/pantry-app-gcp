const express = require('express');
const https = require('https');
const app = express();

// Middleware per parsare il body JSON delle richieste, con un limite aumentato per le immagini
app.use(express.json({ limit: '10mb' }));

// La tua chiave API di Gemini.
// **IMPORTANTE**: Sostituisci con la tua vera chiave API!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-pro-vision';

// Abilita CORS per permettere alla tua app di chiamare questa funzione
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  next();
});

// Endpoint principale che riceve le richieste POST
app.post('/', (req, res) => {
  const { prompt, imageBase64 } = req.body;

  if (!prompt) {
    return res.status(400).send('Missing "prompt" in request body.');
  }

  let parts = [{ "text": prompt }];
  if (imageBase64) {
    parts.push({ "inline_data": { "mime_type": "image/jpeg", "data": imageBase64 } });
  }

  const postData = JSON.stringify({
    "contents": [{ "parts": parts }]
  });

  const options = {
    hostname: 'europe-west1-aiplatform.googleapis.com',
    path: `/v1/projects/gen-lang-client-0490769596/locations/europe-west1/publishers/google/models/${GEMINI_MODEL}:streamGenerateContent`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      console.log('Response from Gemini:', data);
      res.status(apiRes.statusCode).type('application/json').send(data);
    });
  });

  apiReq.on('error', (e) => {
    console.error('Error calling Gemini API:', e);
    res.status(500).send(`Error calling Gemini API: ${e.message}`);
  });

  apiReq.write(postData);
  apiReq.end();
});

// Avvio del server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Pantry Tracker App proxy listening on port ${port}`);
});
