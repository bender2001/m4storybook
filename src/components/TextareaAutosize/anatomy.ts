import type {
  TextareaAutosizeShape,
  TextareaAutosizeSize,
  TextareaAutosizeVariant,
} from "./types";

/**
 * TextareaAutosize anatomy + token bindings.
 *
 * Closest M3 analog: the text-field surface
 * (https://m3.material.io/components/text-fields/specs). MUI's
 * TextareaAutosize is the unstyled primitive
 * (https://mui.com/material-ui/react-textarea-autosize/) — this slice
 * re-skins it onto M3 text-field tokens while preserving the autosize
 * behavior (minRows / maxRows clamps the textarea height to the
 * scrollHeight measurement on every value change).
 *
 * The surface is a flex column with three rows:
 *
 *   - label   : optional label-l rendered above the tray
 *   - tray    : leading icon + textarea + trailing icon
 *   - helper  : optional body-s helper text rendered below the tray
 *
 * Token bindings:
 *   - shape       : xs (4dp) by default, full scale exposed
 *   - container   : painted per the variant matrix below
 *   - typography  : body-m by default for the textarea, label-l for the
 *                   floating label, body-s for the helper text
 *   - elevation   : 0 standard / tonal / outlined / text, 3 elevated
 *   - motion      : tray transitions ride medium2 (300ms) on the M3
 *                   emphasized easing — same envelope as TextField.
 *   - state-layer : on-surface fill at hover 0.08 / focus 0.10 /
 *                   pressed 0.10 over the tray.
 */
export const anatomy = {
  /** Outer wrapper — flex column holding label / tray / helper rows. */
  root: "relative inline-flex w-full flex-col gap-1 font-sans",
  /** Label slot — typeset label-l. */
  label: "px-4 text-label-l text-on-surface-variant",
  /** Tray — holds leading icon + textarea + trailing icon. */
  tray: [
    "relative isolate flex w-full items-start gap-3",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "outline-none",
    "focus-within:ring-0",
  ].join(" "),
  /** State layer painted over the tray on hover/focus. */
  stateLayer: [
    "pointer-events-none absolute inset-0 bg-on-surface opacity-0",
    "transition-opacity duration-short4 ease-standard",
    "[--m3-hover:0.08] [--m3-focus:0.10] [--m3-pressed:0.10]",
    "[[data-component=textarea-autosize][data-disabled=true]_&]:opacity-0",
    "[[data-component=textarea-autosize]:hover:not([data-disabled=true])_&]:opacity-[0.08]",
    "[[data-component=textarea-autosize][data-focused=true]:not([data-disabled=true])_&]:opacity-[0.10]",
  ].join(" "),
  /** Native `<textarea>`. */
  textarea: [
    "relative z-[1] block w-full bg-transparent outline-none resize-none",
    "text-on-surface caret-primary",
    "placeholder:text-on-surface-variant placeholder:opacity-70",
    "disabled:cursor-not-allowed",
    // Autosize lives in JS (height is set inline) so we suppress the
    // intrinsic textarea height here.
    "min-h-[1lh] overflow-auto",
  ].join(" "),
  /** Disabled wash. `!pointer-events-none` overrides the tray's
   * resting `pointer-events-auto`. */
  disabled: "cursor-not-allowed !pointer-events-none",
  /** Leading icon box — 24dp glyph. */
  leadingIcon:
    "relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center mt-0.5",
  /** Trailing icon box — 24dp glyph, flush right. */
  trailingIcon:
    "relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center ml-auto mt-0.5",
  /** Helper-text row beneath the tray. */
  helperText: "px-4 text-body-s text-on-surface-variant",
} as const;

type ColorBlock = {
  /** Resting background. */
  bg: string;
  /** Selected background (M3 secondary-container fill). */
  selected: string;
  /** Error background (M3 error-container fill). */
  errorBg: string;
  /** Resting foreground (default text color). */
  fg: string;
  /** Selected foreground. */
  selectedFg: string;
  /** Error foreground. */
  errorFg: string;
  /** Border style. */
  border: string;
  /** Elevation token — `shadow-elevation-{n}` from the Tailwind theme. */
  elevation: string;
  /** Header / icon foreground class. */
  iconColor: string;
};

/**
 * Variant color + elevation matrix. Each cell returns the resting
 * background, foreground, border, and elevation classes that paint
 * the textarea tray.
 */
export const colorMatrix: Record<TextareaAutosizeVariant, ColorBlock> = {
  standard: {
    bg: "bg-surface-container-highest",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  tonal: {
    bg: "bg-secondary-container",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-secondary-container",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-secondary-container",
  },
  outlined: {
    bg: "bg-transparent",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-outline",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  text: {
    bg: "bg-transparent",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  elevated: {
    bg: "bg-surface-container-low",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-3",
    iconColor: "text-on-surface-variant",
  },
};

/**
 * Density scale. Drives padding, gap, type role, and a resting
 * minimum height for the tray (autosize then grows from this floor).
 */
export const sizeClasses: Record<
  TextareaAutosizeSize,
  {
    /** Outer padding on the tray. */
    pad: string;
    /** Min height for the tray (matches the M3 text-field height band). */
    minH: string;
    /** Type role for the textarea body. */
    typography: string;
    /** Vertical gap between label / tray / helper-text rows. */
    rowGap: string;
  }
> = {
  sm: {
    pad: "px-3 py-2",
    minH: "min-h-[40px]",
    typography: "text-body-s",
    rowGap: "gap-0.5",
  },
  md: {
    pad: "px-4 py-3",
    minH: "min-h-[56px]",
    typography: "text-body-m",
    rowGap: "gap-1",
  },
  lg: {
    pad: "px-5 py-4",
    minH: "min-h-[72px]",
    typography: "text-body-l",
    rowGap: "gap-1.5",
  },
};

/** Shape token map. Default = `xs` (4dp) per the M3 text-field surface. */
export const shapeClasses: Record<TextareaAutosizeShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
