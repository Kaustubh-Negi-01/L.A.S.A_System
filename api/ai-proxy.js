function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch { return Promise.reject(new Error('Invalid JSON body')); }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { message: 'Only POST is supported.' } });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const action = body.action;
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const baseUrl = typeof body.baseUrl === 'string' ? body.baseUrl.trim().replace(/\/+$/, '') : '';

    if (!apiKey || !baseUrl || !/^https?:\/\//i.test(baseUrl)) {
      sendJson(res, 400, { error: { message: 'A valid provider base URL and API key are required.' } });
      return;
    }

    const targetUrl = action === 'models' ? `${baseUrl}/models` : action === 'chat' ? `${baseUrl}/chat/completions` : '';
    if (!targetUrl) {
      sendJson(res, 400, { error: { message: 'Unknown AI proxy action.' } });
      return;
    }

    const upstream = await fetch(targetUrl, {
      method: action === 'models' ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        ...(action === 'chat' ? { 'Content-Type': 'application/json' } : {})
      },
      ...(action === 'chat' ? { body: JSON.stringify(body.payload || {}) } : {})
    });

    const responseText = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.end(responseText || JSON.stringify({ error: { message: `Provider returned HTTP ${upstream.status}.` } }));
  } catch (error) {
    sendJson(res, 502, { error: { message: error instanceof Error ? error.message : 'AI provider request failed.' } });
  }
}
