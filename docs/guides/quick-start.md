Quick Start
===========

Getting up and running with Privcy is easy as can be.

You can either drop in as a script tag, or install it as a dependency.

Using a CDN
-----------

Using Privcy through a CDN like Unpkg or JSDelivr is as easy as adding a script tag to your html page, before the closing `</body>` tag.

```html
<script src="https://cdn.jsdelivr.net/npm/privcy/dist/privcy.min.js"></script>
<script>
  const privcy = new window.Privcy({
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

> [!NOTE]
> In case you need to need to place the script tags in the page `<head>`, you might run into issues where `window.Privcy` is undefined. 
> To fix this, you can wrap your instanciation like so:
> ```javascript
> window.eventListener('load', () => {
>   const privcy = new window.Privcy({
>     // ...
>   }) 
> })
> ```


Using a package manager
-----------------------

To get started, install Privcy with your favourite package manager (PNPM, Yarn, NPM, etc):

```bash
pnpm add privcy
```

You can then import it as a module:

```typescript
// index.ts
import Privcy from 'privcy';

const privcy = new Privcy({
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

Styling
--------------

Privcy comes with some default stylesheets that you can use to get up and running quickly. Just drop in a link to the CSS file in your `<head>`:

```html
<link href="https://cdn.jsdelivr.net/npm/privcy/dist/style.css" rel="stylesheet">
```

However, you'll probably be better of writing your own styles! Use [this template](https://gitlab.com/smncd/privcy/-/blob/main/packages/privcy/src/styles/template.css) to get started. 
Since Privcy is essentially only a standard [HTML dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog), you should be able to customize 
it to your liking.

Script tags
-----------------------

Then, the scripts you want to control need to be modified with the `data-privcy` tag:

```html
<script
  data-privcy='{
    "category": "analytics",
    "src": "/path/to/script.js"
  }'
></script>
```

> [!NOTE]
> The key is that the script should *not* have the `src=""` property, as that would mean it will load regardless of the Privcy configuration.


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
