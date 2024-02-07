/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import Privcy from './lib/privcy';

declare global {
  interface Window {
    Privcy: typeof Privcy;
  }
}

if (typeof window !== 'undefined') {
  window.Privcy = Privcy;
}

export default Privcy;
