import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/cn";
import {
  anatomy,
  easingCurves,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  TransitionsDirection,
  TransitionsProps,
  TransitionsSize,
  TransitionsVariant,
} from "./types";

export type {
  TransitionsDirection,
  TransitionsProps,
  TransitionsShape,
  TransitionsSize,
  TransitionsVariant,
} from "./types";

type EasingKey = keyof typeof easingCurves;

/**
 * M3-tokenized Transitions wrapper.
 *
 * Re-skins the MUI transition primitives
 * (https://mui.com/material-ui/transitions/) — `Fade`, `Grow`, `Slide`,
 * `Zoom`, `Collapse` — onto a single motion/react surface that drives
 * each animation through the M3 motion tokens
 * (https://m3.material.io/styles/motion/easing-and-duration/tokens-specs).
 *
 *   - 5 variants  : fade / grow / slide / zoom / collapse
 *   - 3 sizes     : sm (200ms / short4) · md (300ms / medium2) · lg (450ms / long1)
 *   - 7 shapes    : full M3 corner scale
 *   - direction   : up / down / left / right (slide), vertical / horizontal (collapse)
 *   - states      : selected (secondary-container) / error / disabled (0.38)
 *   - slots       : leading-icon + label + trailing-icon header, fallback slot
 *   - a11y        : `aria-hidden` while exiting, `aria-busy` while pending,
 *                    `aria-disabled` / `aria-invalid` mirror state, focus
 *                    ring on the wrapper for keyboard parity
 *   - reduced     : duration collapses to 0 and the variant becomes a
 *                    fade so layout never shifts (useReducedMotion)
 */
