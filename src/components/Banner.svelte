<script lang="ts">
  /**
   * Cookie/Privacy consent banner script.
   *
   * @author Simon Lagerlöf <contact@smn.codes>
   * @copyright 2024 Simon Lagerlöf
   * @since @next
   */

  import Button from './Button.svelte';
  import type {
    Categories,
    Strings,
  } from '../lib/privacy-consent-banner';

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

<dialog class="consent-banner" open={true}>
  <h2 class="consent-banner__title">{title}</h2>
  <div class="consent-banner__description">
    {@html description}
  </div>
  {#if isCustomizing}
    <ul class="consent-banner__customization">
      {#each Object.keys(categories) as category}
        <li>
          <h3>{categories[category].name}</h3>
          <p>{categories[category].description}</p>
          <label>
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
  <form class="consent-banner__buttons" method="dialog">
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
