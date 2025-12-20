import { describe, expect, it, vi } from 'vitest';
import reactive from '../../src/lib/reactive';

describe('reactive()', () => {
  describe('value proxy', () => {
    it('should return a proxy that reflects initial values', () => {
      const state = reactive({ count: 0, name: 'test' });

      expect(state.value.count).toBe(0);
      expect(state.value.name).toBe('test');
    });

    it('should allow setting values on the proxy', () => {
      const state = reactive({ count: 0 });

      state.value.count = 5;

      expect(state.value.count).toBe(5);
    });

    it('should handle multiple property changes', () => {
      const state = reactive({ a: 1, b: 2, c: 3 });

      state.value.a = 10;
      state.value.b = 20;
      state.value.c = 30;

      expect(state.value.a).toBe(10);
      expect(state.value.b).toBe(20);
      expect(state.value.c).toBe(30);
    });
  });

  describe('subscribe()', () => {
    it('should notify subscribers when a value changes', async () => {
      const state = reactive({ count: 0 });
      const callback = vi.fn();

      state.subscribe(callback);
      state.value.count = 1;

      // Wait for microtask to flush
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(state.value);
    });

    it('should notify multiple subscribers', async () => {
      const state = reactive({ count: 0 });
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      state.subscribe(callback1);
      state.subscribe(callback2);
      state.value.count = 1;

      await Promise.resolve();

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should batch multiple synchronous changes into one notification', async () => {
      const state = reactive({ count: 0 });
      const callback = vi.fn();

      state.subscribe(callback);

      state.value.count = 1;
      state.value.count = 2;
      state.value.count = 3;

      await Promise.resolve();

      // Should only be called once due to batching
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(state.value);
      expect(state.value.count).toBe(3);
    });

    it('should call callback immediately with initialRun option', () => {
      const state = reactive({ count: 5 });
      const callback = vi.fn();

      state.subscribe(callback, { initialRun: true });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(state.value);
    });

    it('should not call callback immediately without initialRun option', () => {
      const state = reactive({ count: 5 });
      const callback = vi.fn();

      state.subscribe(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call callback immediately with initialRun set to false', () => {
      const state = reactive({ count: 5 });
      const callback = vi.fn();

      state.subscribe(callback, { initialRun: false });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe()', () => {
    it('should stop notifications after unsubscribing', async () => {
      const state = reactive({ count: 0 });
      const callback = vi.fn();

      const { unsubscribe } = state.subscribe(callback);

      state.value.count = 1;
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      state.value.count = 2;
      await Promise.resolve();

      // Should still be 1, not called again
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should only unsubscribe the specific callback', async () => {
      const state = reactive({ count: 0 });
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const sub1 = state.subscribe(callback1);
      state.subscribe(callback2);

      sub1.unsubscribe();

      state.value.count = 1;
      await Promise.resolve();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should handle unsubscribe called multiple times', async () => {
      const state = reactive({ count: 0 });
      const callback = vi.fn();

      const { unsubscribe } = state.subscribe(callback);

      unsubscribe();
      unsubscribe(); // Should not throw

      state.value.count = 1;
      await Promise.resolve();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should work with nested objects', async () => {
      const state = reactive({ user: { name: 'Alice', age: 30 } });
      const callback = vi.fn();

      state.subscribe(callback);

      state.value.user = { name: 'Bob', age: 25 };
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(state.value.user.name).toBe('Bob');
    });

    it('should work with arrays', async () => {
      const state = reactive({ items: [1, 2, 3] });
      const callback = vi.fn();

      state.subscribe(callback);

      state.value.items = [4, 5, 6];
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(state.value.items).toEqual([4, 5, 6]);
    });

    it('should handle setting the same value', async () => {
      const state = reactive({ count: 0 });
      const callback = vi.fn();

      state.subscribe(callback);

      state.value.count = 0; // Same value
      await Promise.resolve();

      // Still notifies (no equality check in implementation)
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle no subscribers', async () => {
      const state = reactive({ count: 0 });

      // Should not throw
      state.value.count = 1;
      await Promise.resolve();

      expect(state.value.count).toBe(1);
    });

    it('should reset pending flag after microtask', async () => {
      const state = reactive({ count: 0 });
      const callback = vi.fn();

      state.subscribe(callback);

      state.value.count = 1;
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);

      // After microtask completes, pending should be reset
      state.value.count = 2;
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should work with empty object', () => {
      const state = reactive({});

      expect(state.value).toEqual({});
    });

    it('should preserve object reference in proxy', () => {
      const original = { count: 0 };
      const state = reactive(original);

      state.value.count = 5;

      // The original object is mutated through the proxy
      expect(original.count).toBe(5);
    });
  });
});
