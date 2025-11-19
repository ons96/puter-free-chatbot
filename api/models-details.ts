import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://puter.com/puterai/chat/models');
    
    if (!response.ok) {
      throw new Error(`Puter API returned ${response.status}`);
    }

    const data = await response.json();

    // Categorize models by provider
    const categorized = {
      openai: [] as string[],
      anthropic: [] as string[],
      google: [] as string[],
      meta: [] as string[],
      deepseek: [] as string[],
      mistral: [] as string[],
      xai: [] as string[],
      other: [] as string[],
    };

    if (data.models && Array.isArray(data.models)) {
      data.models.forEach((model: string) => {
        // Filter out test/fake models
        if (model.includes('fake') || model.includes('test') || model.includes('abuse') || model.includes('costly')) {
          return;
        }

        if (model.includes('gpt') || model.includes('o1') || model.includes('o3')) {
          categorized.openai.push(model);
        } else if (model.includes('claude')) {
          categorized.anthropic.push(model);
        } else if (model.includes('gemini')) {
          categorized.google.push(model);
        } else if (model.includes('llama') || model.includes('meta')) {
          categorized.meta.push(model);
        } else if (model.includes('deepseek')) {
          categorized.deepseek.push(model);
        } else if (model.includes('mistral')) {
          categorized.mistral.push(model);
        } else if (model.includes('grok')) {
          categorized.xai.push(model);
        } else {
          categorized.other.push(model);
        }
      });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({
      total: Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0),
      categorized,
      raw: data.models,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
          }
