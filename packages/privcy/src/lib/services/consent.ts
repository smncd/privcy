import type Categories from '../categories';
import { getCookie, setCookie } from '../cookies';

export type ConsentRecordMethod = 'rejected' | 'allowed' | 'customized';

const COOKIE_NAME = 'privcy__consent_record';

export class ConsentRecordStore {
  #categories: Categories;
  #record: ConsentRecord | null = null;
  #subscribers: Array<(record: ConsentRecord | null) => void> = [];

  constructor(categories: Categories) {
    this.#categories = categories;
    this.load();
  }

  public get record(): ConsentRecord | null {
    return this.#record;
  }

  public isCategoryAllowed(category: string): boolean {
    return this.#record?.choices.get(category) === true;
  }

  public isCategoryRejected(category: string): boolean {
    return this.#record?.choices.get(category) === false;
  }

  public get allowedCategories(): Array<string> {
    return this.#categories.IDs.filter((id) => this.isCategoryAllowed(id));
  }

  public get rejectedCategories(): Array<string> {
    return this.#categories.IDs.filter((id) => this.isCategoryRejected(id));
  }

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

  public get isFirstVisit(): boolean {
    return this.consentStatus === undefined;
  }

  public setRecord(
    choices: Map<string, boolean>,
    method: ConsentRecordMethod,
  ): void {
    this.#record = new ConsentRecord(new Date(), 'todo-later', choices, method);

    this.store();
    this.#notify();
  }

  public onUpdate(cb: (record: ConsentRecord | null) => void): () => void {
    this.#subscribers.push(cb);
    return () => {
      this.#subscribers = this.#subscribers.filter((x) => x !== cb);
    };
  }

  public load(): void {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) {
      this.#record = null;
      this.#notify();
      return;
    }

    try {
      const { timestamp, hash, choices, method } = JSON.parse(raw);

      if (!timestamp || !hash || !choices || !method) {
        console.error(
          '[Privcy] Malformed consent record: missing required fields',
        );
        this.#record = null;
        this.#notify();
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
        this.#notify();
        return;
      }

      this.#record = new ConsentRecord(
        new Date(timestamp),
        hash,
        new Map(Object.entries(choices) as Array<[string, boolean]>),
        method,
      );

      this.#notify();
    } catch (error) {
      console.error('[Privcy] Failed to parse consent record cookie', error);
      this.#record = null;
      this.#notify();
    }
  }

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

  #notify(): void {
    this.#subscribers.forEach((cb) => cb(this.#record));
  }
}

export class ConsentRecord {
  constructor(
    public readonly timestamp: Date,
    public readonly hash: string,
    public readonly choices: Map<string, boolean>,
    public readonly method: ConsentRecordMethod,
  ) {}
}
