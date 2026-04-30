import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ComponentType,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  arrangementDescription,
  elevationClasses,
  morphTarget,
  shapeClasses,
  sizeClasses,
  spacingClasses,
  spacingPixels,
  spanToCss,
  variantClasses,
} from "./anatomy";
import type {
  ImageListItemBarProps,
  ImageListItemProps,
  ImageListProps,
  ImageListShape,
} from "./types";

export type {
  ImageListArrangement,
  ImageListElevation,
  ImageListItemBarProps,
  ImageListItemProps,
  ImageListProps,
  ImageListShape,
  ImageListSize,
  ImageListSpacing,
  ImageListSpan,
  ImageListVariant,
} from "./types";

/**
 * Context that lets ImageListItem read the host shape token without
 * forcing consumers to plumb props down. The arrangement is exposed
 * via the `data-arrangement` attribute on the host so descendant CSS
 * rules can apply arrangement-specific layout (woven col-spans,
 * masonry image flow) without React having to walk the child tree.
 */
const ImageListContext = createContext<{ shape: ImageListShape }>({
  shape: "md",
});

/**
 * M3 ImageList. Token-aware 2D image gallery primitive that re-skins
 * MUI's ImageList with the M3 surface / shape / elevation / motion
 * scales. Polymorphic via `as`, supports the four MUI arrangements
 * (standard / quilted / woven / masonry) on top of five M3 surface
 * variants, three densities, the full shape token scale, and an
 * optional header (label + leading/trailing icon slots).
 *
 * Tile children are typically `<ImageListItem>` instances that may
 * paint the M3 state-layer + morph the corner shape one notch up
 * while hovered/focused/pressed (M3 Expressive shape morph). Each
 * tile can host an `<ImageListItemBar>` overlay for title / subtitle
 * / action labels rendered over (or below) the image.
 */
export const ImageList = forwardRef<HTMLElement, ImageListProps>(
  function ImageList(
    {
      as = "ul",
      variant = "text",
      arrangement = "standard",
      size = "md",
      shape = "md",
      elevation = 0,
      cols,
      rowHeight,
      spacing,
      selected = false,
      disabled = false,
      error = false,
      leadingIcon,
      trailingIcon,
      label,
      children,
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

    const baseSpacing = spacing ?? sizes.gap;
    const spacingClass = spacingClasses[baseSpacing];
    const gapPx = spacingPixels[baseSpacing];

    const colCount = cols ?? sizes.cols;
    const tileHeight = rowHeight ?? sizes.rowHeight;

    const elevationClass =
      variant === "elevated"
        ? elevationClasses[elevation === 0 ? 1 : elevation]
        : elevation > 0
          ? elevationClasses[elevation]
          : colors.elevation;

    const fillClass = error
      ? colors.error
      : selected
        ? colors.selected
        : colors.rest;

    const hostShape = shapeClasses[shape];

    // The grid arrangements share the same template; masonry uses CSS
    // multi-columns instead so individual rows flow independently.
    const galleryStyle: CSSProperties =
      arrangement === "masonry"
        ? ({
            columnCount: colCount,
            columnGap: `${gapPx}px`,
            // Masonry tiles read this var so vertical rhythm in each
            // column matches the grid arrangements' row gap.
            ["--image-list-row-gap" as string]: `${gapPx}px`,
          } as CSSProperties)
        : {
            gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
            gridAutoRows:
              tileHeight === "auto" ? "auto" : `${tileHeight}px`,
            gridAutoFlow: arrangement === "quilted" ? "row dense" : "row",
            rowGap: `${gapPx}px`,
            columnGap: `${gapPx}px`,
          };

    const showHeader = Boolean(label || leadingIcon || trailingIcon);

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "ul",
        ) as unknown as ComponentType<HTMLMotionProps<"ul">>,
      [as],
    );

    const ctx = useMemo(() => ({ shape }), [shape]);

    return (
      <ImageListContext.Provider value={ctx}>
        <MotionTag
          ref={ref as ForwardedRef<HTMLUListElement>}
          role="list"
          aria-label={ariaLabel}
          aria-roledescription={arrangementDescription[arrangement]}
          aria-disabled={disabled || undefined}
          aria-selected={selected || undefined}
          aria-invalid={error || undefined}
          data-component="image-list"
          data-variant={variant}
          data-arrangement={arrangement}
          data-size={size}
          data-shape={shape}
          data-elevation={
            variant === "elevated" || elevation > 0 ? elevation : undefined
          }
          data-cols={colCount}
          data-row-height={tileHeight}
          data-spacing={baseSpacing}
          data-spacing-px={gapPx}
          data-selected={selected || undefined}
          data-error={error || undefined}
          data-disabled={disabled || undefined}
          transition={reduced ? { duration: 0 } : springs.gentle}
          className={cn(
            anatomy.root,
            sizes.pad,
            hostShape,
            fillClass,
            colors.border,
            elevationClass,
            disabled && anatomy.rootDisabled,
            className,
          )}
          style={style}
          {...rest}
        >
          {showHeader ? (
            <span data-slot="header" className={anatomy.header}>
              {leadingIcon ? (
                <span
                  aria-hidden
                  data-slot="leading-icon"
                  className={anatomy.icon}
                >
                  {leadingIcon}
                </span>
              ) : null}
              {label ? <span data-slot="label">{label}</span> : null}
              {trailingIcon ? (
                <span
                  aria-hidden
                  data-slot="trailing-icon"
                  className={cn(anatomy.icon, "ml-auto")}
                >
                  {trailingIcon}
                </span>
              ) : null}
            </span>
          ) : null}
          <div
            data-slot="gallery"
            data-arrangement={arrangement}
            className={cn(
              anatomy.list,
              arrangement === "masonry"
                ? anatomy.listMasonry
                : cn(anatomy.listGrid, spacingClass),
            )}
            style={galleryStyle}
          >
            {children}
          </div>
        </MotionTag>
      </ImageListContext.Provider>
    );
  },
);

