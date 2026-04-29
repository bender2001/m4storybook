import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Severity = the semantic role the alert is communicating. M3 doesn't
 * have first-class success / warning / info / error roles, so we map
 * them onto the standard M3 color roles per the M3 banner spec
 * (https://m3.material.io/components/banners) plus the M3 error role:
 *
 *   - info     -> primary scheme
 *   - success  -> secondary scheme  (M3 secondary is typically green-
 *                 adjacent in the tonal palettes that ship with the
 *                 official M3 baseline)
 *   - warning  -> tertiary scheme
 *   - error    -> error scheme
 */
export type AlertSeverity = "info" | "success" | "warning" | "error";

/**
 * Visual variant per MUI Alert + the M3 banner shape:
 *
 *   - filled    : solid container painted with the severity color +
 *                 on-color text. High emphasis.
 *   - tonal     : container painted with the severity-container token
 *                 + on-container text. M3 default.
 *   - outlined  : transparent container with a 1dp severity-color
 *                 border + severity-color text.
 *   - text      : transparent container, severity-color text, no
 *                 border. Lowest emphasis.
 */
export type AlertVariant = "filled" | "tonal" | "outlined" | "text";

/**
 * Density scale.
 *   - sm : 32dp height, body-s 12px text, 16dp icon, 8dp gutter
 *   - md : 48dp height, body-m 14px text, 20dp icon, 12dp gutter
 *   - lg : 56dp height, body-l 16px text, 24dp icon, 16dp gutter
 */
export type AlertSize = "sm" | "md" | "lg";

/** Corner shape scale. M3 banner default is `sm` (8dp). */
export type AlertShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type AlertOwnKey =
  | "severity"
  | "variant"
  | "size"
  | "shape"
  | "title"
  | "icon"
  | "action"
  | "onClose"
  | "closeLabel"
  | "disabled"
  | "open"
  | "children";

export interface AlertProps
  extends Omit<HTMLMotionProps<"div">, "ref" | AlertOwnKey> {
  /** Semantic severity — drives color scheme + ARIA role. Default `info`. */
  severity?: AlertSeverity;
  /** Visual variant. Default `tonal` per the M3 banner spec. */
  variant?: AlertVariant;
  /** Density. Default `md`. */
  size?: AlertSize;
  /** Corner shape token. Default `sm` per the M3 banner spec. */
  shape?: AlertShape;
  /**
   * Optional title slot — typeset as `title-m` above the body text
   * per the MUI Alert + M3 banner two-line variant.
   */
  title?: ReactNode;
  /**
   * Leading icon slot. When omitted, a severity-appropriate default
   * glyph is rendered. Pass `false` to suppress the icon entirely.
   */
  icon?: ReactNode | false;
  /** Trailing action slot — typically a text/outlined button. */
  action?: ReactNode;
  /**
   * If provided, renders a trailing close icon button. The handler
   * fires when the user clicks the close affordance OR presses
   * Escape with focus inside the alert.
   */
  onClose?: () => void;
  /** aria-label for the close icon button. Default "Close alert". */
  closeLabel?: string;
  /** Dim + disable the alert (opacity 0.38, no pointer events). */
  disabled?: boolean;
  /**
   * Controlled visibility. When false, the alert is animated out via
   * AnimatePresence (height + opacity, M3 emphasized 300ms).
   * Defaults to true (always visible).
   */
  open?: boolean;
  /** Body text. */
  children?: ReactNode;
}
