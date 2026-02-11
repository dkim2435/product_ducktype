const ADMIN_USER_ID = 'd9496186-9916-412c-9364-988d5fe3be44';

export function isAdminUser(userId?: string | null): boolean {
  return !!userId && !!ADMIN_USER_ID && userId === ADMIN_USER_ID;
}

/** Admin gets effective level 100 (MAX) for all unlock checks */
export function getEffectiveLevel(level: number, userId?: string | null): number {
  return isAdminUser(userId) ? 100 : level;
}
