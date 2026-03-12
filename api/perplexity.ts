import { Perplexity } from '@perplexity-ai/perplexity_ai';

const perplexity = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    });
  }

  try {
    const { messages, model = 'sonar-pro' } = await req.json();

    const response = await perplexity.chat.completions.create({
      model,
      messages,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Perplexity API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
