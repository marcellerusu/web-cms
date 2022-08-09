<script lang="ts">
  import { onMount } from "svelte";

  function format({ type, value }) {
    switch (type) {
      case "range":
        return `${value}px`;
      case "color":
        return value;
      default:
        console.assert(false, "Not available to format");
    }
  }

  function eq(lhs, rhs) {
    return lhs.type === rhs.type && lhs.value === rhs.value;
  }

  function discard<T extends Record<string, any>>(
    object: T,
    ...keys: (keyof T)[]
  ) {
    let entries = Object.entries(object).filter(([key]) => !keys.includes(key));
    return Object.fromEntries(entries);
  }

  let number = {
    value: 0,
    type: "range",
    min: 0,
    max: 20,
  };
  let color = {
    type: "color",
  };

  let button = {
    "border-radius": { ...number },
    "border-width": { ...number },
    "background-color": { ...color, value: "#0f62fe" },
    color: { ...color, value: "#ffffff" },
    "border-color": { ...color, value: "#0f62fe" },
    "outline-color": { ...color, value: "#000000" },
    "outline-width": { ...number },
  };

  let properties = {
    default: structuredClone(button),
    hover: structuredClone(discard(button, "border-radius", "border-width")),
    active: structuredClone(discard(button, "border-radius", "border-width")),
  } as const;

  let state: keyof typeof properties = "default";

  let sheet;
  onMount(() => {
    sheet = document.createElement("style");
    sheet.type = "text/css";

    document.body.append(sheet);
  });

  $: {
    if (sheet)
      sheet.innerHTML = `
  button.btn {
    ${Object.entries(properties.default)
      .map(([key, value]) => `${key}: ${format(value)};`)
      .join("\n    ")}
  }

  button.btn:hover {
    ${Object.entries(properties.hover)
      .filter(([key, value]) => !eq(properties.default[key], value))
      .map(([key, value]) => `${key}: ${format(value)};`)
      .join("\n    ")}
  }

  button.btn:not(:disabled):active {
    ${Object.entries(properties.active)
      .filter(([key, value]) => !eq(properties.default[key], value))
      .map(([key, value]) => `${key}: ${format(value)};`)
      .join("\n    ")}
  }
`;
  }
  $: code = `
<button class="btn">
  <slot/>
</button>

<style>${sheet?.innerHTML}</style>
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
        <span><em>{key}</em>: {format(value)}</span>
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
    font-size: 0.75em;
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
