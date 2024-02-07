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

  let className = [
    'privcy__button',
    type && `privcy__button--${type}`,
  ].join(' ');
</script>

<button class={className} on:click={onClick}>
  <slot />
</button>

<style lang="scss">
  .privcy__button {
    padding: 12px 24px;
    border: initial;
    background-color: black;
    color: white;
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;

    &--customize {
      padding: 12px;
      background-color: initial;
      color: currentColor;
    }
  }
</style>
