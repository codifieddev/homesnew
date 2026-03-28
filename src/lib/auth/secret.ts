export function getAuthSecret() {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    undefined
  );
}

export function isSecureAuthCookie() {
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

  if (!authUrl) {
    return false;
  }

  try {
    return new URL(authUrl).protocol === "https:";
  } catch {
    return false;
  }
}
