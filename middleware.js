export const config = {
  matcher: '/manage/:path*'
};

export default function middleware(request) {
  var authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Photobase Admin"' }
    });
  }

  try {
    var base64 = authHeader.slice(6);
    var decoded = atob(base64);
    var colonIndex = decoded.indexOf(':');
    if (colonIndex === -1) throw new Error('Invalid format');
    var username = decoded.slice(0, colonIndex);
    var password = decoded.slice(colonIndex + 1);

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      return;
    }
  } catch (e) {}

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Photobase Admin"' }
  });
}
