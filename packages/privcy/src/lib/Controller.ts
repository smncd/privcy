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
    return this._getAllScripts();
  }

  constructor(
    public cookiePrefix: string,
    categories: Categories,
  ) {
    this._categoryIDs = categories.IDs;

    if (!this.isFirstVisit) {
      this._loadScripts();
    }
  }

  /**
   * Update consent.
   */
  public updateConsent(categories: Array<string>): void {
    this._updateConsentCookies(categories);
    this._loadScripts();
  }

  /**
   * Load all scripts and iframes.
   */
  private _loadScripts(): void {
    this._getAllScripts().forEach((script) => {
      const source = script.getAttribute('data-privcy');

      if (typeof source !== 'string') return;

      const data = JSON.parse(source);

      if (
        typeof data.category !== 'string' ||
        !this.allowedCategories.includes(data.category)
      ) {
        if (script.src) {
          script.src = '';
        }

        if (script instanceof HTMLScriptElement) {
          script.type = 'text/plain';
        }

        return;
      }

      if (typeof data.src === 'string') {
        script.src = data.src;
      }

      if (script instanceof HTMLScriptElement) {
        script.type = 'application/javascript';

        /**
         * For some reason this is required for the script to execute?
         */
        script.innerText = script.innerText;
      }
    });
  }

  /**
   * Get all scripts and iframs in DOM.
   */
  private _getAllScripts(): NodeListOf<
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
    return removeCookie(this._cookieName(name));
  }

  /**
   * Cookie name.
   */
  private _cookieName(name: string): string {
    return `${this.cookiePrefix}__consent___${name}`;
  }
}
