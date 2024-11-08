/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import van from 'vanjs-core';
import banner, { type BannerProps } from './components/banner';
import Categories from './lib/Categories';
import Controller from './lib/Controller';
import { BROADCAST_CHANNEL } from './constants';
import type { i18nStrings } from './types';

import './sass/style.scss';

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
  private _broadcast: BroadcastChannel;

  private _categories: Categories;
  private _controller: Controller;

  private _bannerProps: BannerProps;
  private _banner: HTMLDialogElement;

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

    this._broadcast = new BroadcastChannel(BROADCAST_CHANNEL);

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
    this._bannerProps = {
      controller: this._controller,
      categories: this._categories,
      isCustomizing: van.state(false),
      title: props.title,
      description: props.description,
      strings: this._strings,
    };

    this._banner = banner(this._bannerProps);

    van.add(props.target, this._banner);

    if (this._controller.isFirstVisit) this._banner.showModal();

    this._addBannerOpenEventListener();

    this._broadcast.onmessage = (event) => {
      if (event.data.displayBanner) {
        this.openSettings();
      }
    };
  }

  /**
   * Reload scripts and iframes.
   */
  public reload(): void {
    this._controller.loadEmbeds();
    this._controller.loadIframeFallbacks();
    this._addBannerOpenEventListener();
  }

  /**
   * Open settings.
   */
  public openSettings(): void {
    this._bannerProps.isCustomizing.val = true;
    this._banner.showModal();
  }

  /**
   * Event listener to open banner again.
   */
  private _addBannerOpenEventListener(): void {
    if (this._bannerProps) {
      document
        .querySelectorAll('[data-privcy-display-banner]')
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
