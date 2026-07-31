import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { reactive } from '@privcy/dom';
import banner from '../../src/components/banner';
import Controller from '../../src/lib/controller';
import Categories from '../../src/lib/categories';
import type { ViewState, i18nStrings } from '../../src/types';
import type {
  ConsentRecordMethod,
  ConsentRecordStore,
} from '../../src/lib/consent';

describe('banner()', () => {
  const clearDOM = () => {
    document.body.innerHTML = '';
  };

  const defaultStrings: i18nStrings = {
    categories: {
      enable: 'Enable',
    },
    buttons: {
      acceptAll: 'Accept all',
      rejectAll: 'Reject all',
      customize: 'Customize settings',
      saveSettings: 'Save settings',
      back: 'Back',
    },
  };

  const createRecordStoreMock = (
    overrides: Partial<ConsentRecordStore> = {},
  ): ConsentRecordStore =>
    ({
      consentStatus: undefined as ConsentRecordMethod | undefined,
      allowedCategories: [] as string[],
      setRecord: vi.fn(),
      onUpdate: vi.fn(() => () => {}),
      ...overrides,
    }) as unknown as ConsentRecordStore;

  const createBannerProps = (overrides = {}) => {
    const categories = new Categories({
      analytics: {
        name: 'Analytics',
        description: 'Analytics cookies',
      },
      social: { name: 'Social', description: 'Social media cookies' },
    });

    const recordStore = createRecordStoreMock();
    const controller = new Controller('test', categories, recordStore);
    vi.spyOn(controller, 'updateConsent');

    const viewState = reactive<ViewState>({ view: 'start' });

    return {
      controller,
      recordStore,
      categories,
      viewState,
      title: 'Cookie Consent',
      description: 'We use cookies to improve your experience.',
      strings: defaultStrings,
      ...overrides,
    };
  };

  beforeEach(() => {
    clearDOM();
  });

  afterEach(() => {
    clearDOM();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should create a dialog element', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      expect(dialogElement).toBeInstanceOf(HTMLDialogElement);
    });

    it('should contain the title', () => {
      const props = createBannerProps({ title: 'My Custom Title' });
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('My Custom Title');
    });

    it('should contain the description', () => {
      const props = createBannerProps({
        description: 'Custom description text',
      });
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('Custom description text');
    });
  });

  describe('start view', () => {
    it('should show accept all button', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('Accept all');
    });

    it('should show reject all button', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('Reject all');
    });

    it('should show customize button', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('Customize settings');
    });

    it('should accept all cookies when accept button clicked', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);
      document.body.appendChild(dialogElement);

      const acceptButton = dialogElement.querySelector(
        '[buttonType="acceptAll"]',
      );
      acceptButton?.dispatchEvent(new Event('click'));

      expect(props.controller.updateConsent).toHaveBeenCalledWith(
        props.categories.IDs,
      );
    });

    it('should reject all cookies when reject button clicked', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);
      document.body.appendChild(dialogElement);

      const rejectButton = dialogElement.querySelector(
        '[buttonType="rejectAll"]',
      );
      rejectButton?.dispatchEvent(new Event('click'));

      expect(props.controller.updateConsent).toHaveBeenCalledWith([]);
    });

    it('should switch to settings view when customize button clicked', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);
      document.body.appendChild(dialogElement);

      const customizeButton = dialogElement.querySelector(
        '[buttonType="customize"]',
      );
      customizeButton?.dispatchEvent(new Event('click'));

      expect(props.viewState.value.view).toBe('settings');
    });
  });

  describe('settings view', () => {
    it('should display category names', async () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      expect(dialogElement.textContent).toContain('Analytics');
      expect(dialogElement.textContent).toContain('Social');
    });

    it('should display category descriptions', async () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      expect(dialogElement.textContent).toContain('Analytics cookies');
      expect(dialogElement.textContent).toContain('Social media cookies');
    });

    it('should show save settings button', () => {
      const props = createBannerProps();
      props.viewState.value.view = 'settings';
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('Save settings');
    });

    it('should show back button', async () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      expect(dialogElement.textContent).toContain('Back');
    });

    it('should switch back to start view when back button clicked', async () => {
      const props = createBannerProps();
      const dialogElement = banner(props);
      document.body.appendChild(dialogElement);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      const backButton = Array.from(
        dialogElement.querySelectorAll('button'),
      ).find((btn) => btn.textContent?.includes('Back')) as HTMLButtonElement;

      backButton.click();
      expect(props.viewState.value.view).toBe('start');
    });

    it('should have toggles for each category', async () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      const toggles = dialogElement.querySelectorAll('input[type="checkbox"]');
      expect(toggles.length).toBe(2);
    });

    it('should pre-check allowed categories from recordStore', async () => {
      const props = createBannerProps({
        recordStore: createRecordStoreMock({
          allowedCategories: ['analytics'],
        }),
      });
      const dialogElement = banner(props);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      const checkboxes = dialogElement.querySelectorAll(
        'input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>;

      // based on category definition order
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(false);
    });

    it('should save selected categories when save button clicked', async () => {
      const props = createBannerProps();
      const dialogElement = banner(props);
      document.body.appendChild(dialogElement);

      props.viewState.value.view = 'settings';
      await Promise.resolve();

      const checkboxes = dialogElement.querySelectorAll(
        'input[type="checkbox"]',
      );
      const analyticsToggle = checkboxes[0] as HTMLInputElement;

      analyticsToggle.click();

      const saveButton = Array.from(
        dialogElement.querySelectorAll('button'),
      ).find((btn) =>
        btn.textContent?.includes('Save settings'),
      ) as HTMLButtonElement;

      saveButton.click();

      expect(props.controller.updateConsent).toHaveBeenCalledWith([
        'analytics',
      ]);
    });
  });

  describe('custom strings', () => {
    it('should use custom accept all text', () => {
      const customStrings = {
        ...defaultStrings,
        buttons: {
          ...defaultStrings.buttons,
          acceptAll: 'Accept Everything',
        },
      };
      const props = createBannerProps({ strings: customStrings });
      const dialogElement = banner(props);

      expect(dialogElement.textContent).toContain('Accept Everything');
    });

    it('should use custom enable text', async () => {
      const customStrings = {
        ...defaultStrings,
        categories: {
          enable: 'Activate',
        },
      };
      const props = createBannerProps({ strings: customStrings });
      props.viewState.value.view = 'settings';
      const dialogElement = banner(props);

      await Promise.resolve();

      expect(dialogElement.textContent).toContain('Activate');
    });
  });

  describe('accessibility', () => {
    it('should be a dialog element', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      expect(dialogElement.tagName.toLowerCase()).toBe('dialog');
    });

    it('should have focusable buttons', () => {
      const props = createBannerProps();
      const dialogElement = banner(props);

      const buttons = dialogElement.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button.tabIndex).not.toBe(-1);
      });
    });
  });
});
