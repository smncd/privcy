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
 * Computes a fast, non-cryptographic 32-bit hash.
 * Returns a fixed 8-char hex string.
 */
export function simpleInsecureHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}
