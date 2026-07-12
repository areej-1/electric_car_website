const allowedOrigins = new Set([
  'https://areej-1.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

const systemPrompt = `You are CarGPT, the friendly technical assistant for the SIS Al Jada Cobras, a Grades 11–12 electric race car team at SABIS Al Jada in Sharjah, UAE. The team is building for the Electric Vehicle Grand Prix (EVGP). Explain electric-car and team topics clearly for students and parents. Keep answers concise, accurate, encouraging, and safety-conscious. Never invent private team facts. If you do not know a team-specific detail, say so.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.has(origin) ? origin : 'https://areej-1.github.io';
    const cors = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors });
    if (!env.GROQ_API_KEY) return Response.json({ error: 'Server configuration missing' }, { status: 500, headers: cors });

    const body = await request.json().catch(() => null);
    const message = body?.message?.trim();
    if (!message || message.length > 1200) {
      return Response.json({ error: 'Message must be between 1 and 1200 characters' }, { status: 400, headers: cors });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.35,
        max_completion_tokens: 420,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await groqResponse.json().catch(() => ({}));
    if (!groqResponse.ok) {
      return Response.json({ error: 'CarGPT is temporarily unavailable' }, { status: 502, headers: cors });
    }

    return Response.json({ reply: data.choices?.[0]?.message?.content || 'No response generated.' }, { headers: cors });
  }
};
