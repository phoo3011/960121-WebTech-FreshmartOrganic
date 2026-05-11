const crypto = require('crypto');
const config = require('../config/config');

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

module.exports = (req, res, next) => {
  try {
    const auth = req.header('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Missing authorization token' });

    const token = auth.split(' ')[1];
    const parts = token.split('.');
    if (parts.length !== 3) return res.status(401).json({ success: false, message: 'Invalid token format' });

    const [headerB64, payloadB64, signature] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const expectedSig = crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(signingInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (expectedSig !== signature) return res.status(401).json({ success: false, message: 'Invalid token signature' });

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return res.status(401).json({ success: false, message: 'Token expired' });

    // Attach minimal user info
    req.user = {
      id: payload.id || payload.userId || null,
      email: payload.email || null,
    };

    return next();
  } catch (err) {
    console.error('[Auth Middleware] Error verifying token:', err.message);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};