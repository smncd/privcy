<script lang="ts">
  /**
   * Button component.
   *
   * @author Simon Lagerlöf <contact@smn.codes>
   * @license BSD-3-Clause
   * @copyright 2024 Simon Lagerlöf
   * @since 0.0.1
   */

  export let type: string | undefined;

  export let onClick: (event: Event) => void;
</script>

<button
  class={['privcy__button', type && `privcy__button--${type}`].join(' ')}
  on:click={onClick}
>
  <slot />
</button>
