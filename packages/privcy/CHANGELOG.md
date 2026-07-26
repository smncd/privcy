# privcy

## 0.11.6

### Patch Changes

- eccd44a: Optimise `#updateConsentCookies()` method
- 79f7a11: Use new `@privcy/dom` package
- bae3405: Add further test cases
- 74cc704: Gracefully handle invalid `data-privcy` attributes
- Updated dependencies [871d5cd]
  - @privcy/dom@0.1.0

## 0.11.5

### Patch Changes

- 0ecf82b: Fix broken 0.11.4 build

## 0.11.4

### Patch Changes

- 720a7a4: Add new attribute `data-customizing`, to indicate what mode privcy is in"
- b35f62f: Fix incorrect CSS export path
- bc7114c: Turn `customizing` into `view`
- 9d24842: Optimise and test the `reactive()` function.
- 10ff248: Introduce testing
- 05baf35: Fix some low hanging bugs and optimisations
- e3fd61f: Use DOMParser for improved string-to-html parsing.

## 0.11.3

### Patch Changes

- 34806fb: Only reload when pressing reject button if some categories are already loaded

## 0.11.2

### Patch Changes

- 3278fa0: Make sure scripts run on enabling. When disabling, reload the current tab to make sure execution is stopped.

## 0.11.1

### Patch Changes

- 635b422: Bump dependencies
