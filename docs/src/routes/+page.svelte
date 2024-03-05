<script lang="ts">
  import Hero from '../components/Hero.svelte';
  import gitlab from '../assets/vectors/logo-gitlab.svg?raw';
  import npm from '../assets/vectors/logo-npm.svg?raw';
</script>

<Hero
  title="Privcy."
  subtitle="A no-nonsense privacy/cookie consent banner."
/>
<footer class="footer">
  <div class="links">
    <a
      href="https://gitlab.com/smncd/privcy"
      title="GitLab"
      target="_blank"
      rel="noopener noreferrer">{@html gitlab}</a
    >
    <a
      href="https://www.npmjs.com/package/privcy"
      title="NPM"
      target="_blank"
      rel="noopener noreferrer">{@html npm}</a
    >
  </div>
  <button data-privcy-display-banner>Display Privacy Banner</button>
  <span class="copyright">
    2024 © <a href="https://smn.codes">Simon Lagerlöf</a>
  </span>
</footer>

<style lang="scss">
  @use '../styles/mixins/media-queries' as mq;

  .footer {
    padding: 2rem;
    width: 100%;
    display: flex;
    gap: 2rem;

    @include mq.width-below(mobile) {
      margin-top: 4rem;
      flex-direction: column;
      align-items: center;
    }

    @include mq.width-above(mobile) {
      position: fixed;
      left: 0;
      bottom: 0;
      padding: 3rem;
      justify-content: space-between;
    }

    & .links {
      display: flex;
      gap: 2rem;

      > a {
        display: block;
        width: 3rem;
        height: 3rem;
        & svg {
          width: inherit;
          height: inherit;
        }
      }
    }

    & button[data-privcy-display-banner] {
      padding: initial;
      border: initial;
      background: initial;
      cursor: pointer;
      text-decoration: underline;
    }

    & .copyright {
      text-align: right;
    }
  }
</style>
