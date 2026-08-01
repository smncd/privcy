import banner, { type BannerProps } from './components/banner';
import Categories from './services/categories';
import Controller from './services/controller';
import iframeBroadcastChannel from './services/iframe-broadcast-channel';
import { EMBED_ATTRIBUTE } from './constants';
import { type DeepPartial, type ViewState, type i18nStrings } from './types';
import { reactive } from '@privcy/dom';
import { ConsentRecord, ConsentRecordStore } from './services/consent';

export type PrivcyProps = {
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
  strings?: DeepPartial<i18nStrings>;
  cookiePrefix?: string;
};

export class Privcy {
  #broadcast: BroadcastChannel;

  #categories: Categories;
  #recordStore: ConsentRecordStore;
  #controller: Controller;

  #bannerProps: BannerProps;
  #banner: HTMLDialogElement;

  #userStrings?: DeepPartial<i18nStrings>;

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
    this.#recordStore = new ConsentRecordStore(
      this.#categories,
      props.cookiePrefix,
    );
    this.#controller = new Controller(
      props.cookiePrefix ?? 'privcy',
      this.#categories,
      this.#recordStore,
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
    const viewState = reactive<ViewState>({
      view: 'start',
    });

    /**
     * Load banner.
     */
    this.#bannerProps = {
      controller: this.#controller,
      recordStore: this.#recordStore,
      categories: this.#categories,
      viewState,
      title: props.title,
      description: props.description,
      strings: this.#strings,
    };

    this.#banner = banner(this.#bannerProps);

    props.target.appendChild(this.#banner);

    if (this.#recordStore.isFirstVisit) this.#banner.showModal();

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
    this.#bannerProps.viewState.value.view = 'settings';
    this.#banner.showModal();
  }

  /**
   * Run custom actions when the users consent record is updated.
   * Useful in cases where the record needs to be stored for compliance
   * purposes.
   *
   * The user consent record consists of:
   * - timestamp
   * - which categories are allowed/rejected
   * - hash to track category updates
   * - the method used (allow all, reject, customize)
   *
   * @example
   * ```ts
   * const privcy = new Privcy(config);
   *
   * privcy.onConsentRecordChange(async (record) => {
   *  const res = await fetch('/api/consent-record', {
   *    method: 'POST',
   *    body: JSON.stringify(record),
   *  });
   *  // ...
   * });
   * ```
   *
   * @returns A callback function to unsubscribe the callback.
   */
  public onConsentRecordChange(
    cb: (record: ConsentRecord | null) => void | Promise<void>,
  ): () => void {
    return this.#recordStore.onUpdate(cb);
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
