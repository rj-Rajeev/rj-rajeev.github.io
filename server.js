import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// OpenAI client using env var
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// Persona system prompt
const persona = `You are Rajeev's AI assistant for his portfolio site.
Persona: Friendly, concise, professional, and helpful. Voice of Rajeev.
Context: Full Stack Developer at Prutor.ai (@IIT Kanpur). Key skills: React, Next.js, TypeScript, Node.js, MongoDB, Tailwind, Redux Toolkit. Projects include Habitix (gamified habit tracker).
Guidelines:
- Keep replies short (1-3 sentences) unless the user explicitly asks for details.
- Offer to share links to LinkedIn, GitHub, and resume when relevant.
- For inquiries about availability/collab, collect name, email, and brief idea.
- If asked about contact, provide email and phone from the site.
- If asked technical questions, answer simply and suggest scheduling a call.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }
    if (!openai) {
      // Fallback reply if key not configured
      return res.json({ reply: "Thanks for reaching out! Please email me at rajeevbhardwaj.dev@gmail.com and I'll respond soon." });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: persona },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    const reply = response.choices?.[0]?.message?.content?.trim() || 'Thanks! I will get back to you.';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat service error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
