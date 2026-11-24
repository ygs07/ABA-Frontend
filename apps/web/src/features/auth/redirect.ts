/**
 * Validates that a `next` redirect parameter is a safe relative internal path
 * and not an external/protocol-relative URL or auth route loop.
 */
export function sanitizeNextPath(rawNext: string | null | undefined): string | null {
  if (!rawNext) return null;
  const trimmed = rawNext.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('/auth/')) return null;
  return trimmed;
}

export function buildAuthHref(
  authPath: '/auth/login' | '/auth/register',
  currentPath?: string | null,
): string {
  const safeNext = sanitizeNextPath(currentPath);
  if (!safeNext || safeNext === '/') return authPath;
  return `${authPath}?next=${encodeURIComponent(safeNext)}`;
}
