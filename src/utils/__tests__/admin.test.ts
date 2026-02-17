import { describe, it, expect } from 'vitest';
import { isAdminUser, getEffectiveLevel } from '../admin';

const ADMIN_ID = 'd9496186-9916-412c-9364-988d5fe3be44';

describe('isAdminUser', () => {
  it('returns true for admin user ID', () => {
    expect(isAdminUser(ADMIN_ID)).toBe(true);
  });

  it('returns false for non-admin user ID', () => {
    expect(isAdminUser('some-random-uuid')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAdminUser(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAdminUser(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAdminUser('')).toBe(false);
  });
});

describe('getEffectiveLevel', () => {
  it('returns 100 for admin user', () => {
    expect(getEffectiveLevel(5, ADMIN_ID)).toBe(100);
  });

  it('returns actual level for non-admin', () => {
    expect(getEffectiveLevel(42, 'some-user')).toBe(42);
  });

  it('returns actual level when userId is null', () => {
    expect(getEffectiveLevel(10, null)).toBe(10);
  });

  it('returns actual level when userId is undefined', () => {
    expect(getEffectiveLevel(10)).toBe(10);
  });
});
