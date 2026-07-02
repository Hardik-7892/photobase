export const config = {
  matcher: '/manage/:path*'
};

function getCookieValue(cookieString, name) {
  var match = cookieString.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? match[1] : null;
}

export default async function middleware(request) {
  var url = new URL(request.url);
  var path = url.pathname;

  if (path === '/manage/login.html') {
    return;
  }

  if (path === '/manage/login') {
    if (request.method === 'GET') {
      return Response.redirect(new URL('/manage/login.html', request.url));
    }

    if (request.method === 'POST') {
      try {
        var formData = await request.formData();
        var username = formData.get('username');
        var password = formData.get('password');

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
          var session = btoa(username + ':' + password);
          return new Response(null, {
            status: 302,
            headers: {
              'Location': '/manage/',
              'Set-Cookie': 'photobase_session=' + session + '; Path=/manage; HttpOnly; SameSite=Lax; Max-Age=86400'
            }
          });
        }
      } catch (e) {}

      return Response.redirect(new URL('/manage/login.html?failed=1', request.url));
    }

    return new Response('Method not allowed', { status: 405 });
  }

  if (path === '/manage/logout') {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': 'photobase_session=; Path=/manage; Max-Age=0'
      }
    });
  }

  var cookie = request.headers.get('cookie') || '';
  var session = getCookieValue(cookie, 'photobase_session');

  if (session) {
    try {
      var decoded = atob(session);
      var colonIndex = decoded.indexOf(':');
      if (colonIndex !== -1) {
        var user = decoded.slice(0, colonIndex);
        var pass = decoded.slice(colonIndex + 1);
        if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
          return;
        }
      }
    } catch (e) {}
  }

  return Response.redirect(new URL('/manage/login.html', request.url));
}
