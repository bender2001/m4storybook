import {
  forwardRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import {
  anatomy,
  sizeClasses,
  stateClasses,
  variantClasses,
} from "./anatomy";
import type { IconProps, IconState } from "./types";

export type {
  IconProps,
  IconSize,
  IconState,
  IconVariant,
} from "./types";

/**
 * M3 Icon. The bare-glyph wrapper used in any slot that takes a 24dp
 * visual: lists, buttons, chips, app bars, snackbars, tabs. Distinct
 * from `IconButton` (interactive container with a state-layer) — the
 * Icon paints only the glyph + an optional fill from one of six color
 * variants, sized to the M3 icon scale.
 *
 * Spec: https://m3.material.io/styles/icons/overview
 *  - 6 variants : standard / primary / filled / tonal / outlined / error
 *  - 3 sizes    : sm 18dp / md 24dp (default) / lg 40dp glyph
 *  - 4 states   : default / selected / disabled / error
 *  - Motion     : springy press scale (interactive=true), collapses
 *                 under prefers-reduced-motion
 *  - A11y       : when `label` is set the icon is announced as
 *                 role="img" with aria-label; otherwise it is
 *                 aria-hidden=true (decorative)
 *  - Interactive: `interactive=true` promotes the wrapper to a
 *                 focusable button with Enter/Space activation and
 *                 the M3 focus ring; aria-pressed reflects `selected`.
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  {
    variant = "standard",
    size = "md",
    state: stateProp,
    children,
    label,
    decorative,
    leadingLabel,
    trailingLabel,
    interactive,
    selected,
    disabled,
    onActivate,
    className,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();

  // Resolve effective state. Explicit `state` always wins; otherwise
  // derive from the boolean shortcuts (`selected` / `disabled`).
  const state: IconState = stateProp
    ? stateProp
    : disabled
      ? "disabled"
      : selected
        ? "selected"
        : "default";

  const isDisabled = state === "disabled";
  const isSelected = state === "selected";
  const isError = state === "error";

  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];

  // Pick exactly ONE glyph color class so source-order layering does
  // not silently drop the state override behind the variant default.
  const glyphColor = isSelected
    ? stateClasses.selected
    : isError
      ? stateClasses.error
      : variantStyles.glyph;

  // Aria semantics: `decorative` forces aria-hidden, otherwise the
  // presence of `label` controls whether the icon is announced.
  const ariaProps = useMemo(() => {
    if (decorative || !label) {
      return { "aria-hidden": true } as const;
    }
    return {
      role: "img" as const,
      "aria-label": label,
    };
  }, [decorative, label]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);
      if (!interactive || isDisabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate?.();
      }
    },
    [interactive, isDisabled, onActivate, onKeyDown],
  );

  const handleClick = useCallback<NonNullable<typeof onClick>>(
    (event) => {
      onClick?.(event);
      if (!interactive || isDisabled) return;
      onActivate?.();
    },
    [interactive, isDisabled, onActivate, onClick],
  );

  const hasLabelSlot = Boolean(leadingLabel || trailingLabel);

  // Press scale: small + springy, only when interactive + motion on.
  const whileTap = interactive && !reduced && !isDisabled ? { scale: 0.94 } : undefined;
  const transition = reduced ? { duration: 0 } : springs.springy;

  return (
    <motion.span
      ref={ref}
      data-component="icon"
      data-variant={variant}
      data-size={size}
      data-state={state}
      data-interactive={interactive ? "" : undefined}
      tabIndex={interactive && !isDisabled ? 0 : undefined}
      aria-pressed={interactive && isSelected ? true : undefined}
      aria-disabled={isDisabled || undefined}
      whileTap={whileTap}
      transition={transition}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...ariaProps}
      {...rest}
      className={cn(
        anatomy.root,
        sizes.box,
        sizes.radius,
        variantStyles.container,
        glyphColor,
        hasLabelSlot && anatomy.withLabel,
        hasLabelSlot && "h-auto w-auto",
        interactive && !isDisabled && "cursor-pointer",
        interactive && anatomy.focusRing,
        isDisabled && stateClasses.disabled,
        className,
      )}
    >
      {leadingLabel ? (
        <span data-slot="leading-label" className={anatomy.label}>
          {leadingLabel}
        </span>
      ) : null}
      <span
        data-slot="glyph"
        aria-hidden
        className={cn(anatomy.glyph, sizes.glyph)}
      >
        {children}
      </span>
      {trailingLabel ? (
        <span data-slot="trailing-label" className={anatomy.label}>
          {trailingLabel}
        </span>
      ) : null}
    </motion.span>
  );
});
