import type { SvelteComponentTyped } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type $RestProps = SvelteHTMLElements["button"];

type $Props = {
  /**
   * Set to `true` to open the panel
   * @default false
   */
  isOpen?: boolean;

  /**
   * Specify the icon to render when the action panel is closed.
   * Defaults to `<Switcher size={20} />`
   * @default undefined
   */
  icon?: any;

  /**
   * Specify the icon to render when the action panel is open.
   * Defaults to `<Close size={20} />`
   * @default undefined
   */
  closeIcon?: any;

  /**
   * Specify the text.
   * Alternatively, use the named slot "text" (e.g., `<div slot="text">...</div>`)
   * @default undefined
   */
  text?: string;

  /**
   * Obtain a reference to the button HTML element
   * @default null
   */
  ref?: null | HTMLButtonElement;

  /**
   * Customize the panel transition (i.e., `transition:slide`).
   * Set to `false` to disable the transition
   * @default { duration: 200 }
   */
  transition?: false | import("svelte/transition").SlideParams;

  /**
   * Set to `true` to prevent the panel from closing when clicking outside
   * @default false
   */
  preventCloseOnClickOutside?: boolean;

  [key: `data-${string}`]: any;
};

export type HeaderActionProps = Omit<$RestProps, keyof $Props> & $Props;

export default class HeaderAction extends SvelteComponentTyped<
  HeaderActionProps,
  {
    open: CustomEvent<null>;
    close: CustomEvent<null>;
    click: WindowEventMap["click"];
  },
  { default: {}; closeIcon: {}; icon: {}; text: {} }
> {}
