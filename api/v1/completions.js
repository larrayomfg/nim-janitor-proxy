export const config = {
  runtime: 'edge',
};

const NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
};

export default async function handler(req) {
  // browsers send this "preflight" request first — must answer it or every request fails
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: corsHeaders });
  }

  const incomingAuth = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.PROXY_ACCESS_KEY || ''}`;
  if (process.env.PROXY_ACCESS_KEY && incomingAuth !== expected) {
    return new Response(
      JSON.stringify({ error: { message: 'invalid proxy access key' } }),
      { status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('invalid json body', { status: 400, headers: corsHeaders });
  }

  const nimModel = process.env.NIM_MODEL || body.model;
  const nimPayload = { ...body, model: nimModel };

  const nimResponse = await fetch(`${NIM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.NIM_API_KEY}`,
      accept: body.stream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify(nimPayload),
  });

  if (body.stream) {
    return new Response(nimResponse.body, {
      status: nimResponse.status,
      headers: {
        ...corsHeaders,
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      },
    });
  }

  const data = await nimResponse.text();
  return new Response(data, {
    status: nimResponse.status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
