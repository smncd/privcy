/**
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @copyright 2024 Simon Lagerlöf
 * @since @next
 */

import { getCookie, setCookie } from 'typescript-cookie';
import Banner from '../components/Banner.svelte';

export type Categories = Record<
  string,
  {
    name: string;
    description: string;
  }
>;

export type Strings = {
  categories: {
    enable: string;
  };
  buttons: {
    acceptAll: string;
    rejectAll: string;
    customize: string;
    saveSettings: string;
    back: string;
  };
};

type PrivacyConsentBannerProps = {
  title: string;
  description: string;
  categories: Categories;
  strings?: Partial<Strings>;
  cookieName?: string;
};

export default class PrivacyConsentBanner {
  private cookieName: string = 'privacy_consent';

  private title: string = '';
  private description: string = '';
  private categories: Categories = {};
  private categoryIds: Array<string> = [];
  private strings: Strings = {
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

  private banner?: Element;

  constructor(props: PrivacyConsentBannerProps) {
    const status = this.getCookie()?.status;
    const acceptedCategories =
      this.getCookie()?.categories?.filter(
        (category) => category !== '',
      ) ?? null;

    if (
      props.categories &&
      Object.keys(props.categories).length > 0
    ) {
      this.categories = props.categories;
      this.categoryIds.push(...Object.keys(props.categories));
    }

    this.title = props.title;
    this.description = props.description;
    this.strings = {
      categories: {
        ...this.strings?.categories,
        ...props.strings?.categories,
      },
      buttons: {
        ...this.strings?.buttons,
        ...props.strings?.buttons,
      },
    };

    if (props.cookieName) {
      this.cookieName = props.cookieName;
    }

    /**
     * If user already rejected, do nothing.
     */
    if (status === 'reject') {
      this.awaitBannerRequest();

      return;
    }

    /**
     * If user already accepted, load scripts and exit.
     */
    if (
      status === 'accept' &&
      acceptedCategories &&
      acceptedCategories.length > 0
    ) {
      this.loadAllScripts(acceptedCategories);
      this.awaitBannerRequest();

      return;
    }

    console.log(this.strings);

    this.createBanner();
  }

  private createBanner() {
    this.banner = document.createElement('privacy-consent-banner');
    document.body.prepend(this.banner);

    new Banner({
      target: this.banner,
      props: {
        acceptAll: () => this.acceptAll(),
        acceptSelected: (categories) =>
          this.acceptSelected(categories),
        rejectAll: () => this.rejectAll(),
        title: this.title,
        description: this.description,
        categories: this.categories,
        strings: this.strings,
      },
    });
  }

  private acceptAll() {
    this.setCookie('accept', this.categoryIds);
    this.loadAllScripts(this.categoryIds);
    this.banner?.remove();
    this.awaitBannerRequest();
  }

  private acceptSelected(categories: Array<string>) {
    this.setCookie('accept', categories);
    this.unloadAllScripts();
    this.loadAllScripts(categories);
    this.banner?.remove();
    this.awaitBannerRequest();
  }

  private rejectAll() {
    this.setCookie('reject');
    this.unloadAllScripts();
    this.banner?.remove();
    this.awaitBannerRequest();
  }

  private awaitBannerRequest() {
    document
      .querySelector('button#privacy-consent-banner-open')
      ?.addEventListener('click', () => {
        !document.querySelector('privacy-consent-banner') &&
          this.createBanner();
      });
  }

  private getCookie():
    | { status?: 'accept' | 'reject'; categories?: Array<string> }
    | undefined {
    const cookie = getCookie(this.cookieName);

    if (!cookie) return;

    return this.decode(cookie);
  }

  private setCookie(
    status: 'accept' | 'reject',
    categories?: Array<string>,
  ): string {
    const content = this.encode({
      status,
      categories,
    });

    return setCookie(this.cookieName, content, {
      expires: 180,
      sameSite: 'strict',
      secure: true,
    });
  }

  private encode(object: Record<any, any>): string {
    return btoa(JSON.stringify(object));
  }

  private decode(string: string): Record<any, any> {
    return JSON.parse(atob(string));
  }

  /**
   * Load all scripts.
   */
  private loadAllScripts(categories: Array<string>): void {
    this.getAllScripts().forEach((script) => {
      const source = script.getAttribute('data-privacy');

      if (typeof source !== 'string') return;

      const data = JSON.parse(source);

      if (
        typeof data.src !== 'string' ||
        typeof data.category !== 'string' ||
        !categories.includes(data.category)
      )
        return;

      script.src = data.src;
    });
  }

  /**
   * Unload scripts.
   */
  private unloadAllScripts(): void {
    this.getAllScripts().forEach((script) => {
      const src = script.src;

      if (typeof src !== 'string' || src === '') return;

      script.src = '';
    });
  }

  /**
   * Get scripts.
   */
  private getAllScripts(): NodeListOf<HTMLScriptElement> {
    return document.querySelectorAll<HTMLScriptElement>(
      'script[data-privacy], iframe[data-privacy]',
    );
  }
}