/**
 * ImageListItem — a single tile inside an `<ImageList>`. Renders an
 * `<img>` when `src` is provided, otherwise renders `children`. Spans
 * (`cols` / `rows`) drive grid placement for the standard / quilted
 * arrangements; the woven arrangement adds an alternating `:nth-child`
 * span pattern via CSS; the masonry arrangement lets tiles flow at
 * their natural height inside CSS multi-columns.
 */
export const ImageListItem = forwardRef<HTMLElement, ImageListItemProps>(
  function ImageListItem(
    {
      as = "li",
      cols = 1,
      rows = 1,
      shape: shapeProp,
      selected = false,
      disabled = false,
      interactive: interactiveProp,
      src,
      alt,
      imgProps,
      children,
      className,
      style,
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
    ref: ForwardedRef<HTMLElement>,
  ) {
    const reduced = useReducedMotion();
    const ctx = useContext(ImageListContext);
    const shape = shapeProp ?? ctx.shape;
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const interactive = interactiveProp ?? Boolean(onClick);

    const morph = interactive && !disabled && (hovered || focused || pressed);
    const radiusClass = morph ? morphTarget[shape] : shapeClasses[shape];

    const stateLayer =
      !interactive || disabled
        ? 0
        : pressed
          ? stateLayerOpacity.pressed
          : focused
            ? stateLayerOpacity.focus
            : hovered
              ? stateLayerOpacity.hover
              : 0;

    const handleClick = useCallback(
      (event: MouseEvent<HTMLLIElement>) => {
        if (disabled) return;
        onClick?.(event);
      },
      [disabled, onClick],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLLIElement>) => {
        onKeyDown?.(event);
        if (!interactive || disabled) return;
        if (event.defaultPrevented) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          (event.currentTarget as HTMLElement).click();
          if (event.key === " ") setPressed(true);
        }
      },
      [disabled, interactive, onKeyDown],
    );

    // Grid placement. Only apply inline `grid-column` / `grid-row` when
    // the consumer explicitly opted into a non-default span — leaving
    // the defaults unset lets the woven `:nth-child` rule (src/index.css)
    // and the masonry override take effect, since inline styles would
    // otherwise outrank the stylesheet.
    const placement: CSSProperties = {};
    if (cols !== 1) placement.gridColumn = spanToCss(cols);
    if (rows !== 1) placement.gridRow = spanToCss(rows);

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "li",
        ) as unknown as ComponentType<HTMLMotionProps<"li">>,
      [as],
    );

    const role = interactive ? "button" : "listitem";
    const tabIndex = interactive && !disabled ? 0 : undefined;

    const fillClass = selected ? anatomy.tileSelected : anatomy.tileRest;

    return (
      <MotionTag
        ref={ref as ForwardedRef<HTMLLIElement>}
        role={role}
        aria-label={interactive ? ariaLabel : undefined}
        aria-disabled={interactive && disabled ? true : undefined}
        aria-selected={interactive ? selected || undefined : undefined}
        data-component="image-list-item"
        data-cols={String(cols)}
        data-rows={String(rows)}
        data-shape={shape}
        data-interactive={interactive || undefined}
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        data-state-layer-opacity={interactive ? stateLayer : undefined}
        tabIndex={tabIndex}
        whileHover={
          interactive && !disabled && !reduced ? { y: -1 } : undefined
        }
        whileTap={
          interactive && !disabled && !reduced
            ? { y: 0, scale: 0.98 }
            : undefined
        }
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
          anatomy.tile,
          fillClass,
          radiusClass,
          interactive && !disabled && anatomy.tileInteractive,
          disabled && anatomy.tileDisabled,
          className,
        )}
        style={{ ...placement, ...style }}
        {...rest}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? ""}
            draggable={false}
            loading="lazy"
            {...imgProps}
            className={cn(anatomy.image, imgProps?.className)}
          />
        ) : null}
        {children}
        {interactive ? (
          <span
            aria-hidden
            data-slot="state-layer"
            className={anatomy.tileStateLayer}
            style={{ opacity: stateLayer }}
          />
        ) : null}
      </MotionTag>
    );
  },
);
(ImageListItem as { displayName?: string }).displayName = "ImageListItem";

