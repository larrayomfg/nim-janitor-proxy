 export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const model = process.env.NIM_MODEL || 'meta/llama-3.1-70b-instruct';

  return new Response(
    JSON.stringify({
      object: 'list',
      data: [{ id: model, object: 'model', owned_by: 'nvidia-nim' }],
    }),
    { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
  );
}
