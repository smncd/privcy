<script lang="ts">
  import star from '../assets/vectors/star.svg?raw';
</script>

<h1 class="title">Privcy.</h1>

<div class="content">
  <p>This is my take on a reactive privacy/cookie consent banner.</p>
  <h2>⚠️ Here be dragons ⚠️</h2>
  <p>
    At the time of writing this repo is quite experimental. It works,
    but could use some work, and more extensive documentation. Use at
    your own risk.
  </p>
</div>

<p class="subtitle">
  By <a href="https://smn.codes">smn.codes</a>.
</p>

<figure class="star">
  {@html star}
</figure>

<style lang="scss">
  @use '../styles/mixins/media-queries' as mq;

  .title {
    margin-bottom: 0.25em;
    font-size: 25vw;
    line-height: 1;

    @include mq.width-below(tablet) {
      margin-top: 15%;
    }

    @include mq.width-above(tablet) {
      margin-top: 7.5%;
    }
  }

  .content {
    margin: 4vw 0 0 2.4vw;
    width: min(720px, 100%);
    font-size: 1.25rem;
    line-height: 1.5;

    & h2 {
      margin: 1em 0 0.25em;
      font-size: 1.75rem;
    }
  }

  .subtitle {
    margin: 4vw 0 0 2.4vw;
    font-size: 1.5rem;
  }

  .star {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    z-index: -1;

    & :global(svg) {
      width: 200%;
      height: 200%;
      transform: translateY(-50%);
    }
  }
</style>