function TransitionsInner(
  {
    variant = "fade",
    size = "md",
    shape = "md",
    direction,
    in: inProp = true,
    appear = true,
    unmountOnExit = true,
    mountOnEnter = false,
    timeout,
    easing,
    disabled = false,
    selected = false,
    error = false,
    label,
    leadingIcon,
    trailingIcon,
    fallback,
    children,
    onEntered,
    onExited,
    className,
    "aria-label": ariaLabel,
    ...rest
  }: TransitionsProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const reduced = useReducedMotion();
  const colors = variantClasses[variant];
  const sizes = sizeClasses[size];
  const radius = shapeClasses[shape];

  const fillClass = error
    ? colors.error
    : selected
      ? colors.selected
      : colors.rest;

  const showHeader = Boolean(label || leadingIcon || trailingIcon);

  const resolvedDirection: TransitionsDirection = direction ?? defaultDirection(variant);
  const resolvedDurationMs = timeout ?? sizes.durationMs;
  const resolvedEasing: EasingKey = easing ?? (variant === "fade" ? "standard" : "emphasized");
  const easingCurve = easingCurves[resolvedEasing];

  // Track first paint so `appear=false` skips the enter animation. The
  // wrapper still mounts; we just feed AnimatePresence `initial={false}`.
  const firstPaint = useRef(true);
  useEffect(() => {
    firstPaint.current = false;
  }, []);
  const initialState = appear ? "exit" : "enter";

  const [hasMounted, setHasMounted] = useState(!mountOnEnter || inProp);
  useEffect(() => {
    if (inProp) setHasMounted(true);
  }, [inProp]);

  const showChildren = inProp && hasMounted;

  const motionVariants = useMemo<Variants>(() => {
    if (reduced) {
      return {
        enter: { opacity: 1, height: "auto", width: "auto", scale: 1, x: 0, y: 0 },
        exit: { opacity: 0, height: "auto", width: "auto", scale: 1, x: 0, y: 0 },
      };
    }
    return buildVariants(variant, resolvedDirection);
  }, [reduced, variant, resolvedDirection]);

  const transition: Transition = reduced
    ? { duration: 0 }
    : {
        duration: resolvedDurationMs / 1000,
        ease: easingCurve,
      };

  const handleEnterComplete = useCallback(() => {
    onEntered?.();
  }, [onEntered]);

  const handleExitComplete = useCallback(() => {
    if (unmountOnExit) {
      // Children unmount via AnimatePresence; the body slot below
      // re-renders without this branch on the next pass.
    }
    onExited?.();
  }, [onExited, unmountOnExit]);

  const childKey = "transitions-body";

  // Collapse needs `overflow-hidden` so the height clip looks right
  // while motion/react drives auto -> 0.
  const isCollapse = variant === "collapse";

  return (
    <motion.div
      ref={ref}
      data-component="transitions"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-direction={resolvedDirection}
      data-in={inProp || undefined}
      data-selected={selected || undefined}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
      data-easing={resolvedEasing}
      data-duration-ms={resolvedDurationMs}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      aria-invalid={error || undefined}
      aria-busy={!showChildren || undefined}
      aria-hidden={!showChildren && unmountOnExit ? true : undefined}
      initial={false}
      animate={{ opacity: disabled ? 0.38 : 1 }}
      transition={transition}
      className={cn(
        anatomy.root,
        sizes.pad,
        sizes.gap,
        sizes.minH,
        sizes.bodyType,
        radius,
        fillClass,
        colors.border,
        colors.elevation,
        disabled && anatomy.disabled,
        isCollapse && anatomy.collapseClip,
        className,
      )}
      {...rest}
    >
      {showHeader ? (
        <div data-slot="header" className={cn(anatomy.header, sizes.headerType)}>
          {leadingIcon ? (
            <span
              aria-hidden
              data-slot="icon-leading"
              className={cn(anatomy.icon, colors.iconColor)}
            >
              {leadingIcon}
            </span>
          ) : null}
          {label ? <span data-slot="label">{label}</span> : null}
          {trailingIcon ? (
            <span
              aria-hidden
              data-slot="icon-trailing"
              className={cn(anatomy.icon, colors.iconColor, "ml-auto")}
            >
              {trailingIcon}
            </span>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence
        initial={appear}
        mode="wait"
        onExitComplete={handleExitComplete}
      >
        {showChildren ? (
          <motion.div
            key={childKey}
            data-slot="body"
            data-state="entered"
            className={anatomy.body}
            variants={motionVariants}
            initial={appear || !firstPaint.current ? "exit" : false}
            animate="enter"
            exit="exit"
            transition={transition}
            onAnimationComplete={(definition) => {
              if (definition === "enter") handleEnterComplete();
            }}
          >
            {children as ReactNode}
          </motion.div>
        ) : !unmountOnExit && hasMounted ? (
          <motion.div
            key={childKey}
            data-slot="body"
            data-state="hidden"
            aria-hidden
            className={anatomy.body}
            variants={motionVariants}
            initial={initialState}
            animate="exit"
            exit="exit"
            transition={transition}
          >
            {children as ReactNode}
          </motion.div>
        ) : fallback !== undefined && fallback !== null ? (
          <motion.div
            key="fallback"
            data-slot="fallback"
            className={cn(anatomy.fallback, sizes.bodyType)}
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {fallback}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function defaultDirection(variant: TransitionsVariant): TransitionsDirection {
  switch (variant) {
    case "slide":
      return "up";
    case "collapse":
      return "vertical";
    default:
      return "up";
  }
}

const SLIDE_DISTANCE: Record<TransitionsSize, number> = {
  sm: 24,
  md: 48,
  lg: 96,
};

function buildVariants(
  variant: TransitionsVariant,
  direction: TransitionsDirection,
): Variants {
  switch (variant) {
    case "fade":
      return {
        enter: { opacity: 1 },
        exit: { opacity: 0 },
      };
    case "grow":
      return {
        enter: { opacity: 1, scale: 1, transformOrigin: "center" },
        exit: { opacity: 0, scale: 0, transformOrigin: "center" },
      };
    case "zoom":
      return {
        enter: { opacity: 1, scale: 1, transformOrigin: "center" },
        exit: { opacity: 0, scale: 0.6, transformOrigin: "center" },
      };
    case "slide": {
      const distance = SLIDE_DISTANCE.md;
      const exit = slideOffset(direction, distance);
      return {
        enter: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, ...exit },
      };
    }
    case "collapse":
      if (direction === "horizontal") {
        return {
          enter: { opacity: 1, width: "auto" },
          exit: { opacity: 0, width: 0 },
        };
      }
      return {
        enter: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
      };
    default:
      return {
        enter: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
}

function slideOffset(direction: TransitionsDirection, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return { y: distance };
  }
}

export const Transitions = forwardRef(TransitionsInner);
