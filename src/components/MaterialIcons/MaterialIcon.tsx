import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import {
  anatomy,
  fontFamily,
  sizeClasses,
  stateClasses,
  variantClasses,
} from "./anatomy";
import {
  ICON_AXIS_ACTIVE_WEIGHT,
  ICON_AXIS_HOVER_FILL,
  ICON_AXIS_REST_FILL,
  ICON_AXIS_REST_WEIGHT,
  useIconAxisHints,
} from "./iconAxisContext";
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
    const axisHints = useIconAxisHints();

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

    // M3 Expressive variable-font axis driving: when an interactive
    // parent (Button, IconButton, BottomNavigation item, Tab, Chip
    // leading slot) provides `IconAxisContext`, we compute the target
    // FILL / wght axis values from the parent's hover + selected
    // hints. Otherwise, fall back to the static prop values so direct
    // consumers of `<MaterialIcon fill={…} weight={…} />` keep working.
    const parentDriven = axisHints !== null;
    const baseFill: number = fill !== undefined ? fill : isSelected ? 1 : 0;
    const baseWeight: number = weight;
    const targetFill: number = parentDriven
      ? axisHints.hovered || axisHints.selected
        ? ICON_AXIS_HOVER_FILL
        : ICON_AXIS_REST_FILL
      : baseFill;
    const targetWeight: number = parentDriven
      ? axisHints.selected
        ? ICON_AXIS_ACTIVE_WEIGHT
        : ICON_AXIS_REST_WEIGHT
      : baseWeight;

    // Selected glyphs are filled by default per the M3 spec, unless
    // the caller explicitly sets `fill`.
    const effectiveFill: 0 | 1 = (
      targetFill >= 0.5 ? 1 : 0
    ) as 0 | 1;

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

    // Variable-font axes can't be reliably tweened via CSS transitions
    // (Safari + Firefox round mid-tween values to discrete steps), so
    // we drive FILL + wght through motion/react motion values and
    // recompose `font-variation-settings` via `useMotionTemplate`.
    // GRAD + opsz stay static (no Expressive guidance to tween them).
    const fillMV = useMotionValue<number>(targetFill);
    const weightMV = useMotionValue<number>(targetWeight);

    useEffect(() => {
      if (reduced) {
        fillMV.set(targetFill);
        return;
      }
      const controls = animate(fillMV, targetFill, {
        duration: 0.18,
        ease: "easeOut",
      });
      return () => controls.stop();
    }, [fillMV, reduced, targetFill]);

    useEffect(() => {
      if (reduced) {
        weightMV.set(targetWeight);
        return;
      }
      const controls = animate(weightMV, targetWeight, {
        duration: 0.2,
        ease: "easeOut",
      });
      return () => controls.stop();
    }, [reduced, targetWeight, weightMV]);

    const fontVariationSettings = useMotionTemplate`"FILL" ${fillMV}, "wght" ${weightMV}, "GRAD" ${grade}, "opsz" ${sizes.opsz}`;

    const glyphStyle: CSSProperties = {
      fontFamily: fontFamily[iconStyle],
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
        data-weight={targetWeight}
        data-grade={grade}
        data-axis-driven={parentDriven || undefined}
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
        <motion.span
          data-slot="glyph"
          aria-hidden
          className={cn(anatomy.glyph, sizes.glyph)}
          style={{ ...glyphStyle, fontVariationSettings }}
        >
          {name}
        </motion.span>
        {trailingLabel ? (
          <span data-slot="trailing-label" className={anatomy.label}>
            {trailingLabel}
          </span>
        ) : null}
      </motion.span>
    );
  },
);
