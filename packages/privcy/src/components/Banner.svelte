<script lang="ts">
  /**
   * Banner component.
   *
   * @author Simon Lagerlöf <contact@smn.codes>
   * @license BSD-3-Clause
   * @copyright 2024 Simon Lagerlöf
   * @since 0.0.1
   */

  import Button from './Button.svelte';
  import type { Categories, Strings } from '../lib/types';

  export let acceptAll: () => void;
  export let rejectAll: () => void;
  export let acceptSelected: (categories: Array<string>) => void;

  export let acceptedCategories: Array<string> = [];

  export let title = '';
  export let description = '';
  export let categories: Categories;
  export let strings: Strings;

  let isCustomizing = false;

  function setCustomizing(event: Event) {
    event.preventDefault();
    isCustomizing = !isCustomizing;
  }

  function changeCategory(category: string) {
    if (acceptedCategories?.includes(category)) {
      acceptedCategories = acceptedCategories.filter(
        (cat) => cat !== category,
      );
    } else {
      acceptedCategories.push(category);
    }
  }
</script>

<dialog class="privcy" open={true}>
  <h2 class="privcy__title">{title}</h2>
  <div class="privcy__description">
    {@html description}
  </div>
  {#if isCustomizing}
    <ul class="privcy__categories">
      {#each Object.keys(categories) as category}
        <li class="privcy__category">
          <h3 class="privcy__category__name">
            {categories[category].name}
          </h3>
          <p class="privcy__category__description">
            {categories[category].description}
          </p>
          <label class="privcy__category__checkbox">
            <input
              type="checkbox"
              checked={acceptedCategories?.includes(category)}
              on:change={() => changeCategory(category)}
            />
            {strings.categories.enable}&nbsp;{categories[category]
              .name}
          </label>
        </li>
      {/each}
    </ul>
  {/if}
  <form class="privcy__buttons" method="dialog">
    {#if isCustomizing}
      <Button
        type="acceptSelected"
        onClick={() => acceptSelected(acceptedCategories)}
      >
        {strings.buttons.saveSettings}
      </Button>
    {:else}
      <Button type="acceptAll" onClick={acceptAll}>
        {strings.buttons.acceptAll}
      </Button>
      <Button type="rejectAll" onClick={rejectAll}>
        {strings.buttons.rejectAll}
      </Button>
    {/if}
    <Button type="customize" onClick={setCustomizing}>
      {!isCustomizing
        ? strings.buttons.customize
        : strings.buttons.back}
    </Button>
  </form>
</dialog>