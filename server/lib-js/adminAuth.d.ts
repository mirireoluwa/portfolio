export const ADMIN_COOKIE: string;

export function getExpectedAdminToken(password: string): string;

export function verifyAdminCookie(
  cookieHeader: string | undefined,
  password: string | undefined
): boolean;

export function setAdminCookieHeader(token: string): string;

export function clearAdminCookieHeader(): string;
