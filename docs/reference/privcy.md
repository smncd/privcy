`Privcy()`
======

Usage
-----

```html
<script src="https://cdn.jsdelivr.net/npm/privcy/dist/privcy.js"></script>
<script>
  new window.Privcy({
    // config ...
  });
</script>
```
or
```typescript
// index.ts
import Privcy from 'privcy';

new Privcy({
  // config ...
});
```

For a complete example, see the [Quick-start guide](../guides/quick-start.md).

Props
-----

The `Privcy` class takes in the one prop in it's constructor, with the [`PrivcyProps`](https://gitlab.com/smncd/privcy/-/tree/main/packages/privcy/src/main.ts#L25) type.

### `target` (optional)

Type: [`Element`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)   

The target element where the banner will be displayed. If not provided, a new `<privcy-banner>` element will be created and prepended to the body of the document.

### `title`

Type: `string`   

The title to be displayed on the banner.

### `description`

Type: `string`   

The description to be displayed on the banner. Can be a html string.

### `categories`

Type: `Record<string, { name: string; description: string }>`   

A record of categories where each key represents a category and its value contains a `name` and `description` for the category. 
`description` can be a html string.

#### Example

```typescript
const props: PrivcyProps = {
  /// ....
  categories: {
    analytics: {
      name: 'Analytics',
      description: 'We use QuackQuack Analytics to collect anonymous statistics about our visitors',
    }
  }
}
```

### `strings` (optional)

Type: [`i18nStrings`](https://gitlab.com/smncd/privcy/-/tree/main/packages/privcy/src/types.ts#L10)   

Custom strings to override the default internationalization (i18n) strings for categories and buttons.

#### Example 

```typescript
const props: PrivcyProps = {
  /// ....
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
  }
}
```

### `cookiePrefix` (optional)

Type: `string`   

Privcy sets cookies to remember your users choices of what to allow/reject.
The default name for these cookies follow this pattern: `privcy__consent__{categoryName}`.

By setting the `cookiePrefix`, you can customize the cookie naming scheme to for example `my_app__consent__{categoryName}`.

#### Example 

```typescript
const props: PrivcyProps = {
  // ....
  cookiePrefix: 'my_app'
}
```

Methods
-------

Privcy has a couple of public methods that you can use to control it. All methods listed below are available on a class instance, and not statically.

### `Privcy.reload()`

Use this method to "reload" Privcy. It rescans the dom for script tags and iframes, and takes action based on their `data-privcy`-tags. Useful to run after say a navigation event in a [SPA](/guides/single-page-applications).

#### Example
```typescript

// Reload privcy on popstate
window.addEventListener('popstate', (event) => {
  privcy.reload();
});
```

### `Privcy.openSettings()`

Calling this method opens the Privcy banner in "customize mode", allowing the user to tweak their settings.