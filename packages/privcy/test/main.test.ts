import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import Privcy from '../src/main';
import { EMBED_ATTRIBUTE } from '../src/constants';

describe('Privcy', () => {
  const clearCookies = () => {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  const clearDOM = () => {
    document.body.innerHTML = '';
  };

  const defaultProps = {
    // The custom 'privcy-banner' element does not work in tests, so we use body as target.
    // TODO: fix this in future to properly test with custom element.
    target: document.body,
    cookiePrefix: 'privcy',
    title: 'Cookie Consent',
    description: 'We use cookies to improve your experience.',
    categories: {
      analytics: {
        name: 'Analytics',
        description: 'Analytics cookies',
      },
      social: { name: 'Social', description: 'Social media cookies' },
    },
  };

  beforeEach(() => {
    clearCookies();
    clearDOM();
  });

  afterEach(() => {
    clearCookies();
    clearDOM();
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      const privcy = new Privcy(defaultProps);

      expect(privcy).toBeInstanceOf(Privcy);
    });

    it('should create a banner element in DOM', () => {
      new Privcy({ ...defaultProps, target: undefined });

      const bannerElement = document.querySelector('privcy-banner');

      expect(bannerElement).not.toBeNull();
    });

    it('should append banner to custom target', () => {
      const target = document.createElement('div');
      target.id = 'custom-target';
      document.body.appendChild(target);

      new Privcy({ ...defaultProps, target });

      const dialog = target.querySelector('dialog');
      expect(dialog).not.toBeNull();
    });

    it('should show modal on first visit', () => {
      new Privcy(defaultProps);

      const dialog = document.querySelector('dialog');
      expect(dialog?.open).toBe(true);
    });

    it('should not show modal if consent already given', () => {
      document.cookie = 'privcy__consent___analytics=true';
      document.cookie = 'privcy__consent___social=false';

      new Privcy(defaultProps);

      const dialog = document.querySelector('dialog');
      expect(dialog?.open).toBe(false);
    });

    it('should use custom cookie prefix', async () => {
      new Privcy({
        ...defaultProps,
        cookiePrefix: 'myapp',
      });

      // Trigger consent to verify prefix is used
      const acceptButton = Array.from(
        document.querySelectorAll('button'),
      ).find((btn) =>
        btn.textContent?.includes('Accept all'),
      ) as HTMLButtonElement;

      acceptButton.click();

      await Promise.resolve(); // Wait for microtask

      expect(document.cookie).toContain('myapp__consent___');
    });

    it('should use default cookie prefix when not provided', () => {
      new Privcy(defaultProps);

      const acceptButton = Array.from(
        document.querySelectorAll('button'),
      ).find((btn) =>
        btn.textContent?.includes('Accept all'),
      ) as HTMLButtonElement;

      acceptButton.click();

      expect(document.cookie).toContain('privcy__consent___');
    });
  });

  describe('custom strings', () => {
    it('should use custom button strings', () => {
      new Privcy({
        ...defaultProps,
        strings: {
          buttons: {
            acceptAll: 'Accept All Cookies',
            rejectAll: 'Reject All Cookies',
            customize: 'Customize Cookies',
            saveSettings: 'Save Cookie Settings',
            back: 'Go Back',
          },
        },
      });

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain('Accept All Cookies');
      expect(banner?.textContent).toContain('Reject All Cookies');
    });

    it('should use custom category strings', async () => {
      new Privcy({
        ...defaultProps,
        strings: {
          categories: {
            enable: 'Activate',
          },
        },
      });

      // Navigate to settings view to see category strings
      const customizeButton = Array.from(
        document.querySelectorAll('button'),
      ).find((btn) =>
        btn.textContent?.includes('Customize settings'),
      ) as HTMLButtonElement;

      customizeButton.click();

      await Promise.resolve(); // Wait for microtask

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain('Activate');
    });

    it('should merge custom strings with defaults', () => {
      new Privcy({
        ...defaultProps,
        strings: {
          buttons: {
            acceptAll: 'Custom Accept',
          },
        },
      });

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain('Custom Accept');
      expect(banner?.textContent).toContain('Reject all'); // Default
    });
  });

  describe('openSettings()', () => {
    it('should open the banner dialog', () => {
      document.cookie = 'privcy__consent___analytics=true';
      document.cookie = 'privcy__consent___social=true';

      const privcy = new Privcy(defaultProps);

      const dialog = document.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      expect(dialog.open).toBe(false);

      privcy.openSettings();

      expect(dialog.open).toBe(true);
    });

    it('should show settings view', async () => {
      document.cookie = 'privcy__consent___analytics=true';
      document.cookie = 'privcy__consent___social=true';

      const privcy = new Privcy(defaultProps);
      privcy.openSettings();

      await Promise.resolve(); // Wait for microtask

      const dialog = document.querySelector('dialog');

      expect(
        dialog?.querySelector('li.privcy__category'),
      ).not.toBeNull();
    });
  });

  describe('reload()', () => {
    it('should reload embeds', () => {
      const script = document.createElement('script');
      script.setAttribute(
        EMBED_ATTRIBUTE,
        JSON.stringify({
          category: 'analytics',
          src: 'https://example.com/script.js',
        }),
      );
      document.body.appendChild(script);

      document.cookie = 'privcy__consent___analytics=true';
      document.cookie = 'privcy__consent___social=true';

      const privcy = new Privcy(defaultProps);
      privcy.reload();

      const updatedScript = document.querySelector(
        `script[${EMBED_ATTRIBUTE}]`,
      ) as HTMLScriptElement;
      expect(updatedScript.src).toContain(
        'https://example.com/script.js',
      );
    });

    it('should re-add banner open event listeners', () => {
      document.cookie = 'privcy__consent___analytics=true';
      document.cookie = 'privcy__consent___social=true';

      const privcy = new Privcy(defaultProps);

      // Add a button dynamically
      const button = document.createElement('button');
      button.setAttribute(`${EMBED_ATTRIBUTE}-display-banner`, '');
      document.body.appendChild(button);

      privcy.reload();

      const dialog = document.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      dialog.close();

      button.click();

      expect(dialog.open).toBe(true);
    });
  });

  describe('banner open button', () => {
    it('should open settings when display-banner button is clicked', () => {
      document.cookie = 'privcy__consent___analytics=true';
      document.cookie = 'privcy__consent___social=true';

      const button = document.createElement('button');
      button.setAttribute(`${EMBED_ATTRIBUTE}-display-banner`, '');
      document.body.appendChild(button);

      new Privcy(defaultProps);

      const dialog = document.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      expect(dialog.open).toBe(false);

      button.click();

      expect(dialog.open).toBe(true);
    });
  });

  describe('window.Privcy', () => {
    it('should expose Privcy on window', () => {
      expect(window.Privcy).toBe(Privcy);
    });
  });

  describe('banner content', () => {
    it('should display title', () => {
      new Privcy(defaultProps);

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain('Cookie Consent');
    });

    it('should display description', () => {
      new Privcy(defaultProps);

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain(
        'We use cookies to improve your experience.',
      );
    });

    it('should display category names', async () => {
      new Privcy(defaultProps);

      // Navigate to settings
      const customizeButton = Array.from(
        document.querySelectorAll('button'),
      ).find((btn) =>
        btn.textContent?.includes('Customize settings'),
      ) as HTMLButtonElement;

      customizeButton.click();

      await Promise.resolve(); // Wait for microtask

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain('Analytics');
      expect(banner?.textContent).toContain('Social');
    });

    it('should display category descriptions', async () => {
      const privcy = new Privcy(defaultProps);

      // Navigate to settings
      const customizeButton = Array.from(
        document.querySelectorAll('button'),
      ).find((btn) =>
        btn.textContent?.includes('Customize settings'),
      ) as HTMLButtonElement;

      customizeButton.click();

      await Promise.resolve(); // Wait for microtask

      const banner = document.querySelector('dialog');
      expect(banner?.textContent).toContain('Analytics cookies');
      expect(banner?.textContent).toContain('Social media cookies');
    });
  });
});
