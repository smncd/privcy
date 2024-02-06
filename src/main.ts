/**
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @copyright 2024 Simon Lagerlöf
 * @since @next
 */

import PrivacyConsentBanner from './lib/privacy-consent-banner';

declare global {
  interface Window {
    PrivacyConsentBanner: typeof PrivacyConsentBanner;
  }
}

window.PrivacyConsentBanner = PrivacyConsentBanner;

export default PrivacyConsentBanner;
