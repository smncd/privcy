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
import type { ConsentRecordStore } from './services/consent';

export default class PrivcyController {
  /**
   * All category IDs.
   */
  #categoryIDs: Array<string>;

  #recordStore: ConsentRecordStore;

  #broadcast: BroadcastChannel;

  /**
   * User has not interacted with banner.
   */
  public get isFirstVisit(): boolean {
    return this.#recordStore.consentStatus === undefined;
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
    recordStore: ConsentRecordStore,
  ) {
    this.#categoryIDs = categories.IDs;
    this.#recordStore = recordStore;

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
    const choices: Record<string, boolean> = {};
    for (const id of this.#categoryIDs) choices[id] = categories.includes(id);

    const method =
      categories.length === 0
        ? 'rejected'
        : categories.length === this.#categoryIDs.length
          ? 'allowed'
          : 'customized';

    this.#recordStore.setRecord(choices, method);
    this.loadEmbeds();
  }

  /**
   * Consent to individual category.
   */
  public consentToCategory(category: string): void {
    this.updateConsent([...this.#recordStore.allowedCategories, category]);
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
        !this.#recordStore.allowedCategories.includes(data.category)
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
    const hasFallbackIframe = Array.from(this.controlledElements).some(
      (element) => {
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
          meta?.fallback &&
          !this.#recordStore.allowedCategories.includes(category)
        );
      },
    );

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
    return document.querySelectorAll<HTMLScriptElement | HTMLIFrameElement>(
      `script[${EMBED_ATTRIBUTE}], iframe[${EMBED_ATTRIBUTE}]`,
    );
  }
}
