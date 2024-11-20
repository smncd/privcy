## [![Privcy](./banner.jpg)](https://privcy.smn.codes)

Tiny reactive consent/cookie banner.


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

You can then either add the script straight into your HTML in a script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/privcy/dist/privcy.js"></script>
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

For a complete quick-start guide, head over to the [docs site](https://privcy.smn.codes/guides/quick-start.html).

File sizes
----------
|Format                |Size    |gZip   
|---                   |---     |---    
|dist/privcy.mjs (ESM) |16.54 kB|5.35 kB
|dist/privcy.js (IIFE) |11.49 kB|4.37 kB

Ownership
---------

Copyright (©) 2024 Simon Lagerlöf

Licensed under the [BSD 3 Clause license](./LICENSE).