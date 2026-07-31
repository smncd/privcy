import { describe, expect, it, beforeEach, vi } from 'vitest';
import Controller from '../../src/lib/controller';
import Categories from '../../src/lib/categories';
import type {
  ConsentRecordMethod,
  ConsentRecordStore,
} from '../../src/lib/consent';

function createCategoriesMock() {
  return new Categories({
    analytics: { name: 'Analytics', description: 'Analytics cookies' },
    social: { name: 'Social', description: 'Social cookies' },
    marketing: { name: 'Marketing', description: 'Marketing cookies' },
  });
}

function createRecordStoreMock(
  overrides?: Partial<ConsentRecordStore>,
): ConsentRecordStore {
  return {
    consentStatus: undefined as ConsentRecordMethod | undefined,
    allowedCategories: [] as string[],
    setRecord: vi.fn(),
    ...overrides,
  } as unknown as ConsentRecordStore;
}

describe('Controller()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    it('creates an instance', () => {
      const controller = new Controller(
        'test',
        createCategoriesMock(),
        createRecordStoreMock(),
      );
      expect(controller).toBeInstanceOf(Controller);
    });

    it('stores cookie prefix', () => {
      const controller = new Controller(
        'myprefix',
        createCategoriesMock(),
        createRecordStoreMock(),
      );
      expect(controller.cookiePrefix).toBe('myprefix');
    });
  });

  describe('isFirstVisit', () => {
    it('returns true when consent status is undefined', () => {
      const store = createRecordStoreMock({ consentStatus: undefined });
      const controller = new Controller('test', createCategoriesMock(), store);
      expect(controller.isFirstVisit).toBe(true);
    });

    it('returns false when consent status is set', () => {
      const store = createRecordStoreMock({ consentStatus: 'allowed' });
      const controller = new Controller('test', createCategoriesMock(), store);
      expect(controller.isFirstVisit).toBe(false);
    });
  });

  describe('updateConsent', () => {
    it('maps choices and method: rejected', () => {
      const store = createRecordStoreMock();
      const controller = new Controller('test', createCategoriesMock(), store);

      controller.updateConsent([]);

      expect(store.setRecord).toHaveBeenCalledWith(
        { analytics: false, social: false, marketing: false },
        'rejected',
      );
    });

    it('maps choices and method: allowed', () => {
      const store = createRecordStoreMock();
      const controller = new Controller('test', createCategoriesMock(), store);

      controller.updateConsent(['analytics', 'social', 'marketing']);

      expect(store.setRecord).toHaveBeenCalledWith(
        { analytics: true, social: true, marketing: true },
        'allowed',
      );
    });

    it('maps choices and method: customized', () => {
      const store = createRecordStoreMock();
      const controller = new Controller('test', createCategoriesMock(), store);

      controller.updateConsent(['analytics']);

      expect(store.setRecord).toHaveBeenCalledWith(
        { analytics: true, social: false, marketing: false },
        'customized',
      );
    });
  });

  describe('consentToCategory', () => {
    it('appends category to allowed categories from store', () => {
      const store = createRecordStoreMock({ allowedCategories: ['analytics'] });
      const controller = new Controller('test', createCategoriesMock(), store);

      controller.consentToCategory('social');

      expect(store.setRecord).toHaveBeenCalledWith(
        { analytics: true, social: true, marketing: false },
        'customized',
      );
    });
  });

  describe('loadEmbeds()', () => {
    it('loads script with allowed category', () => {
      const store = createRecordStoreMock({ allowedCategories: ['analytics'] });

      const script = document.createElement('script');
      script.type = 'text/plain';
      script.setAttribute(
        'data-privcy',
        JSON.stringify({
          category: 'analytics',
          src: 'https://example.com/analytics.js',
        }),
      );
      document.body.appendChild(script);

      const controller = new Controller('test', createCategoriesMock(), store);
      controller.loadEmbeds();

      const updated = document.querySelector('script[data-privcy]') as HTMLScriptElement;
      expect(updated.type).toBe('application/javascript');
      expect(updated.src).toBe('https://example.com/analytics.js');
    });

    it('does not load rejected script', () => {
      const store = createRecordStoreMock({ allowedCategories: [] });

      const script = document.createElement('script');
      script.type = 'text/plain';
      script.setAttribute(
        'data-privcy',
        JSON.stringify({
          category: 'analytics',
          src: 'https://example.com/analytics.js',
        }),
      );
      document.body.appendChild(script);

      const controller = new Controller('test', createCategoriesMock(), store);
      controller.loadEmbeds();

      const updated = document.querySelector('script[data-privcy]') as HTMLScriptElement;
      expect(updated.type).toBe('text/plain');
      expect(updated.src).toBe('');
    });

    it('loads iframe fallback when category is rejected', () => {
      const store = createRecordStoreMock({ allowedCategories: [] });

      const iframe = document.createElement('iframe');
      iframe.setAttribute(
        'data-privcy',
        JSON.stringify({
          category: 'social',
          src: 'https://example.com/social.html',
          fallback: 'https://example.com/fallback.html',
        }),
      );
      document.body.appendChild(iframe);

      const controller = new Controller('test', createCategoriesMock(), store);
      controller.loadEmbeds();

      const updated = document.querySelector('iframe[data-privcy]') as HTMLIFrameElement;
      expect(updated.src).toContain('https://example.com/fallback.html');
    });
  });

  describe('controlledElements', () => {
    it('returns a NodeList', () => {
      const controller = new Controller(
        'test',
        createCategoriesMock(),
        createRecordStoreMock(),
      );
      expect(controller.controlledElements).toBeInstanceOf(NodeList);
    });
  });
});
