function readAdminToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  return String(request.headers.get("X-Admin-Token") || "").trim();
}

function isAuthorizedAdmin(request, env) {
  const expectedToken = String(env.ADMIN_TOKEN || "").trim();
  const providedToken = readAdminToken(request);
  return Boolean(expectedToken && providedToken && expectedToken === providedToken);
}

export {
  isAuthorizedAdmin
};
