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
import { EMBED_ATTRIBUTE } from '../constants';

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
      const source = embed.getAttribute(EMBED_ATTRIBUTE);

      if (typeof source !== 'string') return;

      let data: any;
      try {
        data = JSON.parse(source);
      } catch (error) {
        console.error(error);
        return;
      }

      const newEmbed = embed.cloneNode(true) as typeof embed;

      if (
        typeof data.category !== 'string' ||
        !this.allowedCategories.includes(data.category)
      ) {
        if (
          newEmbed instanceof HTMLIFrameElement &&
          typeof data.fallback === 'string'
        ) {
          newEmbed.src = data.fallback;

          embed.replaceWith(newEmbed);
          return;
        }

        if (newEmbed.src) {
          newEmbed.src = '';
        }

        if (newEmbed instanceof HTMLScriptElement) {
          newEmbed.type = 'text/plain';
        }

        embed.replaceWith(newEmbed);
        return;
      }

      if (typeof data.src === 'string') {
        newEmbed.src = data.src;
      }

      if (newEmbed instanceof HTMLScriptElement) {
        newEmbed.type = 'application/javascript';
      }

      embed.replaceWith(newEmbed);
    });
  }

  /**
   * Populate iframes in case it cannot be loaded.
   */
  public loadIframeFallbacks(): void {
    const hasFallbackIframe = Array.from(
      this.controlledElements,
    ).some((element) => {
      if (!(element instanceof HTMLIFrameElement)) return false;

      const dataPrivcy = element.getAttribute(EMBED_ATTRIBUTE);
      if (!dataPrivcy) return false;

      let meta: any;
      try {
        meta = JSON.parse(dataPrivcy);
      } catch (error) {
        console.error(error);
        return;
      }

      const category = meta?.category;

      return (
        meta?.fallback && !this.allowedCategories.includes(category)
      );
    });

    if (hasFallbackIframe) {
      this.#broadcast.onmessage = (event) => {
        if (
          typeof event.data.allowCategory === 'string' &&
          this.#categoryIDs.includes(event.data.allowCategory)
        ) {
          this.consentToCategory(event.data.allowCategory);
        }
      };
    }
  }

  /**
   * Get all scripts and iframs in DOM.
   */
  #getAllEmbeds(): NodeListOf<HTMLScriptElement | HTMLIFrameElement> {
    return document.querySelectorAll<
      HTMLScriptElement | HTMLIFrameElement
    >(`script[${EMBED_ATTRIBUTE}], iframe[${EMBED_ATTRIBUTE}]`);
  }

  /**
   * Set allowed categories.
   */
  #updateConsentCookies(categories: Array<string>): void {
    for (const category of this.#categoryIDs) {
      this.#setCookie(
        category,
        categories.includes(category) ? 'true' : 'false',
      );
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
