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

export type TagChildren = (
  | HTMLCollection
  | HTMLElement
  | string
  | null
)[];

/**
 * `tag()` helps construct native-js `HTMLElement`'s. It simplifies creating
 * deep HTML structures, without the `createElement`/`appendChild` soup, and
 * without relying on a full framework.
 *
 * @param tag The HTML tag string (`div`/`h1`/etc) of the element.
 * @param options Any props or attributes the element should have. For example:
 *                ```ts
 *                  const button = tag('button', {
 *                    onclick: () => alert('button clicked!'),
 *                  });
 *                ```
 * @param children Child elements.
 */
export function tag<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: TagOptions<K>,
  ...children: TagChildren
): HTMLElementTagNameMap[K] {
  const element = document.createElement<K>(tag);

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (key === 'class') {
        element.classList.add(
          ...(Array.isArray(value) ? value : value.split(' ')).filter(
            Boolean,
          ),
        );

        continue;
      }

      if (key.startsWith('on') || key in element) {
        (element as any)[key] = value;
      } else {
        element.setAttribute(key, value);
      }
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
