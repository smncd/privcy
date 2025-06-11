/**
 * Create iframe broadcast channel.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.11.0
 */

export default function iframeBroadcastChannel(): BroadcastChannel {
  return new BroadcastChannel('privcy:iframe-fallback');
}
