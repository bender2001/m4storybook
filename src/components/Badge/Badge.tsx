import {
  forwardRef,
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  anchorClasses,
  clampContent,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { BadgeProps } from "./types";

export type {
  BadgeAnchorOrigin,
  BadgeOverlap,
  BadgeProps,
  BadgeSize,
  BadgeVariant,
} from "./types";

/**
 * Default visibility heuristic — hide the badge when:
 *   - `invisible` is true,
 *   - the numeric content is 0 and `showZero` is false, or
 *   - sm (dot) and explicit `content` is empty (dots stay visible
 *     because they have no label to suppress).
 */
const resolveVisible = ({
  invisible,
  content,
  showZero,
  isDot,
}: {
  invisible?: boolean;
  content: ReactNode;
  showZero?: boolean;
  isDot: boolean;
}): boolean => {
  if (invisible) return false;
  if (isDot) return true;
  if (typeof content === "number") {
    if (content === 0 && !showZero) return false;
    return true;
  }
  if (content == null || content === "") return false;
  return true;
};

/**
 * M3-token-driven Badge. Wraps a target element (Avatar, IconButton,
 * tab) with an anchored count/dot, or renders standalone as an inline
 * pill. Supports the four variant colorings, three sizes, leading /
 * trailing icon slots, an interactive (button) mode with state layer,
 * and an entrance/exit transition driven by motion/react.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "filled",
    size = "md",
    content,
    max = 99,
    showZero = false,
    invisible = false,
    standalone: standaloneProp,
    anchorOrigin = "top-right",
    overlap = "rectangular",
    leadingIcon,
    trailingIcon,
    interactive: interactiveProp,
    disabled = false,
    selected = false,
    children,
    className,
    onClick,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onFocus,
    onBlur,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const interactive = interactiveProp ?? Boolean(onClick);
  const standalone = standaloneProp ?? !children;
  const isDot = size === "sm";

  const clamped = clampContent(content, max);
  const visible = resolveVisible({ invisible, content, showZero, isDot });

  const stateLayer = !interactive || disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      if (disabled) return;
      onClick?.(event);
    },
    [disabled, onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);
      if (!interactive || disabled) return;
      if (event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        (event.currentTarget as HTMLSpanElement).click();
        if (event.key === " ") setPressed(true);
      }
    },
    [disabled, interactive, onKeyDown],
  );

  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];
  const colorClass = selected ? styles.selected : styles.rest;
  const shape = shapeClasses[size];

  const anchor = anchorClasses[anchorOrigin][overlap];
  const role = interactive ? "button" : "status";
  const tabIndex = interactive && !disabled ? 0 : undefined;

  const computedLabel =
    ariaLabel ??
    (typeof clamped === "number" || typeof clamped === "string"
      ? `Badge: ${clamped}`
      : undefined);

  const badge = (
    <motion.span
      ref={ref}
      role={role}
      aria-label={computedLabel}
      aria-hidden={!visible || undefined}
      aria-disabled={disabled || undefined}
      aria-pressed={interactive && selected ? true : undefined}
      data-variant={variant}
      data-size={size}
      data-overlap={overlap}
      data-anchor={anchorOrigin}
      data-visible={visible || undefined}
      data-invisible={!visible || undefined}
      data-selected={selected || undefined}
      data-interactive={interactive || undefined}
      tabIndex={tabIndex}
      initial={false}
      animate={{
        scale: visible ? 1 : 0,
        opacity: visible ? 1 : 0,
      }}
      whileHover={interactive && !disabled && !reduced ? { scale: 1.06 } : undefined}
      whileTap={interactive && !disabled && !reduced ? { scale: 0.94 } : undefined}
      transition={reduced ? { duration: 0 } : springs.springy}
      onPointerEnter={(e) => {
        setHovered(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(e);
      }}
      onPointerDown={(e) => {
        if (interactive && !disabled) setPressed(true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        onPointerUp?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        setPressed(false);
        onBlur?.(e);
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={() => setPressed(false)}
      className={cn(
        anatomy.badge,
        sizes.container,
        sizes.minWidth,
        sizes.gap,
        shape,
        colorClass,
        !standalone && anatomy.badgeAnchored,
        !standalone && anchor.position,
        !standalone && anchor.transform,
        interactive && !disabled && anatomy.badgeInteractive,
        disabled && anatomy.badgeDisabled,
        !visible && anatomy.badgeInvisible,
        standalone && className,
      )}
      {...rest}
    >
      {!isDot && leadingIcon ? (
        <span aria-hidden data-slot="leading" className={cn(anatomy.iconLeading, sizes.iconBox)}>
          {leadingIcon}
        </span>
      ) : null}
      {!isDot ? (
        <span data-slot="label" className={anatomy.label}>
          {clamped as ReactNode}
        </span>
      ) : null}
      {!isDot && trailingIcon ? (
        <span aria-hidden data-slot="trailing" className={cn(anatomy.iconTrailing, sizes.iconBox)}>
          {trailingIcon}
        </span>
      ) : null}
      {interactive ? (
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, styles.stateLayer)}
          style={{ opacity: stateLayer }}
        />
      ) : null}
    </motion.span>
  );

  if (standalone) {
    return badge;
  }

  return (
    <span
      data-component="badge-wrapper"
      className={cn(anatomy.wrapper, className)}
    >
      {children}
      {badge}
    </span>
  );
});
