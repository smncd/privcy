<script lang="ts">
  export let categoryName: string;
  export let buttonCallback: () => void;
</script>

<div>
  <main>
    <h1>Privacy</h1>
    <p>
      Viewing the content in this iframe requires enabling '${categoryName}'
      in the privacy settings.
    </p>
    <button on:click={buttonCallback}>Settings</button>
  </main>

  <style>
    * {
      font-family: monospace;
      text-align: center;
    }

    main {
      margin: 0 auto;
      height: 100%;
      width: min(400px, 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    button {
      border: initial;
      padding: 10px 15px;
      background-color: black;
      color: white;
      cursor: pointer;
    }
  </style>
</div>
