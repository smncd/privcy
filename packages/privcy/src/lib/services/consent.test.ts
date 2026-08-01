import { beforeEach, describe, expect, it, vi } from 'vitest';
import Categories from './categories';
import { ConsentRecordStore } from './consent';

vi.mock('../../src/lib/cookies', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
}));

import { getCookie, setCookie } from '../utils/cookies';

const getCookieMock = vi.mocked(getCookie);
const setCookieMock = vi.mocked(setCookie);

function createCategoriesMock() {
  return new Categories({
    analytics: { name: 'Analytics', description: 'Analytics cookies' },
    social: { name: 'Social', description: 'Social cookies' },
  });
}

describe('ConsentRecordStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is first visit when no cookie', () => {
    getCookieMock.mockReturnValue(undefined);

    const store = new ConsentRecordStore(createCategoriesMock(), 'privcy');

    expect(store.record).toBeNull();
    expect(store.isFirstVisit).toBe(true);
    expect(store.consentStatus).toBeUndefined();
  });

  it('stores record in cookie on setRecord', () => {
    getCookieMock.mockReturnValue(undefined);

    const store = new ConsentRecordStore(createCategoriesMock(), 'privcy');
    store.setRecord({ analytics: true, social: false }, 'customized');

    expect(setCookieMock).toHaveBeenCalledTimes(1);
    expect(setCookieMock.mock.calls[0][0]).toBe('privcy__consent_record');

    const payload = JSON.parse(setCookieMock.mock.calls[0][1]);
    expect(payload.method).toBe('customized');
    expect(payload.choices).toEqual({ analytics: true, social: false });
    expect(typeof payload.hash).toBe('string');
    expect(typeof payload.timestamp).toBe('string');
  });

  it('loads a valid cookie', () => {
    const categories = createCategoriesMock();
    const hash = categories.toHash();

    getCookieMock.mockReturnValue(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        hash,
        choices: { analytics: true, social: false },
        method: 'customized',
      }),
    );

    const store = new ConsentRecordStore(categories, 'privcy');

    expect(store.record).not.toBeNull();
    expect(store.allowedCategories).toEqual(['analytics']);
    expect(store.rejectedCategories).toEqual(['social']);
    expect(store.consentStatus).toBe('customized');
  });

  it('invalidates outdated hash', () => {
    getCookieMock.mockReturnValue(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        hash: 'deadbeef',
        choices: { analytics: true, social: false },
        method: 'customized',
      }),
    );

    const store = new ConsentRecordStore(createCategoriesMock(), 'privcy');

    expect(store.record).toBeNull();
    expect(store.consentStatus).toBeUndefined();
  });

  it('rejects malformed cookie payload', () => {
    getCookieMock.mockReturnValue(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        hash: 'abcd1234',
        // missing choices/method
      }),
    );

    const store = new ConsentRecordStore(createCategoriesMock(), 'privcy');

    expect(store.record).toBeNull();
  });

  it('rejects invalid method', () => {
    const categories = createCategoriesMock();
    const hash = categories.toHash();

    getCookieMock.mockReturnValue(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        hash,
        choices: { analytics: true, social: true },
        method: 'invalid',
      }),
    );

    const store = new ConsentRecordStore(categories, 'privcy');
    expect(store.record).toBeNull();
  });

  it('calls subscribers and supports unsubscribe', () => {
    getCookieMock.mockReturnValue(undefined);

    const store = new ConsentRecordStore(createCategoriesMock(), 'privcy');
    const cb = vi.fn();
    const unsubscribe = store.onUpdate(cb);

    store.setRecord({ analytics: true, social: false }, 'customized');
    expect(cb).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.setRecord({ analytics: false, social: false }, 'rejected');
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
