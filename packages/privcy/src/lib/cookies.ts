/**
 * Get cookie.
 */
export function getCookie(name: string): string | undefined {
  const value = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith(name + '='))
    ?.split('=')
    .pop();

  if (value) return decodeURIComponent(value);
}

/**
 * Set cookie with preconfigured settings.
 */
export function setCookie(name: string, value: string): string {
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=strict; Secure; path=/;`;

  return value;
}
