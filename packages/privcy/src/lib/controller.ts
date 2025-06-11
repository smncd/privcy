/**
 * Controller class.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.6.0
 */

import iframeBroadcastChannel from './iframe-broadcast-channel';
import type Categories from './categories';

export default class PrivcyController {
  /**
   * All category IDs.
   */
  #categoryIDs: Array<string>;

  #broadcast: BroadcastChannel;

  /**
   * Get all categories user has consented to.
   */
  public get allowedCategories(): Array<string> {
    return this.#categoryIDs.filter(
      (category) => this.#getCookie(category) === 'true',
    );
  }

  /**
   * Get all categories user has not consented to.
   */
  public get rejectedCategories(): Array<string> {
    return this.#categoryIDs.filter(
      (category) => this.#getCookie(category) === 'false',
    );
  }

  /**
   * Get overall consent status.
   */
  public get consentStatus():
    | 'rejected'
    | 'allowed'
    | 'customized'
    | undefined {
    const hasRejected = this.rejectedCategories.length > 0;
    const hasAllowed = this.allowedCategories.length > 0;

    /**
     * Make sure that user has made choice for all available
     * categories.
     */
    if (
      [...this.rejectedCategories, ...this.allowedCategories]
        .length !== this.#categoryIDs.length
    ) {
      return;
    }

    if (hasRejected && !hasAllowed) {
      return 'rejected';
    } else if (hasAllowed && !hasRejected) {
      return 'allowed';
    } else if (hasAllowed && hasRejected) {
      return 'customized';
    }
  }

  /**
   * User has not interacted with banner.
   */
  public get isFirstVisit(): boolean {
    return this.consentStatus === undefined;
  }

  /**
   * Get all DOM elements controlled by Privcy.
   */
  public get controlledElements(): NodeListOf<
    HTMLScriptElement | HTMLIFrameElement
  > {
    return this.#getAllEmbeds();
  }

  constructor(
    public cookiePrefix: string,
    categories: Categories,
  ) {
    this.#categoryIDs = categories.IDs;

    this.#broadcast = iframeBroadcastChannel();

    if (!this.isFirstVisit) {
      this.loadEmbeds();
    }

    this.loadIframeFallbacks();
  }

  /**
   * Update consent.
   */
  public updateConsent(categories: Array<string>): void {
    this.#updateConsentCookies(categories);
    this.loadEmbeds();
  }

  /**
   * Consent to individual category.
   */
  public consentToCategory(category: string): void {
    this.updateConsent([...this.allowedCategories, category]);
  }

  /**
   * Load all scripts and iframes.
   */
  public loadEmbeds(): void {
    this.#getAllEmbeds().forEach((embed) => {
      const source = embed.getAttribute('data-privcy');

      if (typeof source !== 'string') return;

      const data = JSON.parse(source);

      if (
        typeof data.category !== 'string' ||
        !this.allowedCategories.includes(data.category)
      ) {
        if (
          embed instanceof HTMLIFrameElement &&
          typeof data.fallback === 'string'
        ) {
          embed.src = data.fallback;

          return;
        }

        if (embed.src) {
          embed.src = '';
        }

        if (embed instanceof HTMLScriptElement) {
          embed.type = 'text/plain';
        }

        return;
      }

      if (typeof data.src === 'string') {
        embed.src = data.src;
      }

      if (embed instanceof HTMLScriptElement) {
        embed.type = 'application/javascript';

        /**
         * For some reason this is required for the script to execute?
         */
        embed.innerText = embed.innerText;
      }
    });
  }

  /**
   * Populate iframes in case it cannot be loaded.
   */
  public loadIframeFallbacks(): void {
    this.controlledElements.forEach((element) => {
      if (!(element instanceof HTMLIFrameElement)) {
        return;
      }

      const meta = JSON.parse(
        element.getAttribute('data-privcy') ?? '',
      );

      const category = meta?.category;

      if (this.allowedCategories.includes(category)) {
        return;
      }

      if (meta?.fallback) {
        this.#broadcast.onmessage = (event) => {
          if (
            typeof event.data.allowCategory === 'string' &&
            this.#categoryIDs.includes(event.data.allowCategory)
          ) {
            this.consentToCategory(event.data.allowCategory);
          }
        };

        return;
      }
    });
  }

  /**
   * Get all scripts and iframs in DOM.
   */
  #getAllEmbeds(): NodeListOf<HTMLScriptElement | HTMLIFrameElement> {
    return document.querySelectorAll<
      HTMLScriptElement | HTMLIFrameElement
    >('script[data-privcy], iframe[data-privcy]');
  }

  /**
   * Set allowed categories.
   */
  #updateConsentCookies(categories: Array<string>): void {
    // Remove all previously set cookies.
    for (const category of this.#categoryIDs) {
      this.#removeCookie(category);

      if (categories.includes(category)) {
        this.#setCookie(category, 'true');
      } else {
        this.#setCookie(category, 'false');
      }
    }
  }

  /**
   * Get cookie.
   */
  #getCookie(name: string): string | undefined {
    return document.cookie
      .split(';')
      .find((cookie) =>
        cookie.trim().startsWith(this.#cookieName(name) + '='),
      )
      ?.split('=')
      .pop();
  }

  /**
   * Set cookie with preconfigured settings.
   */
  #setCookie(name: string, value: 'true' | 'false'): string {
    document.cookie = `${this.#cookieName(name)}=${value}; expires=${new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=strict; Secure; path=/;`;

    return value;
  }

  /**
   * Remove cookie.
   */
  #removeCookie(name: string): void {
    document.cookie = `${this.#cookieName(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Cookie name.
   */
  #cookieName(name: string): string {
    return `${this.cookiePrefix}__consent___${name}`;
  }
}
