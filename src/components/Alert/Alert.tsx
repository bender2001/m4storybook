import {
  forwardRef,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  severityRole,
  shapeClasses,
  sizeClasses,
} from "./anatomy";
import type { AlertProps, AlertSeverity } from "./types";

export type {
  AlertProps,
  AlertSeverity,
  AlertShape,
  AlertSize,
  AlertVariant,
} from "./types";

/** 24dp severity glyphs — keeps the component network-free. */
const InfoGlyph = (): ReactElement => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" />
  </svg>
);

const SuccessGlyph = (): ReactElement => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z" />
  </svg>
);

const WarningGlyph = (): ReactElement => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" />
  </svg>
);

const ErrorGlyph = (): ReactElement => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z" />
  </svg>
);

const CloseGlyph = (): ReactElement => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const defaultIcons: Record<AlertSeverity, () => ReactElement> = {
  info: InfoGlyph,
  success: SuccessGlyph,
  warning: WarningGlyph,
  error: ErrorGlyph,
};

/**
 * M3 Alert. Re-skins the MUI Alert API onto the M3 banner surface
 * (https://m3.material.io/components/banners) with severity color
 * mapping that targets the standard M3 token roles:
 *
 *   info     -> primary       success  -> secondary
 *   warning  -> tertiary      error    -> error
 *
 * Variants paint the surface in four different ways (filled / tonal /
 * outlined / text) per the MUI Alert contract. Severity drives the
 * default leading icon, the ARIA role (`alert` for assertive
 * severities, `status` for polite ones), and the aria-live politeness.
 *
 * Enter/exit motion uses AnimatePresence with the M3 emphasized tween
 * (medium2 / 300ms). When the user prefers reduced motion the
 * transition collapses to an opacity fade.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    severity = "info",
    variant = "tonal",
    size = "md",
    shape = "sm",
    title,
    icon,
    action,
    onClose,
    closeLabel = "Close alert",
    disabled = false,
    open = true,
    children,
    className,
    role: roleProp,
    "aria-live": ariaLiveProp,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const colors = colorMatrix[variant][severity];
  const sizes = sizeClasses[size];
  const semantics = severityRole[severity];
  const reduce = useReducedMotion();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && onClose) {
      event.stopPropagation();
      onClose();
    }
  };

  const renderIcon = () => {
    if (icon === false) return null;
    if (icon !== undefined && icon !== null) return icon;
    const Glyph = defaultIcons[severity];
    return <Glyph />;
  };

  const transition = reduce
    ? { duration: 0 }
    : tweens.standard;

  const inner = (
    <motion.div
      ref={ref}
      data-component="alert"
      data-severity={severity}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled || undefined}
      role={roleProp ?? semantics.role}
      aria-live={ariaLiveProp ?? semantics.ariaLive}
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
        disabled && anatomy.disabled,
        className,
      )}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: disabled ? 0.38 : 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={transition}
      {...rest}
    >
      {icon !== false ? (
        <span
          data-slot="icon"
          aria-hidden="true"
          className={cn(anatomy.icon, sizes.iconBox)}
        >
          {renderIcon()}
        </span>
      ) : null}
      <div data-slot="content" className={anatomy.content}>
        {title ? (
          <span data-slot="title" className={cn(anatomy.title, sizes.title)}>
            {title}
          </span>
        ) : null}
        {children ? (
          <span data-slot="body" className={cn(anatomy.body, sizes.body)}>
            {children}
          </span>
        ) : null}
      </div>
      {action ? (
        <span data-slot="action" className={anatomy.action}>
          {action}
        </span>
      ) : null}
      {onClose ? (
        <button
          type="button"
          data-slot="close"
          aria-label={closeLabel}
          onClick={onClose}
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

  return <AnimatePresence initial={false}>{open ? inner : null}</AnimatePresence>;
});
