<script>
  import 'css-reset-and-normalize';
  import '../styles/main.scss';
  import { onMount } from 'svelte';
  import Privcy from 'privcy';

  onMount(() => {
    new Privcy({
      cookieName: 'privcy_demo_website',
      title: 'Privacy',
      description:
        '<p>Come to the dark side, we have cookies. </p><p>Or, uhm, something...</p>',
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
  });
</script>

<main>
  <slot />
</main>

<style>
  main {
    margin: 0 auto;
    padding: 1rem;
  }
</style>
