const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { text, language } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'News text is required' });
  }

  const prompt = `You are a fake news detection expert for Pakistani news. Analyze the following news text and respond ONLY in JSON format like this:
{
  "verdict": "FAKE" or "REAL" or "SUSPICIOUS",
  "confidence": (number 0-100),
  "explanation": "clear explanation in ${language === 'ur' ? 'Urdu' : 'English'}",
  "red_flags": ["flag1", "flag2"],
  "recommendation": "what user should do"
}

News text: "${text}"`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
  response_format: { type: "json_object" }
        
      })
    });

    const data = await response.json();
    console.log('GROQ RESPONSE:', JSON.stringify(data));
    const raw = data.choices[0].message.content;
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/', (req, res) => {
  res.send('NewsVault Backend Running ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;