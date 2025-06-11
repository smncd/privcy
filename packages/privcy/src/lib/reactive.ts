/**
 * State functionality.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2025 Simon Lagerlöf
 * @since 0.11.0
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

export type Reactive<T> = [T, Subscriber<T>];

export default function reactive<T extends object>(input: T): Reactive<T> {
  let subscribers: SubscriberCallback<T>[] = [];

  const createProxy = (input: T) =>
    new Proxy<T>(input, {
      get: function (target, p) {
        return target[p as keyof T];
      },
      set: function (target, property, value) {
        try {
          target[property as keyof T] = value;

          for (const subscriber of subscribers) subscriber(target);

          return true;
        } catch {
          return false;
        }
      },
    });

  const state = createProxy(input);

  const subscribe: Subscriber<T> = (callback, options) => {
    if (options?.initialRun) callback(state);

    subscribers.push(callback);

    return {
      unsubscribe() {
        subscribers = subscribers.filter((sub) => sub !== callback);
      },
    };
  };

  return [state, subscribe];
}
