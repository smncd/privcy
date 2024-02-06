/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import PrivacyConsentBanner from './lib/privacy-consent-banner';

declare global {
  interface Window {
    PrivacyConsentBanner: typeof PrivacyConsentBanner;
  }
}

window.PrivacyConsentBanner = PrivacyConsentBanner;

export default PrivacyConsentBanner;
