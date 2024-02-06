<script lang="ts">
  /**
   * Cookie/Privacy consent banner script.
   *
   * @author Simon Lagerlöf <contact@smn.codes>
   * @copyright 2024 Simon Lagerlöf
   * @since @next
   */

  export let type: string | undefined;

  export let onClick: (event: Event) => void;
</script>

<button
  class={['button', type && `button--${type}`].join(' ')}
  on:click={onClick}
>
  <slot />
</button>
