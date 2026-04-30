const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token"
};

function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(JSON.stringify(body), {
    ...init,
    headers
  });
}

function error(status, message, extra = {}) {
  return json(
    {
      success: false,
      error: message,
      ...extra
    },
    { status }
  );
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export {
  corsHeaders,
  error,
  handleOptions,
  json
};
