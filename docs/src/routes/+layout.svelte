<script>
  import { onMount } from 'svelte';
  import Privcy from 'privcy';
  import 'privcy/dist/style.css';
  import '../styles/main.scss';

  import Footer from '../components/site/Footer.svelte';

  onMount(() => {
    new Privcy({
      cookiePrefix: 'privcy',
      title: 'Privacy',
      description: `
        <p>
          By clicking "Accept", you consent to us collecting data for analytics purposes.
        </p>

        <p>
          We use necessary cookies to keep track of your choice.
        </p>`.trim(),
      categories: {
        analytics: {
          name: 'Analytics',
          description:
            'We use Umami Analytics to collect anonymous visitor data.',
        },
      },
    });
  });
</script>

<svelte:head>
  <title>Privcy</title>
</svelte:head>

<main>
  <slot />
</main>
<Footer />

<style lang="scss">
  main {
    background-color: #efe8e3;
  }
</style>
