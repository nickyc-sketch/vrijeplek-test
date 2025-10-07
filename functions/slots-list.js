const fetch = require('node-fetch');
exports.handler = async (event, ctx) => {
  try{
    const url = process.env.SUPABASE_URL + '/rest/v1/slots?select=*&order=when.asc';
    const res = await fetch(url, { headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + process.env.SUPABASE_ANON_KEY } });
    const data = await res.json();
    return { statusCode:200, body: JSON.stringify(data) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({error:e.message})}; }
};
