/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 * @since 0.0.1
 */

import Banner from './components/Banner.svelte';
import Categories from './lib/Categories';
import Controller from './lib/Controller';

(() => {
  const categories = new Categories({
    analytics: {
      name: 'Analytics',
      description: 'These are analytics cookies',
    },
    social: {
      name: 'Social',
      description: 'These are social cookies',
    },
  });

  const controller = new Controller('privcy', categories);

  const banner = new Banner({
    target: document.body,
    props: {
      controller: controller,
      categories: categories,
      open: controller.isFirstVisit,
      title: 'Privacy',
      description: 'This is a fantastic description',
      strings: {
        categories: {
          enable: 'Enable',
        },
        buttons: {
          acceptAll: 'Accept all',
          rejectAll: 'Reject all',
          customize: 'Customize settings',
          saveSettings: 'Save settings',
          back: 'Back',
        },
      },
    },
  });
})();