/**
 * ImageListItemBar — overlay (or below-image) bar that hosts a title,
 * subtitle, and an optional action icon. Defaults to `position="bottom"`
 * over the image; `position="top"` flips to the top edge; and
 * `position="below"` renders the bar in normal flow under the image so
 * captions don't sit on top of imagery.
 */
export const ImageListItemBar = forwardRef<HTMLDivElement, ImageListItemBarProps>(
  function ImageListItemBar(
    {
      title,
      subtitle,
      actionIcon,
      actionPosition = "right",
      position = "bottom",
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const positionClass =
      position === "below"
        ? anatomy.barBelow
        : cn(anatomy.bar, position === "top" ? anatomy.barTop : anatomy.barBottom);

    return (
      <motion.div
        ref={ref}
        data-component="image-list-item-bar"
        data-position={position}
        data-action-position={actionIcon ? actionPosition : undefined}
        className={cn(positionClass, className)}
        style={style}
        {...rest}
      >
        {actionIcon && actionPosition === "left" ? (
          <span
            data-slot="action"
            className={cn(anatomy.barAction, anatomy.barActionLeft)}
          >
            {actionIcon}
          </span>
        ) : null}
        {children ?? (
          <span data-slot="text" className={anatomy.barTextWrap}>
            {title ? (
              <span data-slot="title" className={anatomy.barTitle}>
                {title}
              </span>
            ) : null}
            {subtitle ? (
              <span data-slot="subtitle" className={anatomy.barSubtitle}>
                {subtitle}
              </span>
            ) : null}
          </span>
        )}
        {actionIcon && actionPosition === "right" ? (
          <span
            data-slot="action"
            className={cn(anatomy.barAction, anatomy.barActionRight)}
          >
            {actionIcon}
          </span>
        ) : null}
      </motion.div>
    );
  },
);
