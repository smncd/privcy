/**
 * State functionality.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2025 Simon Lagerlöf
 * @since @next
 */

type SubscriberCallback<T> = (data: T) => void;

export type Subscriber<T> = (
  callback: SubscriberCallback<T>,
  initialRun?: boolean,
) => {
  unsubscribe(): void;
};

export type State<T> = [T, Subscriber<T>];

export default function state<T extends object>(input: T): State<T> {
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

  const subscribe: Subscriber<T> = (callback, initialRun = false) => {
    if (initialRun) callback(state);

    subscribers.push(callback);

    return {
      unsubscribe() {
        subscribers = subscribers.filter((sub) => sub !== callback);
      },
    };
  };

  return [state, subscribe];
}
