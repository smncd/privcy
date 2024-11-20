Single Page Applications (SPAs)
===============================

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