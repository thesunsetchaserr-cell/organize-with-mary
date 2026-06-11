import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

export const POST: APIRoute = async () => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  const priceId   = import.meta.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      ui_mode:   'embedded_page',
      mode:      'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: 'https://www.trylucente.com/thank-you?session_id={CHECKOUT_SESSION_ID}',
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stripe session error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
