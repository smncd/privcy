import { describe, expect, it } from 'vitest';
import { EMBED_ATTRIBUTE, BROADCAST_CHANNEL, CLASSNAME_PREFIX } from '../src/constants';

describe('constants', () => {
  describe('BROADCAST_CHANNEL', () => {
    it('should be defined', () => {
      expect(BROADCAST_CHANNEL).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof BROADCAST_CHANNEL).toBe('string');
    });

    it('should not be empty', () => {
      expect(BROADCAST_CHANNEL.length).toBeGreaterThan(0);
    });
  });

  describe('EMBED_ATTRIBUTE', () => {
    it('should be defined', () => {
      expect(EMBED_ATTRIBUTE).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof EMBED_ATTRIBUTE).toBe('string');
    });

    it('should not be empty', () => {
      expect(EMBED_ATTRIBUTE.length).toBeGreaterThan(0);
    });
  });

  describe('CLASSNAME_PREFIX', () => {
    it('should be defined', () => {
      expect(CLASSNAME_PREFIX).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof CLASSNAME_PREFIX).toBe('string');
    });

    it('should not be empty', () => {
      expect(CLASSNAME_PREFIX.length).toBeGreaterThan(0);
    });
  });
});
