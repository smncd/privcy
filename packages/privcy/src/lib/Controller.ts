/**
 * Controller class.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.6.0
 */

import {
  getCookie,
  setCookie,
  removeCookie,
} from 'typescript-cookie';
import type Categories from './Categories';

export default class PrivcyController {
  /**
   * All category IDs.
   */
  private _categoryIDs: Array<string>;

  /**
   * Get all categories user has consented to.
   */
  public get allowedCategories(): Array<string> {
    return this._categoryIDs.filter(
      (category) => this._getCookie(category) === 'true',
    );
  }

  /**
   * Get all categories user has not consented to.
   */
  public get rejectedCategories(): Array<string> {
    return this._categoryIDs.filter(
      (category) => this._getCookie(category) === 'false',
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
        .length !== this._categoryIDs.length
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
  get isFirstVisit(): boolean {
    return this.consentStatus === undefined;
  }

  /**
   * Get all DOM elements controlled by Privcy.
   */
  get controlledElements(): NodeListOf<
    HTMLScriptElement | HTMLIFrameElement
  > {
    return this._getAllEmbeds();
  }

  constructor(
    public cookiePrefix: string,
    categories: Categories,
  ) {
    this._categoryIDs = categories.IDs;

    if (!this.isFirstVisit) {
      this.loadEmbeds();
    }
  }

  /**
   * Update consent.
   */
  public updateConsent(categories: Array<string>): void {
    this._updateConsentCookies(categories);
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
    this._getAllEmbeds().forEach((embed) => {
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
   * Get all scripts and iframs in DOM.
   */
  private _getAllEmbeds(): NodeListOf<
    HTMLScriptElement | HTMLIFrameElement
  > {
    return document.querySelectorAll<
      HTMLScriptElement | HTMLIFrameElement
    >('script[data-privcy], iframe[data-privcy]');
  }

  /**
   * Set allowed categories.
   */
  private _updateConsentCookies(categories: Array<string>): void {
    // Remove all previously set cookies.
    for (const category of this._categoryIDs) {
      this._removeCookie(category);

      if (categories.includes(category)) {
        this._setCookie(category, 'true');
      } else {
        this._setCookie(category, 'false');
      }
    }
  }

  /**
   * Get cookie.
   */
  private _getCookie(name: string): string | undefined {
    return getCookie(this._cookieName(name));
  }

  /**
   * Set cookie with preconfigured settings.
   */
  private _setCookie(name: string, value: 'true' | 'false'): string {
    return setCookie(this._cookieName(name), value, {
      expires: 180,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
  }

  /**
   * Remove cookie.
   */
  private _removeCookie(name: string): void {
    removeCookie(this._cookieName(name));
  }

  /**
   * Cookie name.
   */
  private _cookieName(name: string): string {
    return `${this.cookiePrefix}__consent___${name}`;
  }
}
