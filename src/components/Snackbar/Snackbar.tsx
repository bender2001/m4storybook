import {
  forwardRef,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  originOffsets,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { SnackbarProps } from "./types";

export type {
  SnackbarCloseReason,
  SnackbarOrigin,
  SnackbarProps,
  SnackbarShape,
  SnackbarSize,
  SnackbarVariant,
} from "./types";

const CloseGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

/**
 * M3 Expressive Snackbar.
 *
 * Implements the M3 spec at
 * https://m3.material.io/components/snackbar/specs:
 *  - 48dp container height (md density), 4dp container shape
 *  - `inverse-surface` host fill, `inverse-on-surface` label,
 *    `inverse-primary` action label
 *  - elevation level 3 (filled / elevated treatments)
 *  - emphasized motion: enter slides toward the layout center,
 *    exit reverses the translation and fades; reduced-motion
 *    collapses the duration to 0 while keeping the opacity step
 *
 * Variants (`filled` / `tonal` / `outlined` / `elevated`) re-skin
 * the host surface; sizes (`sm` / `md` / `lg`) scale the shell
 * height + the typography role; shape tokens morph the corners
 * for floating-card treatments.
 */
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  function Snackbar(
    {
      variant = "filled",
      size = "md",
      shape = "xs",
      origin = "bottom-center",
      open = true,
      onClose,
      autoHideDuration = null,
      message,
      action,
      icon,
      showClose = false,
      closeLabel = "Close",
      disabled = false,
      role: roleProp,
      "aria-live": ariaLiveProp,
      onKeyDown,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const colors = variantClasses[variant];
    const sizes = sizeClasses[size];
    const offset = originOffsets[origin];
    const reduce = useReducedMotion();
    const onCloseRef = useRef(onClose);

    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
      if (!open || disabled) return;
      if (autoHideDuration == null) return;
      const handle = window.setTimeout(() => {
        onCloseRef.current?.("timeout");
      }, autoHideDuration);
      return () => window.clearTimeout(handle);
    }, [open, disabled, autoHideDuration]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && onClose) {
        event.stopPropagation();
        onClose("escapeKeyDown");
      }
    };

    const handleCloseClick = () => {
      if (disabled) return;
      onClose?.("closeClick");
    };

    const transition = reduce ? { duration: 0 } : tweens.standard;

    const body = message ?? children;

    const inner = (
      <motion.div
        ref={ref}
        data-component="snackbar"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-origin={origin}
        data-disabled={disabled || undefined}
        role={roleProp ?? "status"}
        aria-live={ariaLiveProp ?? "polite"}
        aria-atomic="true"
        onKeyDown={handleKeyDown}
        className={cn(
          anatomy.root,
          sizes.pad,
          sizes.gap,
          sizes.minH,
          shapeClasses[shape],
          colors.bg,
          colors.fg,
          colors.border,
          colors.elevation,
          disabled && anatomy.disabled,
          className,
        )}
        initial={{ opacity: 0, y: offset.y }}
        animate={{ opacity: disabled ? 0.38 : 1, y: 0 }}
        exit={{ opacity: 0, y: offset.y }}
        transition={transition}
        {...rest}
      >
        {icon ? (
          <span
            data-slot="icon"
            aria-hidden="true"
            className={cn(anatomy.icon, sizes.iconBox)}
          >
            {icon}
          </span>
        ) : null}
        <span
          data-slot="message"
          className={cn(anatomy.message, sizes.message)}
        >
          {body}
        </span>
        {action ? (
          <span
            data-slot="action"
            className={cn(anatomy.action, sizes.action, colors.actionFg)}
          >
            {action}
          </span>
        ) : null}
        {showClose ? (
          <button
            type="button"
            data-slot="close"
            aria-label={closeLabel}
            onClick={handleCloseClick}
            disabled={disabled}
            className={cn(anatomy.close, sizes.closeBox)}
          >
            <span aria-hidden className={cn("inline-flex", sizes.iconBox)}>
              <CloseGlyph />
            </span>
          </button>
        ) : null}
      </motion.div>
    );

    return (
      <AnimatePresence initial={false}>{open ? inner : null}</AnimatePresence>
    );
  },
);
