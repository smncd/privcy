/**
 * Create iframe broadcast channel.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.11.0
 */

import { BROADCAST_CHANNEL } from '../constants';

export default function iframeBroadcastChannel(): BroadcastChannel {
  return new BroadcastChannel(BROADCAST_CHANNEL);
}
