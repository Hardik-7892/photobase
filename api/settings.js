var { getFile } = require('../lib/github');
var { rateLimit } = require('../lib/rate-limit');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    var result = await getFile('settings.json');
    return res.status(200).json(result.content);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
