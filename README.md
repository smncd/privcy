Privacy Consent Banner
======================

This is my take on a reactive privacy/cookie consent banner.


⚠️ Here be dragons ⚠️
----------------------

At the time of writing this repo is quite experimental. It works, but could use some work, and more extensive documentation. Use at your own risk.


Installation
------------

To get started, run:

```bash
pnpm add privacy-consent-banner
```

You can then either add the script straight into your HTML:

```html
<script src="path/to/privacy-consent-banner.iife.js"></script>
<script>
  new window.PrivacyConsentBanner({
    title: 'Privacy',
    description: '<p>We have some really nice cookies!</p>',
    categories: {
      analytics: {
        name: 'Analytics',
        description: 'These are analytics cookies',
      },
      social: {
        name: 'Social',
        description: 'These are social cookies',
      },
    },
  });
</script>
```

You can also import it as a module:

```typescript
// index.ts
import PrivacyConsentBanner from 'privacy-consent-banner';

new PrivacyConsentBanner({
  title: 'Privacy',
  description: '<p>We have some really nice cookies!</p>',
  categories: {
    categories: {
      analytics: {
        name: 'Analytics',
        description: 'These are analytics cookies',
      },
      social: {
        name: 'Social',
        description: 'These are social cookies',
      },
    },
  },
});
```


Ownership
---------

Copyright (©) 2023 Simon Lagerlöf

Licensed under the [BSD 3 Clause license](./LICENSE).