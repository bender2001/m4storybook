import type { ReactNode } from "react";

export type AutocompleteVariant = "filled" | "outlined";
export type AutocompleteSize = "sm" | "md" | "lg";

export interface AutocompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AutocompleteProps {
  /** Visible label that floats above the field when focused or filled. */
  label?: string;
  /** Available options. */
  options: AutocompleteOption[];
  /** Currently selected option value. */
  value?: string | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: string | null;
  /** Fires whenever a different option is selected. */
  onChange?: (value: string | null, option: AutocompleteOption | null) => void;
  /** Currently typed text. */
  inputValue?: string;
  /** Initial input value for uncontrolled use. */
  defaultInputValue?: string;
  /** Fires on every keystroke. */
  onInputChange?: (input: string) => void;
  /** M3 token-driven variant. */
  variant?: AutocompleteVariant;
  /** Container size / density. */
  size?: AutocompleteSize;
  /** Disabled state. Suppresses interactions and the state-layer. */
  disabled?: boolean;
  /** Error state. Swaps role colors to the error palette. */
  error?: boolean;
  /** Helper text rendered under the field. */
  helperText?: ReactNode;
  /** Optional leading icon (e.g. search). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon. Replaced by the chevron when none is provided. */
  trailingIcon?: ReactNode;
  /** Placeholder text shown when there is no input. */
  placeholder?: string;
  /** Stable id; auto-generated when omitted. */
  id?: string;
  /** Field name for native form submission. */
  name?: string;
  /** Optional aria-label override; otherwise label is used. */
  "aria-label"?: string;
  /** Custom className passed to the root wrapper. */
  className?: string;
}
