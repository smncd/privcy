/**
 * State functionality.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2026 Simon Lagerlöf
 */

type SubscriberCallback<T> = (data: T) => void;

type SubscriberOptions = {
  /**
   * Decides if the subscribers should be called a first time, before any state
   * change.
   */
  initialRun: boolean;
};

/**
 * Subscribers will be run whenever the reactive `value` is updated.
 */
export type Subscriber<T> = (
  /**
   * The callback function to be ran on state change.
   * @see {@link SubscriberCallback}
   */
  callback: SubscriberCallback<T>,
  /**
   * Subscriber-specific options.
   * @see {@link SubscriberOptions}
   */
  options?: SubscriberOptions,
) => {
  /**
   * Remove the callback from the list of subscribers.
   */
  unsubscribe(): void;
};

export type Reactive<T> = {
  value: T;
  readonly subscribe: Subscriber<T>;
};

/**
 * Reactive state. Runs subscriber callbacks each time `value` changes.
 * The `value` can be a object, array, or primitive.
 *
 * @example
 * ```ts
 * const state = reactive("Hello world");
 * state.subscribe(value => alert(`State: ${value}`));
 * state.value = "Hello computer!";
 * ```
 */
export function reactive<T extends any>(input: T): Reactive<T> {
  const subscribers = new Set<SubscriberCallback<T>>();
  let pending = false;

  const proxy = (target: Reactive<any>, root = target) =>
    new Proxy(target, {
      get(target, prop) {
        const value = Reflect.get(target, prop);
        return typeof value === 'object' && value !== null
          ? proxy(value, root)
          : value;
      },
      set(target, property, newValue, receiver) {
        if (target === root && property === 'subscribe') {
          throw new TypeError('Cannot override subscribe()');
        }
        Reflect.set(target, property, newValue, receiver);

        if (!pending) {
          pending = true;
          queueMicrotask(() => {
            pending = false;
            for (const sub of subscribers) sub(root.value);
          });
        }

        return true;
      },
    });

  return proxy({
    value: input,
    subscribe(callback, options) {
      if (options?.initialRun) callback(this.value);
      subscribers.add(callback);

      return {
        unsubscribe: () => subscribers.delete(callback),
      };
    },
  });
}
