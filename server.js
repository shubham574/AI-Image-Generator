const express = require('express');
const fetch = require('node-fetch'); // Make sure you're using node-fetch@2
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve your frontend from 'public' folder

const API_KEY = 'your_huggingface_api_key_here';

app.post('/generate', async (req, res) => {
  const { model, prompt, width, height } = req.body;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height },
        options: { wait_for_model: true, use_cache: false },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error });
    }

    const imageBlob = await response.buffer();
    res.set('Content-Type', 'image/png');
    res.send(imageBlob);
  } catch (error) {
    res.status(500).json({ error: 'Image generation failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
