import type { ReactNode } from "react";

/**
 * Transfer List has no native M3 spec, so this is the MUI dual-list
 * pattern re-skinned with M3 tokens (surface-container card, M3
 * Checkbox, M3 Icon Buttons for the move arrows).
 *
 * Visual variants:
 *  - filled (default) — surface-container-low cards with no border.
 *  - outlined — transparent cards with a 1dp outline-variant border.
 */
export type TransferListVariant = "filled" | "outlined";

/**
 * Density:
 *  - sm = compact 32dp rows (e.g. inline form pickers)
 *  - md = 40dp rows (default)
 *  - lg = 48dp rows (comfortable, marketing forms)
 */
export type TransferListSize = "sm" | "md" | "lg";

export interface TransferListItem {
  /** Stable id used for selection + react keys. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional secondary line (description / count). */
  description?: string;
  /** Disables this row in both source and target. */
  disabled?: boolean;
}

export interface TransferListProps {
  /** Items currently in the left (source) column. */
  source: TransferListItem[];
  /** Items currently in the right (target) column. */
  target: TransferListItem[];
  /** Fires when items move between columns. */
  onChange?: (next: { source: TransferListItem[]; target: TransferListItem[] }) => void;
  /** Visual style variant. */
  variant?: TransferListVariant;
  /** Density. */
  size?: TransferListSize;
  /** Header above the source column. */
  sourceLabel?: string;
  /** Header above the target column. */
  targetLabel?: string;
  /** Disables all interaction. */
  disabled?: boolean;
  /** Custom className passed to the root wrapper. */
  className?: string;
  /** Optional accessible name for the whole transfer-list region. */
  "aria-label"?: string;
  /** Optional rendered hint shown below the lists (e.g. counts). */
  helperText?: ReactNode;
}
