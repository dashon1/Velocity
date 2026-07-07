export const config = {
  runtime: 'edge',
};

// Proxies content generation through the fn backend, which holds the OpenAI key.
// No env vars needed in this project.
const FN_BACKEND = 'https://fn.aimicrotechlink.cloud';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { topic, contentType } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const platformNames: Record<string, string> = {
      tweet: 'Twitter/X (280 chars)',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      video: 'Reels/TikTok script',
      youtube: 'YouTube video script',
      facebook: 'Facebook post'
    };

    const prompt = `Write a viral ${platformNames[contentType] || contentType} post about "${topic}". Make it engaging, use appropriate formatting with line breaks. Don't use emojis. Just write compelling content.`;

    const r = await fetch(`${FN_BACKEND}/integrations/InvokeLLM`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: 0.8 }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return new Response(JSON.stringify({ error: `Generation failed (${r.status})`, detail: detail.slice(0, 200) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const content = await r.text().then(t => {
      try { const j = JSON.parse(t); return typeof j === 'string' ? j : (j.output || t); } catch { return t; }
    });

    return new Response(JSON.stringify({ content: String(content).replace(/^"|"$/g, '') }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
