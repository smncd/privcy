## [![Privcy](./banner.jpg)](https://privcy.smn.codes)

Tiny, zero depencency reactive consent/cookie banner, weighing in around **4 kB** (gzipped).


⚠️ Here be dragons ⚠️
----------------------

At the time of writing, Privcy is made by me for use in my projects, which means it may 
lack features you need, and development is happening on a as-needed basis. You are more 
than welcome to contribute to Privcy if you want a feature included, or create a issue 
if something is not working as expected, but in doing so, keep the above in mind.

Installation
------------

To get started, install Privcy with your favourite package manager (PNPM, Yarn, NPM, etc):

```bash
pnpm add privcy
```

You can then import the `Privcy` class:

```typescript
// index.ts
import Privcy from 'privcy';

new Privcy({
  title: 'Privacy',
  description: '<p>Your data, your rules. Here\'s what we\'re working with.</p>',
  categories: {
    analytics: {
      name: 'Analytics',
      description: 'Helps us understand what\'s working, what\'s not, and what\'s just plain confusing.',
    },
    social: {
      name: 'Social',
      description: 'Enables sharing, liking, and pretending you discovered us first.',
    },
  },
});
```

Alternatively you can add the script straight into your HTML in a script tag:

```html
<script src="https://unpkg.com/privcy@latest/dist/privcy.js"></script>
<script>
  new window.Privcy({
  title: 'Privacy',
  description: '<p>Your data, your rules. Here\'s what we\'re working with.</p>',
  categories: {
    analytics: {
      name: 'Analytics',
      description: 'Helps us understand what\'s working, what\'s not, and what\'s just plain confusing.',
    },
    social: {
      name: 'Social',
      description: 'Enables sharing, liking, and pretending you discovered us first.',
    },
  },
});
</script>
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

In cases where a iframe's category is rejected by the user, we sometimes want to display a informational popup alerting the user that the content is not available. This is done by providing a `fallback` option in the `data-privcy` attribute:

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

For a complete example, see [iframe-fallback.html](https://gitlab.com/smncd/privcy/-/blob/main/packages/privcy/iframe-fallback.html).

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

Styling/CSS
-----------
Privcy shipps with a minimal default stylesheet, which can be used like so:

```html
<script src="https://unpkg.com/privcy@latest/dist/privcy.js"></script>
<script src="https://unpkg.com/privcy@latest/dist/privcy.css"></script>
<script>
  new window.Privcy({
    // config ...
  });
```

However, you'll probably be better of writing your own styles! Use [this template](https://gitlab.com/smncd/privcy/-/blob/main/packages/privcy/src/styles/template.css) to get started. 
Since Privcy is essentially only a standard [HTML dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog), you should be able to customize 
it to your liking.


File sizes
----------
|Format                |Size    |gZip   
|---                   |---     |---    
|dist/privcy.mjs (ESM) |15.28 kB│4.05 kB
|dist/privcy.js (IIFE) |6.29 kB │2.57 kB

Ownership
---------

Copyright (©) 2024 Simon Lagerlöf

Licensed under the [BSD 3 Clause license](./LICENSE).