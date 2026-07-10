/**
 * State functionality.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2026 Simon Lagerlöf
 * @since @next
 */

type SubscriberCallback<T> = (data: T) => void;
type SubscriberOptions = {
  initialRun: boolean;
};

export type Subscriber<T> = (
  callback: SubscriberCallback<T>,
  options?: SubscriberOptions,
) => {
  unsubscribe(): void;
};

export type Reactive<T> = {
  value: T;
  subscribe: Subscriber<T>;
};

export function reactive<T extends object>(
  input: T,
): Reactive<T> {
  const subscribers = new Set<SubscriberCallback<T>>();
  let pending = false;

  const value = new Proxy<T>(input, {
    set(target, property, newValue) {
      target[property as keyof T] = newValue;

      if (!pending) {
        pending = true;
        queueMicrotask(() => {
          pending = false;
          for (const sub of subscribers) sub(target);
        });
      }

      return true;
    },
  });

  const subscribe: Subscriber<T> = (callback, options) => {
    if (options?.initialRun) callback(value);
    subscribers.add(callback);

    return {
      unsubscribe: () => subscribers.delete(callback),
    };
  };

  return { value, subscribe };
}
