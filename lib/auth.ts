export function verifyAdminPasscode(req: Request): boolean {
  const expectedKey = process.env.CURATOR_ADMIN_KEY;
  // If not configured in environment, allow by default
  if (!expectedKey) return true;

  const providedKey =
    req.headers.get('x-admin-passcode') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  return providedKey === expectedKey;
}
