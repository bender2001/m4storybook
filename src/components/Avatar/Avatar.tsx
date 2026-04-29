import {
  forwardRef,
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  deriveInitials,
  morphTarget,
  shapeClasses,
  sizeClasses,
  statusClasses,
  variantClasses,
} from "./anatomy";
import type { AvatarProps } from "./types";

export type {
  AvatarProps,
  AvatarShape,
  AvatarSize,
  AvatarStatus,
  AvatarVariant,
} from "./types";

/**
 * M3-token-driven Avatar. Renders an image (with graceful fallback to
 * initials/icon), supports four color variants, three shapes, three
 * sizes, an optional presence dot, and an interactive (button-style)
 * mode with state layer + shape morph on hover/focus.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    variant = "filled",
    size = "md",
    shape = "circular",
    src,
    alt,
    children,
    interactive: interactiveProp,
    disabled = false,
    status,
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
  const [imageFailed, setImageFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Avatar is interactive when explicitly opted in OR when an onClick is
  // provided. Non-interactive avatars render as plain decorative img-like
  // surfaces with role="img" + the resolved label.
  const interactive = interactiveProp ?? Boolean(onClick);

  const showImage = !!src && !imageFailed;
  const fallbackContent = children ?? deriveInitials(alt);
  const computedLabel = ariaLabel ?? alt ?? (typeof fallbackContent === "string"
    ? fallbackContent
    : undefined);

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
    (event: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(event);
    },
    [disabled, onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!interactive || disabled) return;
      if (event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        // Synthesize a click so consumers only need onClick.
        (event.currentTarget as HTMLDivElement).click();
        if (event.key === " ") setPressed(true);
      }
    },
    [disabled, interactive, onKeyDown],
  );

  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];

  // M3 Expressive shape morph: when the avatar is interactive AND
  // circular, hover/focus morph the container to shape-md. Static
  // shapes (rounded, square) keep their assigned shape.
  const morph = interactive && !disabled && (hovered || focused || pressed);
  const radiusClass = morph ? morphTarget[shape] : shapeClasses[shape];

  const role = interactive ? "button" : "img";
  const tabIndex = interactive && !disabled ? 0 : undefined;

  return (
    <motion.div
      ref={ref}
      role={role}
      aria-label={computedLabel}
      aria-disabled={disabled || undefined}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-interactive={interactive || undefined}
      data-status={status}
      tabIndex={tabIndex}
      whileHover={interactive && !disabled && !reduced ? { scale: 1.04 } : undefined}
      whileTap={interactive && !disabled && !reduced ? { scale: 0.96 } : undefined}
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
        anatomy.root,
        sizes.container,
        radiusClass,
        styles.rest,
        interactive && !disabled && anatomy.rootInteractive,
        disabled && anatomy.rootDisabled,
        className,
      )}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? ""}
          className={anatomy.image}
          draggable={false}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden={Boolean(alt) || undefined} className={cn(anatomy.fallback, sizes.text)}>
          {fallbackContent}
        </span>
      )}
      {interactive ? (
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, styles.stateLayer)}
          style={{ opacity: stateLayer }}
        />
      ) : null}
      {status ? (
        <span
          aria-label={`Status: ${status}`}
          data-status-indicator
          role="status"
          className={cn(anatomy.status, sizes.status, statusClasses[status])}
        />
      ) : null}
    </motion.div>
  );
});
