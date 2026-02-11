const ADMIN_USER_ID = 'd9496186-9916-412c-9364-988d5fe3be44';

export function isAdminUser(userId?: string | null): boolean {
  return !!userId && !!ADMIN_USER_ID && userId === ADMIN_USER_ID;
}
