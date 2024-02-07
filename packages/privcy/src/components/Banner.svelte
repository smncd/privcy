<script lang="ts">
  /**
   * Banner component.
   *
   * @author Simon Lagerlöf <contact@smn.codes>
   * @license BSD-3-Clause
   * @copyright 2024 Simon Lagerlöf
   * @since 0.0.1
   */

  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import type Categories from '../lib/Categories';
  import type Controller from '../lib/Controller';

  export let controller: Controller;
  export let categories: Categories;

  export let open: boolean;

  export let title: string;
  export let description: string;
  export let strings: {
    categories: {
      enable: string;
    };
    buttons: {
      acceptAll: string;
      rejectAll: string;
      customize: string;
      saveSettings: string;
      back: string;
    };
  };

  const allowedCategories = controller.allowedCategories;

  let requestedCategories: Array<string> = allowedCategories;

  let isCustomizing = false;

  let dialogRef: HTMLDialogElement;

  onMount(() => {
    const eventListener = () => {
      dialogRef.open = true;
    };

    const button = document.querySelector(
      '[data-privcy-display-banner]',
    );

    button?.addEventListener('click', eventListener);

    return () => {
      button?.removeEventListener('click', eventListener);
    };
  });

  function setCustomizing(event: Event) {
    event.preventDefault();
    isCustomizing = !isCustomizing;
  }

  function includeCategory(category: string) {
    if (allowedCategories?.includes(category)) {
      requestedCategories = requestedCategories.filter(
        (cat) => cat !== category,
      );
    } else {
      requestedCategories.push(category);
    }
  }
</script>

<dialog class="privcy" {open} bind:this={dialogRef}>
  <h2 class="privcy__title">{title}</h2>
  <div class="privcy__description">
    {@html description}
  </div>
  {#if isCustomizing}
    <ul class="privcy__categories">
      {#each categories.toArray() as category}
        <li class="privcy__category">
          <h3 class="privcy__category__name">
            {category.name}
          </h3>
          <p class="privcy__category__description">
            {category.description}
          </p>
          <label class="privcy__category__checkbox">
            <input
              type="checkbox"
              checked={allowedCategories?.includes(category.id)}
              on:change={() => includeCategory(category.id)}
            />
            {strings.categories.enable}&nbsp;{category.name}
          </label>
        </li>
      {/each}
    </ul>
  {/if}
  <form
    class="privcy__buttons"
    method="dialog"
    on:submit={() => (isCustomizing = false)}
  >
    <Button type="customize" onClick={setCustomizing}>
      {!isCustomizing
        ? strings.buttons.customize
        : strings.buttons.back}
    </Button>
    <div class="privcy__buttons__choices">
      {#if isCustomizing}
        <Button
          type="acceptSelected"
          onClick={() =>
            controller.updateConsent(requestedCategories)}
        >
          {strings.buttons.saveSettings}
        </Button>
      {:else}
        <Button
          type="acceptAll"
          onClick={() => controller.updateConsent(categories.IDs)}
        >
          {strings.buttons.acceptAll}
        </Button>
        <Button
          type="rejectAll"
          onClick={() => controller.updateConsent([])}
        >
          {strings.buttons.rejectAll}
        </Button>
      {/if}
    </div>
  </form>
</dialog>

<style lang="scss">
  .privcy {
    box-sizing: border-box;
    position: fixed;
    margin: 0;
    left: 20px;
    bottom: 20px;
    width: calc(min(680px, 100%) - 40px);
    font-size: 18px;

    &__title {
      margin-top: 0;
      font-size: 30px;
    }

    &__description {
      margin: 15px 0;
    }

    // &__categories {}

    &__category {
      list-style: none;
      // &__name {}

      // &__description {}

      &__checkbox {
        font-size: 16px;
      }
    }

    &__buttons {
      width: 100%;
      display: flex;
      flex-wrap: wrap-reverse;
      justify-content: space-between;

      &__choices {
        display: inherit;
        flex-wrap: inherit;
        gap: 15px;
      }
    }
  }
</style>
