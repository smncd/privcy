import { beforeEach, describe, it, expect } from 'vitest';
import { getCookie, setCookie } from './cookies';

describe('cookies utils', () => {
  beforeEach(() => {
    // Reset cookies between tests
    document.cookie
      .split(';')
      .forEach((c) => {
        const eqPos = c.indexOf('=');
        const key = eqPos > -1 ? c.slice(0, eqPos) : c;
        document.cookie = `${key.trim()}=;expires=${new Date(0).toUTCString()};path=/`;
      });
  });

  describe('getCookie', () => {
    it('returns undefined when cookie does not exist', () => {
      expect(getCookie('missing')).toBeUndefined();
    });

    it('returns decoded cookie value when cookie exists', () => {
      document.cookie = 'token=hello%20world';
      expect(getCookie('token')).toBe('hello world');
    });

    it('does not match partial cookie names', () => {
      document.cookie = 'username=john';
      document.cookie = 'user=alice';

      expect(getCookie('user')).toBe('alice');
      expect(getCookie('username')).toBe('john');
    });

    it('returns undefined for empty cookie value', () => {
      document.cookie = 'empty=';
      expect(getCookie('empty')).toBeUndefined();
    });
  });

  describe('setCookie', () => {
    it('sets cookie and returns original value', () => {
      const input = 'abc 123';
      const returned = setCookie('session', input);

      expect(returned).toBe(input);
      expect(getCookie('session')).toBe(input);
    });

    it('stores encoded value in document.cookie string', () => {
      setCookie('prefs', 'a=b c');

      // Validate via read path (decoded back)
      expect(getCookie('prefs')).toBe('a=b c');
    });
  });
});
