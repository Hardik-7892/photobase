var requests = {};

var WINDOW_MS = 60 * 1000;
var MAX_REQUESTS_PER_WINDOW = 60;

function rateLimit(ip) {
  var now = Date.now();
  var windowStart = now - WINDOW_MS;

  for (var key in requests) {
    if (requests.hasOwnProperty(key) && requests[key] < windowStart) {
      delete requests[key];
    }
  }

  var count = requests[ip] || 0;
  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  requests[ip] = count + 1;
  return true;
}

module.exports = { rateLimit: rateLimit };
