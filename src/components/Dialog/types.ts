import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Visual variant. Per the M3 Dialog spec
 * (https://m3.material.io/components/dialogs/specs) the basic dialog
 * paints a `surface-container-high` surface at shape-xl (28dp) and
 * elevation 3. The MUI `Dialog` / `AlertDialog` / `FullScreen`
 * variants are preserved and re-skinned onto these tokens:
 *
 *   - standard   : surface-container-high + elevation-3 + xl radius.
 *                  Default M3 basic dialog.
 *   - tonal      : primary-container + elevation-1 + xl radius.
 *                  Soft, branded variant used for high-emphasis
 *                  promotional dialogs.
 *   - outlined   : transparent fill + 1dp outline border + no
 *                  elevation. Used for low-emphasis confirmation
 *                  prompts where the surface behind should remain
 *                  visible.
 *   - fullscreen : edge-to-edge surface with no radius and no
 *                  elevation, plus a 56dp header when a title,
 *                  close affordance, or actions are present.
 */
export type DialogVariant =
  | "standard"
  | "tonal"
  | "outlined"
  | "fullscreen";

/**
 * Density / max-width preset. Mirrors MUI's `maxWidth` shorthand:
 *
 *   - sm : compact density inside the 280px / 560px M3 width band
 *   - md : default M3 basic dialog density
 *   - lg : roomier API alias, still capped at the 560px M3 width band
 */
export type DialogSize = "sm" | "md" | "lg";

/**
 * Corner shape. Default = `xl` (28dp) per the M3 dialog spec. The
 * remaining tokens are exposed for tonal / outlined dialogs that
 * may want a tighter radius.
 */
export type DialogShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type DialogOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "open"
  | "onClose"
  | "title"
  | "icon"
  | "actions"
  | "supportingText"
  | "scrim"
  | "scrimVariant"
  | "contained"
  | "disableEscapeClose"
  | "disableScrimClose"
  | "disableAutoFocus"
  | "disableFocusTrap"
  | "closeIcon"
  | "closeLabel"
  | "closeOnEscape"
  | "ariaLabel"
  | "ariaLabelledBy"
  | "ariaDescribedBy"
  | "children";

export interface DialogProps
  extends Omit<HTMLMotionProps<"div">, "ref" | DialogOwnKey> {
  /** Visual variant. Default `standard`. */
  variant?: DialogVariant;
  /** Density / max-width preset. Default `md`. */
  size?: DialogSize;
  /** Corner shape token. Default `xl` (28dp per M3). */
  shape?: DialogShape;
  /**
   * Controlled visibility. When false, the dialog is animated out via
   * AnimatePresence (opacity + scale, M3 emphasized tween). Defaults
   * to true so the component is renderable without state in stories.
   */
  open?: boolean;
  /**
   * Fires when the user dismisses the dialog (scrim click or Escape
   * with focus inside). Mirrors MUI's `onClose`.
   */
  onClose?: () => void;
  /** Headline slot. Renders typeset headline-s per the M3 spec. */
  title?: ReactNode;
  /**
   * Optional 24dp icon rendered above the headline (M3 hero icon
   * pattern). When supplied the headline becomes center-aligned to
   * match the M3 icon-dialog spec.
   */
  icon?: ReactNode;
  /**
   * Trailing action slot — typically a row of buttons (Cancel / OK).
   * Aligned to the end of the dialog surface per M3.
   */
  actions?: ReactNode;
  /** Optional supporting text role (typeset body-m). */
  supportingText?: ReactNode;
  /**
   * Render the scrim under the dialog. Defaults to true. Set false
   * for inline / non-modal usage. The scrim is the M3 32%-opacity
   * black overlay used for modal flow.
   */
  scrim?: boolean;
  /**
   * Override the scrim variant — `filled` (M3 default), `tonal`,
   * `outlined`, or `invisible`. Forwarded to the internal Backdrop.
   */
  scrimVariant?: "filled" | "tonal" | "outlined" | "invisible";
  /**
   * Render the dialog with `position: absolute` so it fills its
   * nearest positioned ancestor. Used in stories so the dialog
   * doesn't eat the entire Storybook iframe.
   */
  contained?: boolean;
  /** Skip the Escape-to-close keybind. Default false. */
  disableEscapeClose?: boolean;
  /** Skip click-on-scrim-to-close. Default false. */
  disableScrimClose?: boolean;
  /** Skip initial focus placement inside the dialog. Default false. */
  disableAutoFocus?: boolean;
  /** Skip Tab / Shift+Tab focus cycling inside the dialog. Default false. */
  disableFocusTrap?: boolean;
  /** Full-screen close affordance. Defaults to the Material close icon. */
  closeIcon?: ReactNode;
  /** Accessible label for the full-screen close affordance. */
  closeLabel?: string;
  /** Aliased `aria-label` for the dialog surface. */
  ariaLabel?: string;
  /**
   * Aliased `aria-labelledby`. When `title` is supplied and no
   * explicit `aria-labelledby` is provided, the dialog falls back to
   * the auto-generated headline id.
   */
  ariaLabelledBy?: string;
  /**
   * Aliased `aria-describedby`. When `supportingText` is supplied and
   * no explicit `aria-describedby` is provided, the dialog falls back
   * to the auto-generated supporting-text id.
   */
  ariaDescribedBy?: string;
  /**
   * Body / form content. Renders below the supporting text and above
   * the action row.
   */
  children?: ReactNode;
}
