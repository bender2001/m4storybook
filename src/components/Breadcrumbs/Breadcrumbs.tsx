import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs, tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  errorClasses,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  BreadcrumbsItem,
  BreadcrumbsItemEvent,
  BreadcrumbsProps,
} from "./types";

export type {
  BreadcrumbsItem,
  BreadcrumbsItemEvent,
  BreadcrumbsProps,
  BreadcrumbsShape,
  BreadcrumbsSize,
  BreadcrumbsVariant,
} from "./types";

/** Default chevron separator glyph (M3 right-arrow style). */
const DefaultSeparator = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.42l4.59-4.59a1 1 0 0 0 0-1.42L10.71 6.71a1 1 0 0 0-1.42 0z" />
  </svg>
);

/** Ellipsis glyph used by the collapse affordance. */
const EllipsisGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <circle cx="6" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="18" cy="12" r="1.6" />
  </svg>
);

/**
 * M3-tokenized Breadcrumbs trail.
 *
 *   - `<nav aria-label>` + `<ol>` per WAI-ARIA breadcrumb pattern
 *     (https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
 *   - Last crumb renders as `aria-current="page"` and is non-interactive
 *   - Collapses to <first> … <last> when `items.length > maxItems`,
 *     with an ellipsis button that expands the trail back to full
 *   - Variants re-skin the host using M3 surface roles; sizes step
 *     through label-m / label-l / title-s
 *   - Hover/focus/pressed state layers paint at the M3 opacities
 *     (0.08 / 0.10 / 0.10) of the variant foreground
 *   - Reduced-motion collapses press scale + state-layer fades
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(
    {
      variant = "text",
      size = "md",
      shape = "full",
      items,
      separator,
      maxItems = 8,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      expandText = "Show path",
      currentId,
      error = false,
      disabled = false,
      onItemClick,
      className,
      "aria-label": ariaLabel = "Breadcrumb",
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const sizes = sizeClasses[size];

    const [expanded, setExpanded] = useState(false);
    const handleExpand = useCallback(() => setExpanded(true), []);

    const sep = separator ?? <DefaultSeparator />;

    const resolvedCurrentId = useMemo(() => {
      if (currentId !== undefined) return currentId;
      return items[items.length - 1]?.id;
    }, [currentId, items]);

    const visibleItems = useMemo(() => {
      const total = items.length;
      const showAll =
        expanded ||
        total <= maxItems ||
        itemsBeforeCollapse + itemsAfterCollapse >= total;
      if (showAll) {
        return items.map((item) => ({ kind: "item" as const, item }));
      }
      const before = items.slice(0, Math.max(itemsBeforeCollapse, 0));
      const after = items.slice(total - Math.max(itemsAfterCollapse, 0));
      return [
        ...before.map((item) => ({ kind: "item" as const, item })),
        { kind: "ellipsis" as const, item: null },
        ...after.map((item) => ({ kind: "item" as const, item })),
      ];
    }, [expanded, items, itemsAfterCollapse, itemsBeforeCollapse, maxItems]);

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        data-component="breadcrumbs"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        data-collapsed={
          items.length > maxItems && !expanded ? "true" : undefined
        }
        className={cn(
          anatomy.root,
          disabled && anatomy.rootDisabled,
          className,
        )}
        {...rest}
      >
        <ol className={cn(anatomy.list, sizes.gap)} data-slot="list">
          {visibleItems.map((entry, index) => {
            const last = index === visibleItems.length - 1;
            if (entry.kind === "ellipsis") {
              return (
                <li
                  key="__ellipsis"
                  data-slot="list-item"
                  className={anatomy.listItem}
                >
                  <ExpandButton
                    onExpand={handleExpand}
                    label={expandText}
                    iconSize={sizes.iconSize}
                    height={sizes.height}
                    reduced={Boolean(reduced)}
                  />
                  {!last ? (
                    <Separator size={size}>{sep}</Separator>
                  ) : null}
                </li>
              );
            }
            const item = entry.item;
            const isCurrent = item.id === resolvedCurrentId;
            return (
              <li
                key={item.id}
                data-slot="list-item"
                data-id={item.id}
                className={anatomy.listItem}
              >
                <Crumb
                  item={item}
                  isCurrent={isCurrent}
                  variant={variant}
                  size={size}
                  shape={shape}
                  error={error}
                  trailDisabled={disabled}
                  reduced={Boolean(reduced)}
                  onItemClick={onItemClick}
                />
                {!last ? <Separator size={size}>{sep}</Separator> : null}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

type CrumbProps = {
  item: BreadcrumbsItem;
  isCurrent: boolean;
  variant: NonNullable<BreadcrumbsProps["variant"]>;
  size: NonNullable<BreadcrumbsProps["size"]>;
  shape: NonNullable<BreadcrumbsProps["shape"]>;
  error: boolean;
  trailDisabled: boolean;
  reduced: boolean;
  onItemClick?: BreadcrumbsProps["onItemClick"];
};

function Crumb({
  item,
  isCurrent,
  variant,
  size,
  shape,
  error,
  trailDisabled,
  reduced,
  onItemClick,
}: CrumbProps) {
  const sizes = sizeClasses[size];
  const styles = variantClasses[variant];

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const itemDisabled = Boolean(item.disabled) || trailDisabled;
  const interactive = !isCurrent && !itemDisabled;

  const stateLayer =
    !interactive
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

  const restPaint = error ? errorClasses.rest : styles.rest;
  const currentPaint = error ? errorClasses.current : styles.current;
  const borderPaint = error ? errorClasses.border : styles.border;
  const stateLayerPaint = error ? errorClasses.stateLayer : styles.stateLayer;

  const hostClass = cn(
    isCurrent ? anatomy.crumbCurrent : anatomy.crumb,
    isCurrent ? currentPaint : restPaint,
    borderPaint,
    shapeClasses[shape],
    sizes.pad,
    sizes.gap,
    sizes.labelType,
    !isCurrent && variant === "elevated" && styles.elevation,
    itemDisabled && anatomy.crumbDisabled,
  );

  const handleClick = useCallback(
    (event: BreadcrumbsItemEvent) => {
      if (!interactive) return;
      onItemClick?.(item, event);
    },
    [interactive, item, onItemClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (!interactive) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onItemClick?.(item, event);
      }
    },
    [interactive, item, onItemClick],
  );

  const sharedProps = {
    "data-slot": "crumb",
    "data-id": item.id,
    "data-variant": variant,
    "data-current": isCurrent || undefined,
    "data-disabled": itemDisabled || undefined,
    "data-hovered": (interactive && hovered) || undefined,
    "data-focused": (interactive && focused) || undefined,
    "data-pressed": (interactive && pressed) || undefined,
    "aria-label": item["aria-label"],
    "aria-current": isCurrent ? ("page" as const) : undefined,
    "aria-disabled": itemDisabled || undefined,
    style: { minHeight: sizes.height },
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onPointerDown: () => {
      if (interactive) setPressed(true);
    },
    onPointerUp: () => setPressed(false),
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      setPressed(false);
    },
    onKeyDown: handleKeyDown,
  };

  const body = (
    <>
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.stateLayer, stateLayerPaint)}
        style={{ opacity: stateLayer }}
      />
      {item.icon ? (
        <span data-slot="icon-leading" className={cn(anatomy.icon, sizes.iconSize)}>
          {item.icon}
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
        {item.label}
      </motion.span>
      {item.trailingIcon ? (
        <span data-slot="icon-trailing" className={cn(anatomy.icon, sizes.iconSize)}>
          {item.trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (isCurrent) {
    return (
      <span {...sharedProps} className={hostClass}>
        {body}
      </span>
    );
  }

  if (item.href && !itemDisabled) {
    const rel =
      item.rel ?? (item.target === "_blank" ? "noopener noreferrer" : undefined);
    return (
      <a
        {...sharedProps}
        href={item.href}
        target={item.target}
        rel={rel}
        className={hostClass}
        tabIndex={0}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => handleClick(event)}
      >
        {body}
      </a>
    );
  }

  return (
    <button
      {...sharedProps}
      type="button"
      disabled={itemDisabled}
      className={hostClass}
      tabIndex={itemDisabled ? -1 : 0}
      onClick={(event: MouseEvent<HTMLButtonElement>) => handleClick(event)}
    >
      {body}
    </button>
  );
}

type SeparatorProps = {
  size: NonNullable<BreadcrumbsProps["size"]>;
  children: ReactNode;
};

function Separator({ size, children }: SeparatorProps) {
  const sizes = sizeClasses[size];
  return (
    <span
      aria-hidden
      data-slot="separator"
      role="presentation"
      className={cn(anatomy.separator, sizes.sepSize)}
    >
      {children}
    </span>
  );
}

type ExpandButtonProps = {
  onExpand: () => void;
  label: string;
  iconSize: string;
  height: number;
  reduced: boolean;
};

function ExpandButton({
  onExpand,
  label,
  iconSize,
  height,
  reduced,
}: ExpandButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const stateLayer = pressed
    ? stateLayerOpacity.pressed
    : focused
      ? stateLayerOpacity.focus
      : hovered
        ? stateLayerOpacity.hover
        : 0;

  return (
    <button
      type="button"
      data-slot="expand"
      aria-label={label}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      onClick={onExpand}
      className={cn(anatomy.expand, "px-2")}
      style={{ minHeight: height, minWidth: height }}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.stateLayer, "bg-on-surface")}
        style={{ opacity: stateLayer }}
      />
      <motion.span
        data-slot="ellipsis-icon"
        className={cn("relative z-[1] inline-flex", iconSize)}
        initial={false}
        animate={{ scale: pressed && !reduced ? 0.95 : 1 }}
        transition={reduced ? { duration: 0 } : tweens.standardDecelerate}
      >
        <EllipsisGlyph />
      </motion.span>
    </button>
  );
}
