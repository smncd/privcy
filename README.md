## [![Privcy](./banner.jpg)](https://privcy.smn.codes)

This is my take on a reactive privacy/cookie consent banner.


⚠️ Here be dragons ⚠️
----------------------

At the time of writing this repo is quite experimental. It works, but could use some work, and more extensive documentation. Use at your own risk.


Installation
------------

To get started, run:

```bash
pnpm add privcy
```

You can then either add the script straight into your HTML in a script tag:

```html
<script src="https://unpkg.com/privcy@latest/dist/privcy.iife.js"></script>
<script>
  new window.Privcy({
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
import Privcy from 'privcy';

new Privcy({
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

Then, the scripts you want to control need to be modified with the `data-privcy` tag:

```html
<script
  data-privcy='{
    "category": "analytics",
    "src": "/path/to/script.js"
  }'
></script>
```

This also works with iframes:

```html
<iframe
  data-privcy='{
    "category": "social",
    "src": "https://example.com"
  }'
></iframe>
```

To control a inline script, you can omit the `src` key in `data-privcy`, but you need to make sure that the script type is set to `plain/text`:

```html
<script
  data-privcy='{
    "category": "social"
  }'
  type="plain/text"
>
  console.log('Hello World!')
</script>
```

Iframe Fallbacks
----------------

In cases where a iframe's category is rejected by the user, we sometimes want to display a informational popup alerting the user that the content is not available.

In Privcy v0.7.0 and below, this was handled by a Svelte component that mounted inside the iframe. This approach is being phased out in favour if providing a `fallback` option in the `data-privcy` attribute:

```html
<iframe
  data-privcy='{
    "category": "social",
    "src": "https://example.com",
    "fallback": "/iframe-fallback.html"
  }'
></iframe>
```

As shown, the `fallback` option consists of a url to a html page that will be embedded instead of the `src`, if the category is rejected. This html page can be static or dynamic and built basically however you want.

If you want to be able to open the settings menu by clicking a button in the iframe, you need to do the following on your fallback page:

```html
<!doctype html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>

    <!-- ... -->

    <button>Open settings</button>
    
    <script>
      if (window.location !== window.parent.location) {
        // Open a broadcast channel. Privcy will listen on this channel.
        const parent = new BroadcastChannel('privcy:iframe-fallback');

        document
          .querySelector('button')
          .addEventListener('click', () => {
            // The message needs to be exactly this.
            const message = { displayBanner: true };
            
            // When the button is clicked, the message is posted to the channel.
            parent.postMessage(message);
          });
      }
    </script>
  </body>
</html>
```

This allows the iframe fallback to trigger opening the Privcy settings panel.

SPAs (⚠️)
---------

Currently, SPA support is experimental. You can use the `Privcy.reload()` method to handle new scripts/iframes after navigation has taken place, for example:

### React
```typescript
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import Privcy from 'privcy';

const privcy = new Privcy({
  // ...
});

function App() {
  let location = useLocation();

  React.useEffect(() => {
    privcy.reload();
  }, [location]);

  return (
    // ...
  );
}
```

### Barba.js
```typescript
import barba from '@barba/core';
import Privcy from 'privcy';

const privcy = new Privcy({
  // ...
});

barba.init({
  transitions: [
    {
      // ...
      after: () => {
        privcy.reload();
      },
    },
  ],
});

```

File sizes
----------
|Format                     |Size    |gZip   
|---                        |---     |---    
|dist/privcy.js (ESM)       |28.45 kB|8.53 kB
|dist/privcy.iife.js (IIFE) |17.57 kB|6.74 kB

Ownership
---------

Copyright (©) 2024 Simon Lagerlöf

Licensed under the [BSD 3 Clause license](./LICENSE).