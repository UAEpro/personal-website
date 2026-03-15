const rateMap = new Map<string, { count: number; resetAt: number }>();

function cleanup() {
  const now = Date.now();
  if (rateMap.size > 1000) {
    for (const [ip, entry] of rateMap) {
      if (now > entry.resetAt) rateMap.delete(ip);
    }
  }
}

export function rateLimit(ip: string, maxRequests = 5, windowMs = 600000): boolean {
  cleanup();
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
