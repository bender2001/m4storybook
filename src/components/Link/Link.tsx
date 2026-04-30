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
  errorClasses,
  shapeClasses,
  sizeClasses,
  underlineClasses,
  variantClasses,
} from "./anatomy";
import type { LinkProps } from "./types";

export type {
  LinkActivateEvent,
  LinkProps,
  LinkShape,
  LinkSize,
  LinkUnderline,
  LinkVariant,
} from "./types";

/** Default trailing arrow used by `external` links. */
const ExternalGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3zM19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" />
  </svg>
);

/**
 * M3-tokenized Link.
 *
 *   - Renders a native `<a>` element so screen readers + middle-click
 *     + Cmd/Ctrl-click behave correctly.
 *   - Resting foreground paints `primary` per M3 link guidance; chip
 *     variants (filled / tonal / outlined / elevated) re-skin the host
 *     using M3 surface roles.
 *   - State-layer opacities follow the M3 input library
 *     (hover 0.08 / focus 0.10 / pressed 0.10).
 *   - Press feedback rides the M3 Expressive `springs.gentle` preset;
 *     reduced motion collapses it to instant.
 *   - `external` links are tagged with `target="_blank"` +
 *     `rel="noopener noreferrer"` and surface a default trailing
 *     external-arrow glyph if no custom `trailingIcon` is provided.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    variant = "text",
    size = "md",
    shape = "full",
    underline,
    selected = false,
    disabled = false,
    error = false,
    leadingIcon,
    trailingIcon,
    external = false,
    onActivate,
    onClick,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onFocus,
    onBlur,
    target,
    rel,
    href,
    className,
    children,
    "aria-current": ariaCurrent,
    "aria-disabled": ariaDisabled,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const sizes = sizeClasses[size];
  const styles = variantClasses[variant];

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const interactive = !disabled;
  const stateLayer = !interactive
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const restPaint = error ? errorClasses.rest : styles.rest;
  const selectedPaint = error ? errorClasses.selected : styles.selected;
  const borderPaint = error ? errorClasses.border : styles.border;
  const stateLayerPaint = error ? errorClasses.stateLayer : styles.stateLayer;

  // The default underline policy depends on the variant: text links
  // underline on hover (M3 a11y guidance for inline text); chip-style
  // hosts paint the pill surface themselves so we drop the underline.
  const resolvedUnderline =
    underline ?? (variant === "text" || variant === "outlined" ? "hover" : "none");

  const isExternal = external || target === "_blank";
  const resolvedTarget = target ?? (external ? "_blank" : undefined);
  const resolvedRel =
    rel ?? (isExternal ? "noopener noreferrer" : undefined);
  const showExternalGlyph =
    external && trailingIcon === undefined && !disabled;

  const hostClass = cn(
    anatomy.root,
    selected ? selectedPaint : restPaint,
    borderPaint,
    shapeClasses[shape],
    sizes.labelType,
    underlineClasses[resolvedUnderline],
    variant !== "text" && sizes.pad,
    variant !== "text" && sizes.gap,
    variant === "elevated" && styles.elevation,
    variant === "text" && (leadingIcon || trailingIcon || showExternalGlyph
      ? sizes.gap
      : ""),
    disabled && anatomy.disabled,
    className,
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (event.defaultPrevented) return;
      onActivate?.(event);
    },
    [disabled, onClick, onActivate],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        if (event.key === " ") event.preventDefault();
        onActivate?.(event);
      }
    },
    [disabled, onKeyDown, onActivate],
  );

  // Variant-aware host height: text variant flows inline so we don't
  // pin a min-height (the surrounding type metrics drive it); chip
  // variants step through the M3 chip density scale.
  const hostStyle =
    variant === "text" ? undefined : { minHeight: sizes.height };

  return (
    <a
      ref={ref}
      href={disabled ? undefined : href}
      target={resolvedTarget}
      rel={resolvedRel}
      data-component="link"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-underline={resolvedUnderline}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-external={isExternal || undefined}
      data-hovered={(interactive && hovered) || undefined}
      data-focused={(interactive && focused) || undefined}
      data-pressed={(interactive && pressed) || undefined}
      aria-current={selected ? ariaCurrent ?? "page" : ariaCurrent}
      aria-disabled={disabled || ariaDisabled || undefined}
      tabIndex={disabled ? -1 : 0}
      style={hostStyle}
      className={hostClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        if (interactive) setPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        setPressed(false);
        onBlur?.(event);
      }}
      {...rest}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.stateLayer, stateLayerPaint)}
        style={{ opacity: stateLayer }}
      />
      {leadingIcon ? (
        <span
          data-slot="icon-leading"
          className={cn(anatomy.icon, sizes.iconSize)}
        >
          {leadingIcon}
        </span>
      ) : null}
      <motion.span
        data-slot="label"
        className={anatomy.label}
        initial={false}
        animate={{
          scale: pressed && interactive && !reduced ? 0.97 : 1,
        }}
        transition={reduced ? { duration: 0 } : springs.gentle}
      >
        {children}
      </motion.span>
      {trailingIcon ? (
        <span
          data-slot="icon-trailing"
          className={cn(anatomy.icon, sizes.iconSize)}
        >
          {trailingIcon}
        </span>
      ) : showExternalGlyph ? (
        <span
          data-slot="icon-trailing"
          data-icon="external"
          className={cn(anatomy.icon, sizes.iconSize)}
        >
          <ExternalGlyph />
        </span>
      ) : null}
    </a>
  );
});
