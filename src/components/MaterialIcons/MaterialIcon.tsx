import {
  forwardRef,
  useCallback,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import {
  anatomy,
  fontFamily,
  sizeClasses,
  stateClasses,
  variantClasses,
} from "./anatomy";
import type { MaterialIconProps, MaterialIconState } from "./types";

export type {
  MaterialIconProps,
  MaterialIconSize,
  MaterialIconState,
  MaterialIconStyle,
  MaterialIconVariant,
} from "./types";

/**
 * M3 Material Symbols. Variable-font icon wrapper that paints a glyph
 * via the Material Symbols font ligature (FILL / wght / GRAD / opsz
 * axes). The glyph is selected by `name` (e.g. "favorite", "home"),
 * styled by `iconStyle` (outlined / rounded / sharp), and recolored by
 * `variant` + `state`.
 *
 * Spec: https://m3.material.io/styles/icons/applying-icons
 *  - 3 styles   : outlined / rounded / sharp
 *  - 6 variants : standard / primary / filled / tonal / outlined-box / error
 *  - 3 sizes    : sm 20dp / md 24dp (default) / lg 40dp glyph
 *  - 4 states   : default / selected / disabled / error
 *  - 4 axes     : FILL 0|1, wght 100..700, GRAD -25|0|200, opsz 20..48
 *  - Motion     : springy press scale (interactive=true), collapses
 *                  under prefers-reduced-motion
 *  - A11y       : when `label` is set the icon is announced as
 *                  role="img" with aria-label; otherwise it is
 *                  aria-hidden=true (decorative) and the ligature
 *                  text is hidden from AT
 *  - Selected   : automatically toggles FILL=1 (M3 selected glyphs
 *                  are filled) when `selected` is true and `fill`
 *                  was not explicitly set
 */
export const MaterialIcon = forwardRef<HTMLSpanElement, MaterialIconProps>(
  function MaterialIcon(
    {
      name,
      iconStyle = "outlined",
      variant = "standard",
      size = "md",
      state: stateProp,
      fill,
      weight = 400,
      grade = 0,
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
    const state: MaterialIconState = stateProp
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

    // Selected glyphs are filled by default per the M3 spec, unless
    // the caller explicitly sets `fill`.
    const effectiveFill: 0 | 1 = fill !== undefined ? fill : isSelected ? 1 : 0;

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
    const whileTap =
      interactive && !reduced && !isDisabled ? { scale: 0.94 } : undefined;
    const transition = reduced ? { duration: 0 } : springs.springy;

    // Compose font-variation-settings for the four axes. Order does
    // not affect the rendered glyph but stays stable for snapshot
    // testing.
    const glyphStyle: CSSProperties = {
      fontFamily: fontFamily[iconStyle],
      fontVariationSettings: `'FILL' ${effectiveFill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${sizes.opsz}`,
    };

    return (
      <motion.span
        ref={ref}
        data-component="material-icon"
        data-icon-style={iconStyle}
        data-name={name}
        data-variant={variant}
        data-size={size}
        data-state={state}
        data-fill={effectiveFill}
        data-weight={weight}
        data-grade={grade}
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
          style={glyphStyle}
        >
          {name}
        </span>
        {trailingLabel ? (
          <span data-slot="trailing-label" className={anatomy.label}>
            {trailingLabel}
          </span>
        ) : null}
      </motion.span>
    );
  },
);
