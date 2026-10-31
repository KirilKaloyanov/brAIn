// Typed fetch wrappers for the server API (architecture §2.2).
import type { HealthResponse } from '@brain/shared';

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`GET /api/health failed with ${res.status}`);
  return (await res.json()) as HealthResponse;
}
