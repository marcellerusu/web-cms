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

  function tryLoad(): Record<
    "default" | "hover" | "active",
    typeof button
  > | null {
    if (!localStorage.getItem("btn")) return null;
    return JSON.parse(localStorage.getItem("btn"));
  }

  let properties =
    tryLoad() ||
    ({
      default: structuredClone(button),
      hover: structuredClone(
        rules.discard(button, "border-radius", "border-width")
      ),
      active: structuredClone(
        rules.discard(button, "border-radius", "border-width")
      ),
    } as const);

  $: localStorage.setItem("btn", JSON.stringify(properties));

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

  let text = "Test Text";
</script>

<div class="container">
  <div class="sandbox">
    <button class="btn">{text}</button>
  </div>

  <div class="controls">
    <input class="placeholder" type="text" bind:value={text} />

    <fieldset>
      <legend>Interactive States</legend>
      {#each Object.keys(properties) as value}
        <label>
          {#if value === "default"}
            [default]
          {:else}
            :{value}
          {/if}
          <input bind:group={state} type="radio" {value} name="state" />
        </label>
      {/each}
    </fieldset>
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
  .sandbox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
  }

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

  fieldset {
    display: flex;
    padding: 0.25em;
  }
  fieldset legend {
    font-size: 0.8em;
  }

  label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 0.85em;
    color: rgb(88, 88, 88);
    align-items: center;
    padding: 5px;
  }

  label:not(:first-of-type) {
    border-top: 1px solid rgba(0, 0, 0, 0.205);
  }
  fieldset label:not(:first-of-type) {
    border-top: none;
  }
  label input {
    margin-bottom: 0;
  }

  .placeholder {
    width: 50%;
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    background: rgb(244, 244, 244);
    width: 300px;
    height: 40%;
    border-radius: 5px;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.292);
  }
</style>
