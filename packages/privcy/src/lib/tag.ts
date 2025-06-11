/**
 * Create HTMLElement.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2025 Simon Lagerlöf
 * @since @next
 */

export type TagOptions<K extends keyof HTMLElementTagNameMap> =
  Partial<HTMLElementTagNameMap[K]> & {
    class?: string | string[];
    [key: string]: any;
  };

export type TagChildren = (HTMLElement | string | null)[];

export default function tag<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: TagOptions<K>,
  ...children: TagChildren
): HTMLElementTagNameMap[K] {
  const element = document.createElement<K>(tag);

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (key === 'class') {
        for (const cls of value.split(' ')) {
          element.classList.add(cls);
        }

        continue;
      }

      element[key as keyof typeof element] = value;
    }
  }

  if (children) {
    for (const child of children) {
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (typeof child === 'string') {
        element.innerText += child;
      }
    }
  }

  return element;
}
