const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.handler = async (event) => {
  try{
    const data = JSON.parse(event.body || '{}');
    const plan = data.plan || 'monthly';
    const customer = await stripe.customers.create({
      email: data.email, name: data.company,
      metadata:{ vat:data.vat||'', category:data.category||'', phone:data.phone||'', reviews:data.reviews||'', address:data.address||'', bio:(data.bio||'').slice(0,240), source:'vrijeplek-signup' }
    });
    const line_items = [{ price: plan==='yearly'?process.env.STRIPE_PRICE_YEARLY:process.env.STRIPE_PRICE_MONTHLY, quantity:1 }];
    const trial_days = plan==='monthly'?90:0;
    const session = await stripe.checkout.sessions.create({
      mode:'subscription', customer: customer.id, line_items,
      success_url: process.env.SUCCESS_URL || '/login.html?success=1',
      cancel_url: process.env.CANCEL_URL || '/signup.html?cancel=1',
      subscription_data:{ trial_period_days: trial_days, metadata:{ company:data.company||'', vat:data.vat||'' } },
      automatic_tax:{enabled:false}
    });
    return { statusCode:200, body: JSON.stringify({ url: session.url }) };
  }catch(err){ console.error(err); return { statusCode:500, body: JSON.stringify({ error: err.message }) }; }
};
