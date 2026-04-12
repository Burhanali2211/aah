// Vercel Serverless Function: /api/payment-process
// Handles Razorpay order creation and payment verification
//
// Required environment variables in Vercel dashboard:
//   RAZORPAY_KEY_ID           — Razorpay Key ID
//   RAZORPAY_KEY_SECRET       — Razorpay Key Secret
//   SUPABASE_URL              — Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key

const https = require('https');
const crypto = require('crypto');

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'https://aah-teal.vercel.app';

function getCorsHeaders(req) {
  const origin = req.headers.origin || '';
  const isAllowed =
    origin === ALLOWED_ORIGIN ||
    origin.endsWith('.vercel.app') ||
    origin === 'http://localhost:5173';
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

function razorpayRequest(path, method, body, keyId, keySecret) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let buf = '';
      res.on('data', (c) => { buf += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch (e) { reject(new Error('Invalid JSON from Razorpay: ' + buf)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function supabasePatch(supabaseUrl, serviceKey, orderId, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        Prefer: 'return=minimal',
      },
    };
    const req = https.request(options, (res) => {
      let buf = '';
      res.on('data', (c) => { buf += c; });
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Basic in-memory rate limiter
const ipRequests = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20;

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, [now]);
    return false;
  }

  const timestamps = ipRequests.get(ip).filter(time => now - time < windowMs);
  timestamps.push(now);
  ipRequests.set(ip, timestamps);

  // Clean up old entries occasionally to prevent memory leaks in warm lambda
  if (Math.random() < 0.05) {
    for (const [key, times] of ipRequests.entries()) {
      const valid = times.filter(time => now - time < windowMs);
      if (valid.length === 0) ipRequests.delete(key);
      else ipRequests.set(key, valid);
    }
  }

  return timestamps.length > maxRequests;
}

module.exports = async function handler(req, res) {
  // CORS
  const corsHeaders = getCorsHeaders(req);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting (Basic in-memory for Lambda lifecycle)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  const action = req.query.action;
  const body = req.body || {};

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
  }

  try {
    // 1. Create Razorpay order
    if (action === 'create-order') {
      const { amount, currency = 'INR', receipt, notes } = body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }

      const order = await razorpayRequest(
        '/v1/orders',
        'POST',
        { amount: Math.round(amount * 100), currency, receipt, notes },
        razorpayKeyId,
        razorpayKeySecret
      );

      if (order.error) {
        return res.status(400).json({ success: false, error: order.error.description || 'Razorpay error' });
      }

      return res.status(200).json({ success: true, data: order });
    }

    // 2. Verify payment signature
    if (action === 'verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Missing payment details' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }

      // Update order in Supabase
      if (order_id && supabaseUrl && supabaseServiceKey) {
        await supabasePatch(supabaseUrl, supabaseServiceKey, order_id, {
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_payment_id,
          razorpay_order_id,
          updated_at: new Date().toISOString(),
        });
      }

      return res.status(200).json({ success: true, message: 'Payment verified' });
    }

    return res.status(400).json({ error: 'Invalid action. Use ?action=create-order or ?action=verify-payment' });

  } catch (err) {
    console.error('payment-process error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
