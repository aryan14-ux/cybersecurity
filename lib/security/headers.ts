export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "0",
};

export const STRICT_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

export const LAB_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';";

export function getSecurityHeaders(isLabRoute: boolean = false) {
  return {
    ...SECURITY_HEADERS,
    "Content-Security-Policy": isLabRoute ? LAB_CSP : STRICT_CSP,
    ...(isLabRoute ? { "X-Frame-Options": "SAMEORIGIN" } : {}),
  };
}
