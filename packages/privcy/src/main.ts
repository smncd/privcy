/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import Banner from './components/Banner.svelte';
import Categories from './lib/Categories';
import Controller from './lib/Controller';
import type { i18nStrings } from './types';

declare global {
  interface Window {
    Privcy: typeof Privcy;
  }
}

type PrivcyProps = {
  target?: Element;
  title: string;
  description: string;
  categories: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
  strings?: Partial<i18nStrings>;
  cookiePrefix?: string;
};

class Privcy {
  private _categories: Categories;
  private _controller: Controller;
  private _banner: Banner;

  private _userStrings?: Partial<i18nStrings>;

  private get _strings(): i18nStrings {
    return {
      categories: {
        enable: 'Enable',
        ...this._userStrings?.categories,
      },
      buttons: {
        acceptAll: 'Accept all',
        rejectAll: 'Reject all',
        customize: 'Customize settings',
        saveSettings: 'Save settings',
        back: 'Back',
        ...this._userStrings?.buttons,
      },
    };
  }

  constructor(props: PrivcyProps) {
    this._userStrings = props.strings;

    this._categories = new Categories(props.categories);
    this._controller = new Controller(
      props.cookiePrefix ?? 'privcy',
      this._categories,
    );

    /**
     * Handle banner target.
     */
    if (!(props.target instanceof Element)) {
      props.target = document.createElement('privcy-banner');
      document.body.prepend(props.target);
    }

    /**
     * Load banner.
     */
    this._banner = new Banner({
      target: props.target,
      props: {
        controller: this._controller,
        categories: this._categories,
        open: this._controller.isFirstVisit,
        title: props.title,
        description: props.description,
        strings: this._strings,
      },
    });

    this._loadIframeFallbacks();
    this._addBannerOpenEventListener();
  }

  /**
   * Reload scripts and iframes.
   */
  public reload(): void {
    this._controller.loadEmbeds();
    this._loadIframeFallbacks();
    this._addBannerOpenEventListener();
  }

  /**
   * Open settings.
   */
  public openSettings(): void {
    this._banner.$set({
      open: true,
      isCustomizing: true,
    });
  }

  /**
   * Event listener to open banner again.
   */
  private _addBannerOpenEventListener(): void {
    if (this._banner) {
      document
        .querySelectorAll('[data-privcy-display-banner]')
        .forEach((button) =>
          button.addEventListener('click', () => {
            this.openSettings();
          }),
        );
    }
  }

  /**
   * Populate iframes in case it cannot be loaded.
   */
  private _loadIframeFallbacks(): void {
    this._controller.controlledElements.forEach((element) => {
      if (!(element instanceof HTMLIFrameElement)) {
        return;
      }

      const meta = JSON.parse(
        element.getAttribute('data-privcy') ?? '',
      );

      const category = meta?.category;

      if (this._controller.allowedCategories.includes(category)) {
        return;
      }

      if (meta?.fallback) {
        const broadcast = new BroadcastChannel(
          'privcy:iframe-fallback',
        );

        broadcast.onmessage = (event) => {
          if (event.data.displayBanner) {
            this.openSettings();
          }

          if (
            typeof event.data.allowCategory === 'string' &&
            this._categories.IDs.includes(event.data.allowCategory)
          ) {
            this._controller.consentToCategory(
              event.data.allowCategory,
            );
          }
        };

        return;
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.Privcy = Privcy;
}

export default Privcy;
