<script>
  /**
   * @event {null} open
   * @event {null} close
   */

  /** Set to `true` to open the panel */
  export let isOpen = false;

  /**
   * Specify the icon to render when the action panel is closed.
   * Defaults to `<Switcher size={20} />`
   * @type {any}
   */
  export let icon = Switcher;

  /**
   * Specify the icon to render when the action panel is open.
   * Defaults to `<Close size={20} />`
   * @type {any}
   */
  export let closeIcon = Close;

  /**
   * Specify the text displayed next to the icon.
   * Alternatively, use the named slot "text" (e.g., `<div slot="text">...</div>`)
   * @type {string}
   */
  export let text = undefined;

  /**
   * Specify an icon tooltip. The tooltip will not be displayed
   * if either the `text` prop or a named slot="text" is used
   * @type {string}
   */
  export let iconDescription = undefined;

  /**
   * Set the alignment of the tooltip relative to the icon.
   * Only applies when `iconDescription` is provided
   * @type {"start" | "center" | "end"}
   */
  export let tooltipAlignment = "center";

  /** Obtain a reference to the button HTML element */
  export let ref = null;

  /**
   * Customize the panel transition (i.e., `transition:slide`).
   * Set to `false` to disable the transition
   * @type {false | import("svelte/transition").SlideParams}
   */
  export let transition = { duration: 200 };

  /** Set to `true` to prevent the panel from closing when clicking outside */
  export let preventCloseOnClickOutside = false;

  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import Close from "../icons/Close.svelte";
  import Switcher from "../icons/Switcher.svelte";

  const dispatch = createEventDispatcher();

  let refPanel = null;

  $: hasIconOnly = iconDescription && !(text || $$slots.text);
  $: buttonClass = [
    hasIconOnly && "bx--btn bx--btn--primary",
    hasIconOnly && "bx--tooltip__trigger bx--tooltip--a11y",
    hasIconOnly && "bx--btn--icon-only bx--btn--icon-only--bottom",
    hasIconOnly && `bx--tooltip--align-${tooltipAlignment}`,
    $$restProps.class,
  ]
    .filter(Boolean)
    .join(" ");
</script>

<svelte:window
  on:click={({ target }) => {
    if (
      isOpen &&
      !ref.contains(target) &&
      !refPanel.contains(target) &&
      !preventCloseOnClickOutside
    ) {
      isOpen = false;
      dispatch("close");
    }
  }}
/>

<button
  bind:this={ref}
  type="button"
  class:bx--header__action={true}
  class:bx--header__action--active={isOpen}
  class:bx--header__action--text={text}
  {...$$restProps}
  class={buttonClass}
  on:click
  on:click|stopPropagation={() => {
    isOpen = !isOpen;
    dispatch(isOpen ? "open" : "close");
  }}
>
  {#if hasIconOnly}
    <span class:bx--assistive-text={true}>{iconDescription}</span>
  {/if}
  {#if isOpen}
    <slot name="closeIcon">
      <svelte:component this={closeIcon} size={20} />
    </slot>
  {:else}
    <slot name="icon">
      <svelte:component this={icon} size={20} />
    </slot>
  {/if}
  <slot name="text">
    {#if text}<span class:bx--header__action-text={true}>{text}</span>{/if}
  </slot>
</button>
{#if isOpen}
  <div
    bind:this={refPanel}
    class:bx--header-panel={true}
    class:bx--header-panel--expanded={true}
    style:overflow-y="auto"
    style:color-scheme="dark"
    transition:slide|local={{
      ...transition,
      duration: transition === false ? 0 : transition.duration,
    }}
  >
    <slot />
  </div>
{/if}

<style>
  :global(.bx--header__action--text) {
    display: inline-flex;
    align-items: center;
    width: auto;

    /** 2px bottom padding aligns icon with `HeaderAction` */
    padding: 0 1rem 2px 1rem;

    /** `body-short-01` styles */
    font-size: 0.875rem;
    line-height: 1.28572;
    letter-spacing: 0.16px;

    /** Same color as `Header` platformName */
    color: #f4f4f4;
  }

  :global(.bx--header__action-text) {
    margin-left: 0.75rem;
  }
</style>
