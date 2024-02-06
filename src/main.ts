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
    PrivacyConsentBanner: typeof Privcy;
  }
}

window.PrivacyConsentBanner = Privcy;

export default Privcy;
