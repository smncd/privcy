(() => {
  const privcy = new window.Privcy({
    title: 'Privacy',
    description: `
    <p>
      By clicking "Accept", you consent to us collecting data for analytics purposes.
    </p>

    <p>
      We use necessary cookies to keep track of your choice.
    </p>
    `.trim(),
    categories: {
      analytics: {
        name: 'Analytics',
        description:
          'We use Umami Analytics to collect anonymous visitor data.',
      },
    },
  });

  window.addEventListener('popstate', (event) => {
    privcy.reload();
  });
})();
