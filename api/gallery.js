var { getFile, putFile } = require('../lib/github');
var { rateLimit } = require('../lib/rate-limit');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
  }

  if (req.method === 'GET') {
    try {
      var result = await getFile('gallery.json');
      return res.status(200).json({ photos: result.content.photos || [], sha: result.sha });
    } catch (err) {
      if (err.message.indexOf('404') !== -1 || err.message.indexOf('Not Found') !== -1) {
        return res.status(200).json({ photos: [], sha: null });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      var photos = req.body.photos;
      var sha = req.body.sha;

      if (!Array.isArray(photos)) {
        return res.status(400).json({ error: 'photos must be an array' });
      }

      if (!sha) {
        try {
          var current = await getFile('gallery.json');
          sha = current.sha;
        } catch (e) {
          sha = null;
        }
      }

      var result = await putFile('gallery.json', { photos: photos }, sha, 'Update gallery [skip ci]');
      return res.status(200).json({ sha: result.content.sha, success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
