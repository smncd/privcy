/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import reactive from './lib/reactive';
import banner, { type BannerProps } from './components/banner';
import Categories from './lib/categories';
import Controller from './lib/controller';
import iframeBroadcastChannel from './lib/iframe-broadcast-channel';
import { EMBED_ATTRIBUTE } from './constants';
import type { i18nStrings } from './types';

import './styles/privcy.css';

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
  #broadcast: BroadcastChannel;

  #categories: Categories;
  #controller: Controller;

  #bannerProps: BannerProps;
  #banner: HTMLDialogElement;

  #userStrings?: Partial<i18nStrings>;

  get #strings(): i18nStrings {
    return {
      categories: {
        enable: 'Enable',
        ...this.#userStrings?.categories,
      },
      buttons: {
        acceptAll: 'Accept all',
        rejectAll: 'Reject all',
        customize: 'Customize settings',
        saveSettings: 'Save settings',
        back: 'Back',
        ...this.#userStrings?.buttons,
      },
    };
  }

  constructor(props: PrivcyProps) {
    this.#userStrings = props.strings;

    this.#broadcast = iframeBroadcastChannel();
    this.#categories = new Categories(props.categories);
    this.#controller = new Controller(
      props.cookiePrefix ?? 'privcy',
      this.#categories,
    );

    /**
     * Handle banner target.
     */
    if (!(props.target instanceof Element)) {
      props.target = document.createElement('privcy-banner');
      document.body.prepend(props.target);
    }

    /**
     * Banner state.
     */
    const viewState = reactive({
      isCustomizing: false,
    });

    /**
     * Load banner.
     */
    this.#bannerProps = {
      controller: this.#controller,
      categories: this.#categories,
      viewState,
      title: props.title,
      description: props.description,
      strings: this.#strings,
    };

    this.#banner = banner(this.#bannerProps);

    props.target.appendChild(this.#banner);

    if (this.#controller.isFirstVisit) this.#banner.showModal();

    this.#addBannerOpenEventListener();

    this.#broadcast.onmessage = (event) => {
      if (event.data.displayBanner) {
        this.openSettings();
      }
    };
  }

  /**
   * Reload scripts and iframes.
   */
  public reload(): void {
    this.#controller.loadEmbeds();
    this.#controller.loadIframeFallbacks();
    this.#addBannerOpenEventListener();
  }

  /**
   * Open settings.
   */
  public openSettings(): void {
    this.#bannerProps.viewState.value.isCustomizing = true;
    this.#banner.showModal();
  }

  /**
   * Event listener to open banner again.
   */
  #addBannerOpenEventListener(): void {
    if (this.#bannerProps) {
      document
        .querySelectorAll(`[${EMBED_ATTRIBUTE}-display-banner]`)
        .forEach((button) =>
          button.addEventListener('click', () => {
            this.openSettings();
          }),
        );
    }
  }
}

if (typeof window !== 'undefined') {
  window.Privcy = Privcy;
}

export default Privcy;
