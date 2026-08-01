import type Categories from './categories';
import { getCookie, setCookie } from '../utils/cookies';

export type ConsentRecordMethod = 'rejected' | 'allowed' | 'customized';

/**
 * Consent record store. Manages the user consent record, a single cookie
 * with attributes describing what the user has consented to and when
 * they did it.
 */
export class ConsentRecordStore {
  #cookiePrefix: string;
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
  #subscribers: Set<(record: ConsentRecord | null) => void> = new Set();

  constructor(categories: Categories, cookiePrefix?: string) {
    this.#categories = categories;
    this.#cookiePrefix = cookiePrefix ?? 'privcy';
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
    return this.#record?.choices[category] === true;
  }

  /**
   * Check if a category is "rejected".
   */
  public isCategoryRejected(category: string): boolean {
    return this.#record?.choices[category] === false;
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
    choices: Record<string, boolean>,
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
  public onUpdate(
    cb: (record: ConsentRecord | null) => void | Promise<void>,
  ): () => void {
    this.#subscribers.add(cb);
    return () => {
      this.#subscribers.delete(cb);
    };
  }

  /**
   * Try to load consent record from storake (cookie).
   */
  public load(): void {
    const raw = getCookie(this.#cookieName);
    if (!raw) {
      this.#record = null;
      return;
    }

    try {
      const { timestamp, hash, choices, method } = JSON.parse(raw);

      if (!timestamp || !hash || !choices || !method) {
        console.warn(
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
        console.warn(
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
        choices,
        method,
      );
    } catch (error) {
      console.warn('[Privcy] Failed to parse consent record cookie', error);
      this.#record = null;
    }
  }

  /**
   * Store the consent record as a cookie.
   */
  public store(): void {
    if (!this.#record) return;

    try {
      setCookie(this.#cookieName, this.#record.toString());
    } catch (error) {
      console.warn('[Privcy] Failed to store consent record cookie', error);
    }
  }

  /**
   * Notify all subscribers. Should be fired when the consent record
   * is set or updated.
   */
  #notify(): void {
    this.#subscribers.forEach((cb) => cb(this.#record));
  }

  /**
   * Prefixed cookie name.
   */
  get #cookieName(): string {
    return `${this.#cookiePrefix}__consent_record`;
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
    public readonly choices: Record<string, boolean>,
    public readonly method: ConsentRecordMethod,
  ) {}

  public toJSON() {
    return {
      timestamp: this.timestamp.toISOString(),
      hash: this.hash,
      choices: this.choices,
      method: this.method,
    };
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}
