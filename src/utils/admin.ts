const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID || '';

export function isAdminUser(userId?: string | null): boolean {
  return !!userId && !!ADMIN_USER_ID && userId === ADMIN_USER_ID;
}
