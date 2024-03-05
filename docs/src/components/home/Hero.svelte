<script lang="ts">
  import star from '../../assets/vectors/star.svg?raw';

  export let title: string;
  export let subtitle: string;
</script>

<header class="hero">
  <figure class="hero__star">
    {@html star}
  </figure>
  <h1 class="hero__title">{title}</h1>
  <p class="hero__subtitle">
    {subtitle}
  </p>
</header>

<style lang="scss">
  @use '../../styles/mixins/media-queries' as mq;

  .hero {
    position: relative;
    padding: 2rem;
    background-color: white;
    color: black;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;

    @include mq.width-above(tablet) {
      min-height: 90vh;
    }

    &__title {
      position: relative;
      line-height: 1;

      @include mq.width-below(tablet) {
        margin-bottom: 0.25em;
        font-size: 190px;
        writing-mode: sideways-rl;
        -webkit-writing-mode: vertical-lr;
      }

      @include mq.width-above(tablet) {
        margin-bottom: 0.35em;
        font-size: 350px;
      }

      @include mq.width-above(desktop) {
        font-size: 400px;
      }

      @include mq.width-above(desktop-large) {
        font-size: 450px;
      }
    }

    &__subtitle {
      position: relative;
      font-size: 30px;

      @include mq.width-above(tablet) {
        margin-left: 2.5vw;
      }
    }

    &__star {
      position: absolute;
      top: 0;
      right: 0;
      width: max(60vw, 100%);
      height: max(60vw, 100%);
      overflow: hidden;

      & :global(svg) {
        width: 200%;
        height: 200%;
        transform: translateY(-50%);
      }
    }
  }
</style>
