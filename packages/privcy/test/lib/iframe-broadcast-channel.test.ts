import { describe, expect, it, vi } from 'vitest';
import iframeBroadcastChannel from '../../src/lib/iframe-broadcast-channel';
import { BROADCAST_CHANNEL } from '../../src/constants';

describe('iframeBroadcastChannel()', () => {
  it('should return a BroadcastChannel instance', () => {
    const channel = iframeBroadcastChannel();

    expect(channel).toBeInstanceOf(BroadcastChannel);
    channel.close();
  });

  it('should use the correct channel name', () => {
    const channel = iframeBroadcastChannel();

    expect(channel.name).toBe(BROADCAST_CHANNEL);
    channel.close();
  });

  it('should allow posting messages', () => {
    const channel = iframeBroadcastChannel();

    expect(() => {
      channel.postMessage({ test: 'data' });
    }).not.toThrow();

    channel.close();
  });

  it('should allow setting onmessage handler', () => {
    const channel = iframeBroadcastChannel();
    const handler = vi.fn();

    channel.onmessage = handler;

    expect(channel.onmessage).toBe(handler);

    channel.close();
  });

  it('should allow closing the channel', () => {
    const channel = iframeBroadcastChannel();

    expect(() => {
      channel.close();
    }).not.toThrow();
  });

  it('should create independent channel instances', () => {
    const channel1 = iframeBroadcastChannel();
    const channel2 = iframeBroadcastChannel();

    expect(channel1).not.toBe(channel2);
    expect(channel1.name).toBe(channel2.name);

    channel1.close();
    channel2.close();
  });
});
