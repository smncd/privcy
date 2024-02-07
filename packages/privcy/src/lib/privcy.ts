/**
 * Main class.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import { getCookie, setCookie } from 'typescript-cookie';
import Banner from '../components/Banner.svelte';
import IframeFallback from '../components/IframeFallback.svelte';
import type { Categories, Strings } from './types';

type Props = {
  title: string;
  description: string;
  categories: Categories;
  strings?: Partial<Strings>;
  cookieName?: string;
};

export default class Privcy {
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

  private get status() {
    return this.getCookie()?.status;
  }
  private get acceptedCategories() {
    return this.getCookie()?.categories?.filter(
      (category) => category !== '',
    );
  }

  constructor(props: Props) {
    if (props.cookieName) {
      this.cookieName = props.cookieName;
    }

    /**
     * Load categories.
     */
    if (
      props.categories &&
      Object.keys(props.categories).length > 0
    ) {
      this.categories = props.categories;
      this.categoryIds.push(...Object.keys(props.categories));
    }

    /**
     * Set props.
     */
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

    /**
     * Load iframe fallback.
     */
    this.iframeFallback();

    /**
     * If user already rejected, do nothing.
     */
    if (this.status === 'reject') {
      this.awaitBannerRequest();

      return;
    }

    /**
     * If user already accepted, load scripts and exit.
     */
    if (
      this.status === 'accept' &&
      this.acceptedCategories &&
      this.acceptedCategories.length > 0
    ) {
      this.loadAllScripts(this.acceptedCategories);
      this.awaitBannerRequest();

      return;
    }

    /**
     * Finally, if applicable. create the banner.
     */
    this.createBanner();
  }

  /**
   * Create banner with Svelte component.
   */
  private createBanner() {
    this.banner = document.createElement('privcy-banner');
    document.body.prepend(this.banner);

    new Banner({
      target: this.banner,
      props: {
        acceptAll: () => this.acceptAll(),
        acceptSelected: (categories) =>
          this.acceptSelected(categories),
        rejectAll: () => this.rejectAll(),
        acceptedCategories: this.acceptedCategories,
        title: this.title,
        description: this.description,
        categories: this.categories,
        strings: this.strings,
      },
    });
  }

  /**
   * Accept everything.
   */
  private acceptAll() {
    this.setCookie('accept', this.categoryIds);
    this.loadAllScripts(this.categoryIds);
    this.banner?.remove();
    this.awaitBannerRequest();
  }

  /**
   * Accept selected categories.
   */
  private acceptSelected(categories: Array<string>) {
    if (categories.length > 0) {
      this.setCookie('accept', categories);
    } else {
      this.setCookie('reject');
    }
    this.unloadAllScripts();
    this.loadAllScripts(categories);
    this.banner?.remove();
    this.awaitBannerRequest();
  }

  /**
   * Reject all categories.
   */
  private rejectAll() {
    this.setCookie('reject');
    this.unloadAllScripts();
    this.banner?.remove();
    this.awaitBannerRequest();
  }

  /**
   * Add event listener to button for opening panel in case it exists.
   */
  private awaitBannerRequest() {
    document
      .querySelector('button#privcy-open')
      ?.addEventListener('click', () => {
        !document.querySelector('privcy-banner') &&
          this.createBanner();
      });
  }

  /**
   * Get cookie.
   */
  private getCookie():
    | { status?: 'accept' | 'reject'; categories?: Array<string> }
    | undefined {
    const cookie = getCookie(this.cookieName);

    if (!cookie) return;

    return this.decode(cookie);
  }

  /**
   * Set cookie with preconfigured settings.
   */
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

  /**
   * Base64 encode JSON object.
   */
  private encode(object: Record<any, any>): string {
    return btoa(JSON.stringify(object));
  }

  /**
   * Decode and parse JSON object from base64 string.
   */
  private decode(string: string): Record<any, any> {
    return JSON.parse(atob(string));
  }

  /**
   * Populate iframe in case it cannot be loaded.
   *
   * @todo Add options to configure content.
   */
  private iframeFallback() {
    this.getAllScripts().forEach((script) => {
      if (script.src) {
        return;
      }

      if (script instanceof HTMLIFrameElement) {
        const iframeDoc =
          script.contentDocument || script.contentWindow?.document;

        if (!(iframeDoc instanceof Document)) {
          return;
        }

        const category = JSON.parse(
          script.getAttribute('data-privcy') ?? '',
        )?.category;

        new IframeFallback({
          target: iframeDoc.body,
          props: {
            categoryName: this.categories[category]?.name,
            buttonCallback: () =>
              !document.querySelector('privcy-banner') &&
              this.createBanner(),
          },
        });
      }
    });
  }

  /**
   * Load all scripts and iframes.
   */
  private loadAllScripts(categories: Array<string>): void {
    this.getAllScripts().forEach((script) => {
      if (script.src) {
        return;
      }

      const source = script.getAttribute('data-privcy');

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
   * Unload scripts and iframes.
   */
  private unloadAllScripts(): void {
    this.getAllScripts().forEach((script) => {
      const src = script.src;

      if (typeof src !== 'string' || src === '') return;

      script.src = '';
    });
  }

  /**
   * Get all scripts and iframs in DOM.
   */
  private getAllScripts(): NodeListOf<
    HTMLScriptElement | HTMLIFrameElement
  > {
    return document.querySelectorAll<
      HTMLScriptElement | HTMLIFrameElement
    >('script[data-privcy], iframe[data-privcy]');
  }
}
