import { ZwiftAPI } from '@codingwithspike/zwift-api-wrapper';

const reply = (statusCode, data) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(data),
});

// Read-only probe. Credentials/tokens and upstream response bodies are never logged or returned.
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); }
  catch { return reply(400, { error: 'Invalid request' }); }
  if (!input || typeof input.email !== 'string' || !input.email ||
      typeof input.password !== 'string' || !input.password) {
    return reply(400, { error: 'Login required' });
  }

  let token;
  try {
    const api = new ZwiftAPI(input.email, input.password);
    token = await api.authenticate();
  } catch {
    return reply(401, { outcome: 'login_failed' });
  }
  if (!token?.access_token) return reply(502, { outcome: 'missing_token' });

  try {
    const response = await fetch(
      'https://us-or-rly101.zwift.com/api/player-profile/user-game-storage/attributes?n=24',
      {
        method: 'GET',
        redirect: 'error',
        headers: {
          Authorization: 'Bearer ' + token.access_token,
          Accept: 'application/x-protobuf-lite',
          Platform: 'OSX',
          Source: 'Game Client',
          'User-Agent': 'CNL/3.30.8 (macOS 13 Ventura; Darwin Kernel 22.4.0) zwift/1.0.110983 curl/7.78.0',
        },
        signal: AbortSignal.timeout(15000),
      },
    );
    const data = await response.arrayBuffer();
    return reply(200, {
      upstreamStatus: response.status,
      outcome: response.status === 403 ? 'forbidden'
        : response.status === 401 ? 'unauthorized'
        : response.ok ? (data.byteLength ? 'received_unverified' : 'empty')
        : 'upstream_error',
      bytes: data.byteLength,
      contentType: response.headers.get('content-type') || '',
    });
  } catch {
    return reply(502, { outcome: 'network_error' });
  }
};
