import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Visual variant. M3 doesn't ship a first-class "Modal" component —
 * Modal is the primitive that powers Dialog, Drawer, Bottom Sheet and
 * the various scrim-backed surfaces. The MUI `Modal` API (open prop +
 * scrim + focus trap + Escape-to-close + click-on-backdrop-to-close)
 * is preserved and re-skinned onto M3 surface tokens. Variants paint
 * the modal surface five ways:
 *
 *   - standard : surface-container-high + elevation 3 + shape-xl.
 *                M3 default modal surface (matches the basic dialog
 *                spec at https://m3.material.io/components/dialogs/specs).
 *   - tonal    : primary-container + elevation 1 + shape-xl.
 *                High-emphasis branded modal — promotional flows.
 *   - outlined : surface + 1dp outline border + elevation 0.
 *                Low-emphasis variant where the surface behind the
 *                modal should remain visible through the outline.
 *   - text     : transparent fill + no border + elevation 0.
 *                Minimal "frameless" modal — useful when the modal
 *                content (a fullscreen image, an inline form) is its
 *                own frame.
 *   - elevated : surface-container-low + elevation 4 + shape-xl.
 *                Strong card-like surface for high-attention modals.
 */
export type ModalVariant =
  | "standard"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Density / max-width preset. Mirrors the M3 dialog width band.
 *
 *   - sm : 280px min / 400px max  (compact alert / picker)
 *   - md : 320px min / 560px max  (M3 default)
 *   - lg : 400px min / 720px max  (form / list / choice modal)
 */
export type ModalSize = "sm" | "md" | "lg";

/**
 * Corner shape. Default = `xl` (28dp) per the M3 dialog/modal spec.
 * Full shape scale is exposed for tonal/text/outlined variants that
 * may want a tighter or rounder radius.
 */
export type ModalShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type ModalOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "open"
  | "onClose"
  | "title"
  | "leadingIcon"
  | "trailingIcon"
  | "actions"
  | "scrim"
  | "scrimVariant"
  | "contained"
  | "disabled"
  | "disableEscapeClose"
  | "disableScrimClose"
  | "disableAutoFocus"
  | "disableFocusTrap"
  | "ariaLabel"
  | "ariaLabelledBy"
  | "ariaDescribedBy"
  | "children";

export interface ModalProps
  extends Omit<HTMLMotionProps<"div">, "ref" | ModalOwnKey> {
  /** Visual variant. Default `standard`. */
  variant?: ModalVariant;
  /** Density / max-width preset. Default `md`. */
  size?: ModalSize;
  /** Corner shape token. Default `xl` (28dp per M3). */
  shape?: ModalShape;
  /**
   * Controlled visibility. When false, the modal is animated out via
   * AnimatePresence (opacity + scale, M3 emphasized tween). Defaults
   * to true so the component is renderable without state in stories.
   */
  open?: boolean;
  /**
   * Fires when the user dismisses the modal (scrim click, Escape with
   * focus inside, or trailing-icon click). Mirrors MUI's `onClose`.
   */
  onClose?: () => void;
  /**
   * Optional headline. Renders typeset title-l in the modal header
   * row above the content slot.
   */
  title?: ReactNode;
  /** Leading icon slot — rendered to the start of the header row. */
  leadingIcon?: ReactNode;
  /**
   * Trailing icon slot — rendered to the end of the header row.
   * When set without an explicit `onClick` it fires `onClose`, giving
   * the modal a built-in close button without extra wiring.
   */
  trailingIcon?: ReactNode;
  /**
   * Trailing action row — typically a row of buttons. Aligned to the
   * end of the modal surface per M3.
   */
  actions?: ReactNode;
  /**
   * Render the scrim under the modal. Defaults to true. Set false for
   * inline / non-modal usage. The scrim is the M3 32%-opacity black
   * overlay used for modal flow.
   */
  scrim?: boolean;
  /**
   * Override the scrim variant — `filled` (M3 default), `tonal`,
   * `outlined`, or `invisible`. Forwarded to the internal Backdrop.
   */
  scrimVariant?: "filled" | "tonal" | "outlined" | "invisible";
  /**
   * Render the modal with `position: absolute` so it fills its
   * nearest positioned ancestor. Used in stories so the modal doesn't
   * eat the entire Storybook iframe.
   */
  contained?: boolean;
  /** Disable interaction (no click handler, dimmed to 0.38 opacity). */
  disabled?: boolean;
  /** Skip the Escape-to-close keybind. Default false. */
  disableEscapeClose?: boolean;
  /** Skip click-on-scrim-to-close. Default false. */
  disableScrimClose?: boolean;
  /** Skip auto-focusing the modal surface on open. Default false. */
  disableAutoFocus?: boolean;
  /**
   * Skip the Tab focus trap. Default false (focus stays inside the
   * modal). Disable for non-modal flows where surrounding controls
   * remain interactive.
   */
  disableFocusTrap?: boolean;
  /** Aliased `aria-label` for the modal surface. */
  ariaLabel?: string;
  /**
   * Aliased `aria-labelledby`. When `title` is supplied and no
   * explicit `aria-labelledby` is provided, the modal falls back to
   * the auto-generated title id.
   */
  ariaLabelledBy?: string;
  /** Aliased `aria-describedby`. */
  ariaDescribedBy?: string;
  /**
   * Body content. Renders below the optional header row and above the
   * trailing actions row.
   */
  children?: ReactNode;
}
