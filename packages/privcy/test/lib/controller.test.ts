import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import Controller from '../../src/lib/controller';
import Categories from '../../src/lib/categories';

describe('Controller()', () => {
  const createCategories = (
    data: Record<string, { name: string; description: string }>,
  ) => {
    return new Categories(data);
  };

  const clearCookies = () => {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  beforeEach(() => {
    clearCookies();
  });

  afterEach(() => {
    clearCookies();
  });

  describe('initialization', () => {
    it('should create an instance with categories', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('test', categories);

      expect(controller).toBeInstanceOf(Controller);
    });

    it('should store cookie prefix', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('myprefix', categories);

      expect(controller.cookiePrefix).toBe('myprefix');
    });
  });

  describe('isFirstVisit', () => {
    it('should return true when no consent has been given', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('first', categories);

      expect(controller.isFirstVisit).toBe(true);
    });

    it('should return false after consent is given', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('notfirst', categories);
      controller.consentToCategory('analytics');

      expect(controller.isFirstVisit).toBe(false);
    });
  });

  describe('allowedCategories', () => {
    it('should return empty array when no consent given', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('allowed1', categories);

      expect(controller.allowedCategories).toEqual([]);
    });

    it('should return consented categories', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('allowed2', categories);
      controller.consentToCategory('analytics');

      expect(controller.allowedCategories).toEqual(['analytics']);
    });

    it('should return all categories when all consented', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('allowed3', categories);
      controller.updateConsent(['analytics', 'social']);

      expect(controller.allowedCategories).toEqual([
        'analytics',
        'social',
      ]);
    });
  });

  describe('rejectedCategories', () => {
    it('should return empty array when no consent decisions made', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('rejected1', categories);

      expect(controller.rejectedCategories).toEqual([]);
    });

    it('should return rejected categories', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('rejected2', categories);
      controller.consentToCategory('analytics');

      expect(controller.rejectedCategories).toEqual(['social']);
    });

    it('should return all categories when all rejected', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('rejected3', categories);
      controller.updateConsent([]);

      expect(controller.rejectedCategories).toEqual([
        'analytics',
        'social',
      ]);
    });
  });

  describe('consentStatus', () => {
    it('should return undefined when no consent decisions made', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('status1', categories);

      expect(controller.consentStatus).toBeUndefined();
    });

    it('should return "allowed" when all categories consented', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('status2', categories);
      controller.updateConsent(['analytics', 'social']);

      expect(controller.consentStatus).toBe('allowed');
    });

    it('should return "rejected" when all categories rejected', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('status3', categories);
      controller.updateConsent([]);

      expect(controller.consentStatus).toBe('rejected');
    });

    it('should return "customized" when some categories consented', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('status4', categories);
      controller.consentToCategory('analytics');

      expect(controller.consentStatus).toBe('customized');
    });
  });

  describe('updateConsent', () => {
    it('should set cookies for all categories', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('update1', categories);
      controller.updateConsent(['analytics']);

      expect(document.cookie).toContain(
        'update1__consent___analytics=true',
      );
      expect(document.cookie).toContain(
        'update1__consent___social=false',
      );
    });

    it('should update existing consent', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('update2', categories);
      controller.updateConsent(['analytics']);
      expect(controller.allowedCategories).toEqual(['analytics']);

      controller.updateConsent([]);
      expect(controller.allowedCategories).toEqual([]);
      expect(controller.rejectedCategories).toEqual(['analytics']);
    });
  });

  describe('consentToCategory', () => {
    it('should add category to allowed list', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
      });

      const controller = new Controller('consent1', categories);
      controller.consentToCategory('analytics');

      expect(controller.allowedCategories).toContain('analytics');
    });

    it('should preserve existing consents when adding new one', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
        social: { name: 'Social', description: 'Social cookies' },
        marketing: {
          name: 'Marketing',
          description: 'Marketing cookies',
        },
      });

      const controller = new Controller('consent2', categories);
      controller.consentToCategory('analytics');
      controller.consentToCategory('social');

      expect(controller.allowedCategories).toEqual([
        'analytics',
        'social',
      ]);
    });
  });

  describe('controlledElements', () => {
    it('should return NodeList of controlled elements', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('elements', categories);

      expect(controller.controlledElements).toBeInstanceOf(NodeList);
    });
  });

  describe('cookie handling', () => {
    it('should use correct cookie name format', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('prefix', categories);
      controller.consentToCategory('analytics');

      expect(document.cookie).toContain(
        'prefix__consent___analytics=true',
      );
    });

    it('should set secure cookie attributes', () => {
      const categories = createCategories({
        analytics: {
          name: 'Analytics',
          description: 'Analytics cookies',
        },
      });

      const controller = new Controller('secure', categories);
      controller.consentToCategory('analytics');

      expect(document.cookie).toContain(
        'secure__consent___analytics=true',
      );
    });
  });
});
