/**
 * Create HTMLElement.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2025 Simon Lagerlöf
 * @since 0.11.0
 */

export type TagOptions<K extends keyof HTMLElementTagNameMap> =
  Partial<HTMLElementTagNameMap[K]> & {
    class?: string | string[];
    [key: string]: any;
  };

export type TagChildren = (
  | HTMLCollection
  | HTMLElement
  | string
  | null
)[];

export default function tag<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: TagOptions<K>,
  ...children: TagChildren
): HTMLElementTagNameMap[K] {
  const element = document.createElement<K>(tag);

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (key === 'class') {
        element.classList.add(
          ...(Array.isArray(value) ? value : value.split(' ')),
        );

        continue;
      }

      element.setAttribute(key, value);
    }
  }

  if (children) {
    for (const child of children) {
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (child instanceof HTMLCollection) {
        element.append(...child);
      } else if (typeof child === 'string') {
        element.innerText += child;
      }
    }
  }

  return element;
}
