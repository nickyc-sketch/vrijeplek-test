# Vrijeplek.be v2 — Netlify Starter (Modern UI + Identity + Supabase)

## Wat zit erin?
- **Modern UI** (dark/neutral, glas-effect, animaties, dropdowns, Google Fonts)
- **Netlify Identity** login (widget + route protectie)
- **Dashboard** met slots-lijst en CRUD
- **Supabase** REST voor agenda-slots via Netlify Functions (`slots-*`)
- **Stripe** Checkout + Webhook + SMTP factuure-mail
- **Netlify config** (`netlify.toml`) + security headers

## Vereisten
- Netlify site (Identity inschakelen)
- Stripe (prices voor €9 en €80)
- SMTP (Mailgun/Sendgrid of eigen server)
- Supabase project met tabel:
  ```sql
  create table public.slots (
    id uuid primary key default gen_random_uuid(),
    when text not null,
    status text default 'Vrij'
  );
  -- Geef anon rol toegang
  alter table slots enable row level security;
  create policy "public read" on slots for select using (true);
  create policy "public insert" on slots for insert with check (true);
  create policy "public delete" on slots for delete using (true);
  ```

## Environment variables (Netlify → Site settings → Environment)
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_MONTHLY` (price_xxx voor €9)
- `STRIPE_PRICE_YEARLY`  (price_xxx voor €80)
- `SUCCESS_URL` (bv. https://<site>/login.html?success=1)
- `CANCEL_URL`  (bv. https://<site>/signup.html?cancel=1)
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## Identity
- Zet **Netlify Identity** aan.
- Gebruik login via `login.html` of via de widget op elke pagina.
- Dashboard redirect naar login wanneer niet ingelogd.

## Deploy
1. Upload deze map naar je repo en koppel aan Netlify.
2. Stel de ENV vars in.
3. Maak Supabase tabel aan (zie SQL).
4. Maak Stripe prijzen + webhook.
5. Deploy.
