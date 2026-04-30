import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ForwardedRef,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { NoSsrProps } from "./types";

export type {
  NoSsrDeferStrategy,
  NoSsrProps,
  NoSsrShape,
  NoSsrSize,
  NoSsrVariant,
} from "./types";

/**
 * M3-tokenized No SSR slot.
 *
 * MUI's `<NoSsr />` is a deferred-render utility that skips the children
 * during the server render and mounts them only on the client, optionally
 * yielding to the browser before commit. M3 has no equivalent, so we
 * re-skin it as a surface-aware deferred slot:
 *
 *   - Polymorphic via `as` (default `<section>`).
 *   - Five M3 surface variants + 7-token shape scale + 3-step density.
 *   - `strategy` selects when the children commit:
 *       `mount` → first useEffect tick (MUI default)
 *       `defer` → next animation frame after mount (MUI `defer`)
 *       `idle`  → `requestIdleCallback` (rAF fallback)
 *   - Pending fallback fades out / deferred children fade in on the M3
 *     `medium2` (300ms) duration on the `emphasized` easing.
 *   - Container transitions also ride `medium2 / emphasized` so theme
 *     changes animate fluidly.
 */
export const NoSsr = forwardRef<HTMLElement, NoSsrProps>(
  function NoSsr(
    {
      as = "section",
      variant = "filled",
      size = "md",
      shape = "lg",
      defer = false,
      strategy,
      fallback,
      selected = false,
      disabled = false,
      error = false,
      leadingIcon,
      trailingIcon,
      label,
      children,
      onMount,
      className,
      style,
      "aria-label": ariaLabel,
      ...rest
    },
    ref: ForwardedRef<HTMLElement>,
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

    // Deferred-mount strategy. MUI's `defer` flag yields one rAF before
    // committing children; we extend that with a tri-state `strategy`
    // that also covers `requestIdleCallback`. Default = synchronous
    // post-mount commit.
    const resolved = strategy ?? (defer ? "defer" : "mount");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      let cancelled = false;
      const commit = () => {
        if (cancelled) return;
        setMounted(true);
        onMount?.();
      };

      if (resolved === "mount") {
        commit();
        return () => {
          cancelled = true;
        };
      }

      if (resolved === "defer") {
        const handle = window.requestAnimationFrame(commit);
        return () => {
          cancelled = true;
          window.cancelAnimationFrame(handle);
        };
      }

      // `idle` strategy: prefer rIC, fall back to rAF.
      type IdleHandle = number;
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: () => void) => IdleHandle;
          cancelIdleCallback?: (handle: IdleHandle) => void;
        }
      ).requestIdleCallback;
      const cic = (
        window as Window & {
          cancelIdleCallback?: (handle: IdleHandle) => void;
        }
      ).cancelIdleCallback;
      if (typeof ric === "function") {
        const handle = ric(commit);
        return () => {
          cancelled = true;
          if (typeof cic === "function") cic(handle);
        };
      }
      const handle = window.requestAnimationFrame(commit);
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(handle);
      };
    }, [resolved, onMount]);

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "div",
        ) as unknown as ComponentType<HTMLMotionProps<"div">>,
      [as],
    );

    const mergedStyle = style as CSSProperties | undefined;

    return (
      <MotionTag
        ref={ref as ForwardedRef<HTMLDivElement>}
        role={as === "section" ? "region" : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        aria-selected={selected || undefined}
        aria-busy={!mounted || undefined}
        data-component="no-ssr"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-strategy={resolved}
        data-mounted={mounted || undefined}
        data-selected={selected || undefined}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        // Route disabled opacity through `animate` so motion/react's
        // inline style cascade beats the disabled wash class
        // (recorded in feedback memory).
        initial={{ opacity: disabled ? 0.38 : 1 }}
        animate={{ opacity: disabled ? 0.38 : 1 }}
        transition={reduced ? { duration: 0 } : tweens.standard}
        style={mergedStyle}
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
        <AnimatePresence initial={false} mode="wait">
          {mounted ? (
            children !== undefined && children !== null ? (
              <motion.div
                key="body"
                data-slot="body"
                className={anatomy.body}
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0 }}
                transition={reduced ? { duration: 0 } : tweens.standard}
              >
                {children}
              </motion.div>
            ) : null
          ) : (
            <motion.div
              key="fallback"
              data-slot="fallback"
              className={cn(anatomy.fallback, sizes.bodyType)}
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0 }}
              transition={reduced ? { duration: 0 } : tweens.standard}
            >
              {fallback ?? null}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionTag>
    );
  },
);
