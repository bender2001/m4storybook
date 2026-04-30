import type { HTMLMotionProps } from "motion/react";
import type { Key, ReactNode } from "react";

/**
 * Timeline is an MUI Lab fallback re-skinned with M3 tokens. Material 3
 * has no formal Timeline spec, so this follows the project's "MUI
 * fallback" rule: it ports the MUI Lab Timeline behaviour
 * (https://mui.com/material-ui/react-timeline/) and paints it through
 * M3 surface, shape, elevation, and motion tokens.
 *
 * Anatomy mirrors the MUI primitive matrix:
 *
 *   <Timeline>
 *     <TimelineItem>
 *       <TimelineOppositeContent />   (optional; rendered when supplied)
 *       <TimelineSeparator>
 *         <TimelineDot />              (paints a colored dot, optional inner icon)
 *         <TimelineConnector />        (vertical stroke between dots)
 *       </TimelineSeparator>
 *       <TimelineContent />
 *     </TimelineItem>
 *   </Timeline>
 *
 * Surface variants drive the dot fill, the connector tint, and the
 * surface paint of each event card. The expressive selection cursor
 * here is the *active dot* — it morphs between rows via a shared
 * `layoutId` motion span (the same M3 Expressive selection morph used
 * by Tabs / Stepper / Pagination / DataGrid / TreeView). Each event
 * row enters via `motion/react` springs (`springs.springy`) on a
 * y-translate + opacity + scale morph; collapses to a flat fade under
 * `useReducedMotion`.
 *
 * State-layer opacities follow M3:
 *
 *   - hover    : 0.08 of the current foreground role
 *   - focus    : 0.10
 *   - pressed  : 0.10
 *   - dragged  : 0.16  (unused here)
 *
 * Motion tokens (from `src/tokens/motion.ts`):
 *
 *   - Item enter / exit         : `springs.springy` y-translate + opacity
 *   - Active dot morph          : `springs.springy` shared `layoutId`
 *   - State-layer opacity       : `short4` (200ms) / `standard`
 *   - Container transitions     : `medium2` (300ms) / `emphasized`
 */

/**
 * Surface variant. Drives the host wrapper paint, the dot fill, the
 * connector tint, and the active-dot cursor color.
 *
 *   - text     : transparent host, primary dot/cursor (default)
 *   - filled   : `surface-container-highest` host, primary dot
 *   - tonal    : `secondary-container` host, secondary dot/cursor
 *   - outlined : transparent host with 1dp `outline-variant` border
 *   - elevated : `surface-container-low` host with elevation-2 shadow
 */
export type TimelineVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density scale.
 *
 *   sm : 24dp dot, body-s, 16dp row gap
 *   md : 28dp dot, body-m, 24dp row gap (M3 default)
 *   lg : 36dp dot, body-l, 32dp row gap
 */
export type TimelineSize = "sm" | "md" | "lg";

/** Wrapper + event-card shape token. */
export type TimelineShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Layout positions (mirrors MUI's `position` / `align` props):
 *
 *   - left      : opposite content on the left, content on the right
 *   - right     : opposite content on the right, content on the left
 *   - alternate : odd items on the right, even items on the left
 *   - alternate-reverse : odd items on the left, even items on the right
 */
export type TimelinePosition =
  | "left"
  | "right"
  | "alternate"
  | "alternate-reverse";

/**
 * Per-dot color role. Mirrors MUI's TimelineDot `color` prop and snaps
 * each dot to an M3 token pair (background + foreground role).
 */
export type TimelineDotColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "neutral";

/** Per-dot fill mode. Mirrors MUI's TimelineDot `variant` prop. */
export type TimelineDotVariant = "filled" | "outlined";

/**
 * Per-connector emphasis. Solid is the default M3 stroke; dashed is a
 * 4dp dash pattern; faded paints in the `outline-variant` role for
 * trailing or "future" connector segments.
 */
export type TimelineConnectorVariant = "solid" | "dashed" | "faded";

/** Resolved per-row render state. */
export type TimelineItemState =
  | "default"
  | "hover"
  | "focus"
  | "pressed"
  | "selected"
  | "disabled"
  | "error";

/**
 * Single timeline event descriptor.
 *
 *   - `id`             : stable item id (used as React key + selection key)
 *   - `label`          : primary content label (string or ReactNode)
 *   - `secondary`      : optional secondary text shown below the label
 *   - `oppositeContent`: optional content on the opposite side of the rail
 *   - `dotIcon`        : optional inline glyph painted inside the dot
 *   - `dotColor`       : per-dot color role (defaults to `primary`)
 *   - `dotVariant`     : per-dot fill mode (defaults to `filled`)
 *   - `connectorVariant`: per-connector emphasis (defaults to `solid`)
 *   - `disabled`       : marks the row as non-interactive
 *   - `error`          : paints the row in the M3 `error` foreground role
 *   - `last`           : forces the connector off (last row in a custom slice)
 */
export interface TimelineEvent {
  id: string;
  label: ReactNode;
  secondary?: ReactNode;
  oppositeContent?: ReactNode;
  dotIcon?: ReactNode;
  dotColor?: TimelineDotColor;
  dotVariant?: TimelineDotVariant;
  connectorVariant?: TimelineConnectorVariant;
  disabled?: boolean;
  error?: boolean;
  last?: boolean;
}

type TimelineOwnKey =
  | "events"
  | "variant"
  | "size"
  | "shape"
  | "position"
  | "ariaLabel"
  | "selectable"
  | "selected"
  | "defaultSelected"
  | "onSelectedChange"
  | "focusedId"
  | "defaultFocusedId"
  | "onFocusedChange"
  | "disabled"
  | "showCursor";

export interface TimelineProps
  extends Omit<HTMLMotionProps<"div">, TimelineOwnKey | keyof { key: Key }> {
  /** Ordered list of events to render. */
  events: TimelineEvent[];
  /** Surface variant. Defaults to `text`. */
  variant?: TimelineVariant;
  /** Density. Defaults to `md`. */
  size?: TimelineSize;
  /** Wrapper + event-card shape. Defaults to `md`. */
  shape?: TimelineShape;
  /** Layout position. Defaults to `right`. */
  position?: TimelinePosition;
  /** Accessible name for the `role="list"` host. */
  ariaLabel?: string;
  /** Whether rows are interactive (clickable + keyboard-focusable). */
  selectable?: boolean;
  /** Controlled selected event id (single-select). */
  selected?: string | null;
  /** Initial selected event id when uncontrolled. */
  defaultSelected?: string | null;
  /** Fires whenever the selection changes. */
  onSelectedChange?: (id: string | null) => void;
  /** Controlled focused (tabbable) event id. */
  focusedId?: string | null;
  /** Initial focused event id when uncontrolled. */
  defaultFocusedId?: string | null;
  /** Fires whenever the focused (tabbable) event changes. */
  onFocusedChange?: (id: string | null) => void;
  /** Disables the entire timeline. */
  disabled?: boolean;
  /**
   * Show the M3 Expressive active-dot cursor (a halo that springs
   * between focused dots via shared `layoutId`). Defaults to `true`.
   */
  showCursor?: boolean;
}
