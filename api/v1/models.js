   export const config = {
     runtime: 'edge',
   };

   export default async function handler() {
     const model = process.env.NIM_MODEL || 'meta/llama-3.1-70b-instruct';

     return new Response(
       JSON.stringify({
         object: 'list',
         data: [{ id: model, object: 'model', owned_by: 'nvidia-nim' }],
       }),
       { status: 200, headers: { 'content-type': 'application/json' } }
     );
   }
