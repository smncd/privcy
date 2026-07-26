import type Categories from '../categories';
import { getCookie, setCookie } from '../cookies';

export type ConsentRecordMethod = 'rejected' | 'allowed' | 'customized';

const COOKIE_NAME = 'privcy__consent_record';

/**
 * Consent record store. Manages the user consent record, a single cookie
 * with attributes describing what the user has consented to and when
 * they did it.
 */
export class ConsentRecordStore {
  /**
   * The available categories (including display data).
   */
  #categories: Categories;
  /**
   * The consent record instance.
   */
  #record: ConsentRecord | null = null;
  /**
   * Subscribers to update events.
   */
  #subscribers: Array<(record: ConsentRecord | null) => void> = [];

  constructor(categories: Categories) {
    this.#categories = categories;
    this.load();
  }

  /**
   * The readonly consent record.
   */
  public get record(): ConsentRecord | null {
    return this.#record;
  }

  /**
   * Check if a category is "allowed".
   */
  public isCategoryAllowed(category: string): boolean {
    return this.#record?.choices.get(category) === true;
  }

  /**
   * Check if a category is "rejected".
   */
  public isCategoryRejected(category: string): boolean {
    return this.#record?.choices.get(category) === false;
  }

  /**
   * List of allowed category IDs.
   */
  public get allowedCategories(): Array<string> {
    return this.#categories.IDs.filter((id) => this.isCategoryAllowed(id));
  }

  /**
   * List of rejected category IDs.
   */
  public get rejectedCategories(): Array<string> {
    return this.#categories.IDs.filter((id) => this.isCategoryRejected(id));
  }

  /**
   * The consent status `rejected`, `allowed`, `customized`.
   */
  public get consentStatus(): ConsentRecordMethod | undefined {
    const hasRejected = this.rejectedCategories.length > 0;
    const hasAllowed = this.allowedCategories.length > 0;

    if (
      [...this.rejectedCategories, ...this.allowedCategories].length !==
      this.#categories.IDs.length
    ) {
      return;
    }

    if (hasRejected && !hasAllowed) return 'rejected';
    if (hasAllowed && !hasRejected) return 'allowed';
    if (hasAllowed && hasRejected) return 'customized';
  }

  /**
   * If the user is visiting for the first time (no stored consent record).
   */
  public get isFirstVisit(): boolean {
    return this.consentStatus === undefined;
  }

  /**
   * Set and store the consent record.
   */
  public setRecord(
    choices: Map<string, boolean>,
    method: ConsentRecordMethod,
  ): void {
    this.#record = new ConsentRecord(
      new Date(),
      this.#categories.toHash(),
      choices,
      method,
    );

    this.store();
    this.#notify();
  }

  /**
   * Runs whenever the consent record is updated.
   * Useful in cases where you need to store the user's consent record.
   */
  public onUpdate(cb: (record: ConsentRecord | null) => void): () => void {
    this.#subscribers.push(cb);
    return () => {
      this.#subscribers = this.#subscribers.filter((x) => x !== cb);
    };
  }

  /**
   * Try to load consent record from storake (cookie).
   */
  public load(): void {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) {
      this.#record = null;
      return;
    }

    try {
      const { timestamp, hash, choices, method } = JSON.parse(raw);

      if (!timestamp || !hash || !choices || !method) {
        console.error(
          '[Privcy] Malformed consent record: missing required fields',
        );
        this.#record = null;
        return;
      }

      if (
        method !== 'rejected' &&
        method !== 'allowed' &&
        method !== 'customized'
      ) {
        console.error(
          '[Privcy] Malformed consent record: invalid method',
          method,
        );
        this.#record = null;
        return;
      }

      if (hash !== this.#categories.toHash()) {
        console.debug('[Privcy] consent record is outdated');
        this.#record = null;
        return;
      }

      this.#record = new ConsentRecord(
        new Date(timestamp),
        hash,
        new Map(Object.entries(choices) as Array<[string, boolean]>),
        method,
      );
    } catch (error) {
      console.error('[Privcy] Failed to parse consent record cookie', error);
      this.#record = null;
    }
  }

  /**
   * Store the consent record as a cookie.
   */
  public store(): void {
    if (!this.#record) return;

    try {
      setCookie(
        COOKIE_NAME,
        JSON.stringify({
          timestamp: this.#record.timestamp.toISOString(),
          hash: this.#record.hash,
          choices: Object.fromEntries(this.#record.choices),
          method: this.#record.method,
        }),
      );
    } catch (error) {
      console.error('[Privcy] Failed to store consent record cookie', error);
    }
  }

  /**
   * Notify all subscribers. Should be fired when the consent record
   * is set or updated.
   */
  #notify(): void {
    this.#subscribers.forEach((cb) => cb(this.#record));
  }
}

/**
 * Consent record.
 * A anonymous record of:
 * - What the user consented to.
 * - When they did it.
 * - What method (allow all, reject, etc).
 */
export class ConsentRecord {
  constructor(
    public readonly timestamp: Date,
    public readonly hash: string,
    public readonly choices: Map<string, boolean>,
    public readonly method: ConsentRecordMethod,
  ) {}
}
