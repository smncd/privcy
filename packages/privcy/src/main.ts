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

    this._banner = new Banner({
      target: document.body,
      props: {
        controller: this._controller,
        categories: this._categories,
        open: this._controller.isFirstVisit,
        title: props.title,
        description: props.description,
        strings: this._strings,
      },
    });
  }
}

if (typeof window !== 'undefined') {
  window.Privcy = Privcy;
}

export default Privcy;
