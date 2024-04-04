<script lang="ts">
  /**
   * Iframe fallback component.
   *
   * @author Simon Lagerlöf <contact@smn.codes>
   * @license BSD-3-Clause
   * @copyright 2024 Simon Lagerlöf
   * @since 0.0.6
   *
   * @deprecated We should use the html fallback method instead. The Svelte-based fallback will be removed in a upcoming release.
   */

  export let categoryName: string;
  export let buttonCallback: () => void;
</script>

<div
  style="
    outline: 2px solid currentColor;
    font-family: monospace;
    text-align: center;
  "
>
  <main
    style="
      margin: 0 auto;
      height: 100%;
      width: min(400px, 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

    "
  >
    <h1>Privacy</h1>
    <p>
      Viewing the content in this iframe requires enabling '{categoryName}'
      in the privacy settings.
    </p>
    <button
      on:click={buttonCallback}
      style="
        border: initial;
        padding: 10px 15px;
        background-color: black;
        color: white;
        cursor: pointer;
      "
    >
      Settings
    </button>
  </main>
</div>
