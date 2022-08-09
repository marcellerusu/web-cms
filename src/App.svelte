<script lang="ts">
  import { onMount } from "svelte";
  import * as rules from "./rules";

  let button = {
    "border-radius": { ...rules.number },
    "border-width": { ...rules.number },
    "background-color": { ...rules.color, value: "#0f62fe" },
    color: { ...rules.color, value: "#ffffff" },
    "border-color": { ...rules.color, value: "#0f62fe" },
    "outline-color": { ...rules.color, value: "#000000" },
    "outline-width": { ...rules.number },
  };

  let properties = {
    default: structuredClone(button),
    hover: structuredClone(
      rules.discard(button, "border-radius", "border-width")
    ),
    active: structuredClone(
      rules.discard(button, "border-radius", "border-width")
    ),
  } as const;

  let state: keyof typeof properties = "default";

  let sheet: HTMLStyleElement;
  onMount(() => {
    sheet = document.createElement("style");
    document.body.append(sheet);
  });

  $: {
    if (sheet)
      sheet.innerHTML = `
  button.btn {
    ${Object.entries(properties.default)
      .map(([key, value]) => `${key}: ${rules.format(value)};`)
      .join("\n    ")}
  }

  button.btn:hover {
    ${Object.entries(properties.hover)
      .filter(([key, value]) => !rules.eq(properties.default[key], value))
      .map(([key, value]) => `${key}: ${rules.format(value)};`)
      .join("\n    ")}
  }

  button.btn:not(:disabled):active {
    ${Object.entries(properties.active)
      .filter(([key, value]) => !rules.eq(properties.default[key], value))
      .map(([key, value]) => `${key}: ${rules.format(value)};`)
      .join("\n    ")}
  }
`;
  }
  $: code = `
<button class="btn">
  <slot/>
</button>

<${""}style>${sheet?.innerHTML}</style>
`;
</script>

<div class="container">
  <button class="btn"> Test Text </button>

  <label>
    State
    <select bind:value={state}>
      {#each Object.keys(properties) as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </label>

  <div class="controls">
    {#each Object.entries(properties[state]) as [key, value]}
      <label>
        <span><em>{key}</em>: {rules.format(value)}</span>
        <input bind:value={properties[state][key].value} {...value} />
      </label>
    {/each}
  </div>
  <pre>{code}</pre>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  button {
    height: min-content;
  }

  label {
    display: flex;
    justify-content: space-between;
    font-size: 0.85em;
    color: rgb(88, 88, 88);
    border-top: 1px solid rgba(0, 0, 0, 0.205);
    align-items: center;
    padding: 5px;
  }
  label input {
    margin-bottom: 0;
  }
  .controls {
    padding: 1em;
    background: rgb(244, 244, 244);
    width: 300px;
    height: 40%;
    border-radius: 5px;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.292);
  }
</style>
