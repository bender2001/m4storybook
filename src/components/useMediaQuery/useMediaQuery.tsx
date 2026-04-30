import {
  forwardRef,
  type ForwardedRef,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import { useMediaQuery } from "./hook";
import type { MediaQueryProps } from "./types";

const CHECK_GLYPH = (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.42z" />
  </svg>
);

const CROSS_GLYPH = (
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
 * `<MediaQuery>`
 *
 * M3-tokenized responsive announcement panel that wraps the
 * `useMediaQuery` hook. Renders a header (label + icons + status pill),
 * the query string in monospace, and a body slot whose contents fade
 * between matched and unmatched states through M3 Expressive motion
 * (`springs.gentle`, `medium2` / `emphasized` for container transitions,
 * `0` under `useReducedMotion`).
 */
function MediaQueryInner(
  {
    query,
    variant = "elevated",
    size = "md",
    shape = "lg",
    selected = false,
    disabled = false,
    error = false,
    label,
    leadingIcon,
    trailingIcon,
    matchedLabel = "matches",
    unmatchedLabel = "no match",
    matchedContent,
    unmatchedContent,
    defaultMatches = false,
    noSsr = false,
    matchMedia,
    onMatchChange,
    children,
    className,
    "aria-label": ariaLabel,
    ...rest
  }: MediaQueryProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const reduced = useReducedMotion();

  const matches = useMediaQuery(query, {
    defaultMatches,
    noSsr,
    matchMedia,
    onChange: onMatchChange,
  });

  const colors = variantClasses[variant];
  const sizes = sizeClasses[size];
  const radius = shapeClasses[shape];

  const fillClass = error
    ? colors.error
    : selected
      ? colors.selected
      : colors.rest;

  const showHeader = Boolean(label || leadingIcon || trailingIcon);

  const renderProp = typeof children === "function" ? children : null;
  const childBody = renderProp ? renderProp(matches) : (children as ReactNode);

  const hasMatchedSlot =
    matchedContent !== undefined && matchedContent !== null;
  const hasUnmatchedSlot =
    unmatchedContent !== undefined && unmatchedContent !== null;

  const bodyTransition: Transition = reduced ? { duration: 0 } : springs.gentle;

  const statusGlyph = matches ? CHECK_GLYPH : CROSS_GLYPH;
  const statusLabel = matches ? matchedLabel : unmatchedLabel;
  const statusClass = matches ? colors.statusOn : colors.statusOff;

  const bodyKey = matches ? "matched" : "unmatched";
  const bodyContent = matches
    ? hasMatchedSlot
      ? matchedContent
      : null
    : hasUnmatchedSlot
      ? unmatchedContent
      : null;

  const showBodySlot =
    bodyContent !== null && bodyContent !== undefined;

  return (
    <motion.div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      aria-invalid={error || undefined}
      aria-selected={selected || undefined}
      data-component="use-media-query"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-matches={matches ? "true" : "false"}
      data-selected={selected || undefined}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
      data-query={query}
      tabIndex={disabled ? -1 : 0}
      initial={false}
      animate={{ opacity: disabled ? 0.38 : 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2 }}
      className={cn(
        anatomy.root,
        sizes.pad,
        sizes.gap,
        sizes.minH,
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
          <span
            data-slot="status"
            data-status={matches ? "matched" : "unmatched"}
            className={cn(anatomy.status, statusClass)}
          >
            <span aria-hidden className={cn(anatomy.statusDot, "bg-current")} />
            <span data-slot="status-label">{statusLabel}</span>
          </span>
          {trailingIcon ? (
            <span
              aria-hidden
              data-slot="icon-trailing"
              className={cn(anatomy.icon, colors.iconColor)}
            >
              {trailingIcon}
            </span>
          ) : null}
        </div>
      ) : null}

      <code data-slot="query" className={anatomy.query}>
        {query}
      </code>

      {renderProp ? (
        <div data-slot="render" className={cn(anatomy.body, sizes.bodyType)}>
          {childBody}
        </div>
      ) : null}

      <AnimatePresence initial={false} mode="wait">
        {showBodySlot ? (
          <motion.div
            key={bodyKey}
            data-slot={matches ? "matched" : "unmatched"}
            data-state={matches ? "matched" : "unmatched"}
            className={cn(anatomy.body, sizes.bodyType)}
            initial={
              reduced
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: matches ? -8 : 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduced
                ? { opacity: 0, y: 0 }
                : { opacity: 0, y: matches ? 8 : -8 }
            }
            transition={bodyTransition}
          >
            <span className="block">
              <span aria-hidden className="mr-2 inline-flex h-4 w-4 align-text-bottom">
                {statusGlyph}
              </span>
              <span data-slot="body-label">
                {matches ? matchedLabel : unmatchedLabel}
              </span>
            </span>
            <span className="mt-1 block text-on-surface-variant">
              {bodyContent}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!renderProp && !showBodySlot && !showHeader ? (
        <span
          data-slot="status-fallback"
          className={cn(sizes.bodyType, "text-on-surface-variant")}
        >
          {matches ? matchedLabel : unmatchedLabel}
        </span>
      ) : null}
    </motion.div>
  );
}

export const MediaQuery = forwardRef(MediaQueryInner);
