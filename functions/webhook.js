const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let evt;
  try{ evt = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET); }
  catch(err){ return { statusCode:400, body: `Webhook Error: ${err.message}`}; }
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT||'587',10), secure:false,
      auth:{ user:process.env.SMTP_USER, pass:process.env.SMTP_PASS }
    });
    if (evt.type==='invoice.paid'){
      const invoice = evt.data.object;
      const customer = await stripe.customers.retrieve(invoice.customer);
      await transporter.sendMail({ from: process.env.SMTP_FROM, to: customer.email, subject:'Factuur betaald — Vrijeplek.be', text:`Bedankt! Betaling ontvangen. Factuur: ${invoice.number||invoice.id}` });
    }
    return { statusCode:200, body:'ok' };
  }catch(err){ console.error(err); return { statusCode:500, body:'Internal Error' }; }
};
