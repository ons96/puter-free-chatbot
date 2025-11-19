import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, model = 'gpt-4o-mini', stream = false } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Call Puter's API server-side
    // Note: You'll need a Puter API key in your environment variables
    const puterApiKey = process.env.PUTER_API_KEY;

    const response = await fetch('https://api.puter.com/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(puterApiKey && { 'Authorization': `Bearer ${puterApiKey}` }),
      },
      body: JSON.stringify({
        message,
        model,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`Puter API returned ${response.status}`);
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (stream) {
      // Stream the response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body?.getReader();
      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } finally {
          reader.releaseLock();
        }
      }
      res.end();
    } else {
      // Return complete response
      const data = await response.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Error calling Puter API:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
