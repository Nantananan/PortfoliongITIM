type ChatRequest = {
  question?: string;
  conversation?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  config?: {
    behavior?: string;
    responses?: string;
    knowledge?: string;
  };
};

type VercelRequest = {
  method?: string;
  body?: ChatRequest;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => VercelResponse;
};

const MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel.' });
  }

  const body = req.body || {};
  const question = body.question?.trim();
  if (!question) {
    return res.status(400).json({ error: 'A question is required.' });
  }

  const config = body.config || {};
  const systemPrompt = [
    config.behavior || 'You are the Ink Crow. Be concise, warm, mysterious, and helpful.',
    config.responses || 'Answer in one or two short sentences. Be honest when information is unavailable.',
    `Knowledge base:\n${config.knowledge || ''}`,
  ].join('\n\n');

  const conversation = Array.isArray(body.conversation) ? body.conversation.slice(-12) : [];
  if (!conversation.length || conversation[conversation.length - 1]?.parts?.[0]?.text !== question) {
    conversation.push({ role: 'user', parts: [{ text: question }] });
  }

  try {
    const upstream = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: conversation,
        systemInstruction: { parts: [{ text: systemPrompt }] },
      }),
    });

    const data = await upstream.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'Gemini request failed.' });
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return res.status(502).json({ error: 'Unable to reach Gemini right now.' });
  }
}
