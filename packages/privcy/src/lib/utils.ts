/**
 * Utils.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2025 Simon Lagerlöf
 * @since 0.11.0
 */

import { CLASSNAME_PREFIX } from "../constants"

/**
 * Construct class name separated by '__'
 */
export function c(...parts: string[]): string
{
  parts.unshift(CLASSNAME_PREFIX);
  return parts.join('__')
}
