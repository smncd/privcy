/**
 * Utils.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2025 Simon Lagerlöf
 * @since 0.11.0
 */

import { CLASSNAME_PREFIX } from '../constants';

/**
 * Construct class name separated by '__'.
 */
export function c(...parts: string[]): string {
  parts.unshift(CLASSNAME_PREFIX);
  return parts.join('__');
}

/**
 * Parse html string and remove script tags.
 */
export function parseHtmlString(html: string): string {
  html = html.trim();
  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');

  if (!/<[^>]+>/.test(html)) {
    html = `<p>${html}</p>`;
  }

  return html;
}
