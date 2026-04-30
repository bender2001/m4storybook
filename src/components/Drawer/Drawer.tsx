import {
  forwardRef,
  Fragment,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { Backdrop } from "@/components/Backdrop";
import { cn } from "@/lib/cn";
import { springs, tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  anchorAlign,
  anchorBorder,
  anchorShape,
  positionClasses,
  shapeClasses,
  sizeClasses,
  stateColors,
  variantClasses,
} from "./anatomy";
import type {
  DrawerAnchor,
  DrawerChangeEvent,
  DrawerItem,
  DrawerProps,
  DrawerSection,
  DrawerSize,
  DrawerVariant,
} from "./types";

export type {
  DrawerAnchor,
  DrawerChangeEvent,
  DrawerItem,
  DrawerProps,
  DrawerSection,
  DrawerShape,
  DrawerSize,
  DrawerVariant,
} from "./types";

/**
 * M3 Expressive Navigation Drawer.
 *
 * Implements the M3 spec at
 * https://m3.material.io/components/navigation-drawer/specs:
 *  - 360dp container fill in `surface-container-low` (md / default)
 *  - 56dp destination row, full-pill `secondary-container` active
 *    indicator with label-l text in `on-secondary-container`
 *  - state-layer opacities: hover 0.08, focus 0.10, pressed 0.10
 *  - section headlines typeset title-s in `on-surface-variant`,
 *    1dp `outline-variant` dividers between groups
 *  - modal variant slides from the anchor edge with the M3 emphasized
 *    tween + a scrim (Backdrop component); standard variant remains
 *    in flow
 *
 * Variants (`standard` / `modal` / `tonal` / `outlined` / `elevated`)
 * re-skin the host surface; sizes (`sm` / `md` / `lg`) scale the row
 * height + label typography; shape tokens morph the trailing corners
 * for floating treatments.
 */
export const Drawer = forwardRef<HTMLElement, DrawerProps>(function Drawer(
  {
    variant = "standard",
    size = "md",
    shape,
    anchor = "start",
    open = true,
    onClose,
    items,
    sections,
    value,
    defaultValue,
    onChange,
    header,
    footer,
    headline,
    scrim = true,
    scrimVariant = "filled",
    contained = false,
    disableEscapeClose = false,
    disableScrimClose = false,
    disabled = false,
    ariaLabel = "Navigation drawer",
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const reactId = useId();
  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];
  const isModal = variant === "modal";
  const resolvedShape = shape ?? (isModal ? "lg" : "none");
  const headlineId = headline !== undefined ? `${reactId}-headline` : undefined;

  const resolvedSections = useMemo<DrawerSection[]>(() => {
    if (sections && sections.length > 0) return sections;
    return [{ id: "default", items: items ?? [] }];
  }, [sections, items]);

  const flatItems = useMemo<DrawerItem[]>(
    () => resolvedSections.flatMap((section) => section.items),
    [resolvedSections],
  );

  const firstEnabled = useMemo(
    () => flatItems.find((item) => !item.disabled)?.id ?? flatItems[0]?.id,
    [flatItems],
  );

  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue ?? firstEnabled,
  );
  const isControlled = value !== undefined;
  const activeId = isControlled ? value : internalValue;

  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const setButtonRef = useCallback(
    (id: string) => (node: HTMLButtonElement | null) => {
      if (node) buttonsRef.current.set(id, node);
      else buttonsRef.current.delete(id);
    },
    [],
  );

  const handleSelect = useCallback(
    (item: DrawerItem, event: DrawerChangeEvent) => {
      if (disabled || item.disabled) return;
      if (!isControlled) setInternalValue(item.id);
      onChange?.(item.id, event);
    },
    [disabled, isControlled, onChange],
  );

  const handleItemKeyDown = useCallback(
    (item: DrawerItem) => (event: KeyboardEvent<HTMLButtonElement>) => {
      const enabled = flatItems.filter((entry) => !entry.disabled);
      const current = enabled.findIndex((entry) => entry.id === item.id);
      if (current < 0) return;

      let next: number;
      switch (event.key) {
        case "ArrowDown":
          next = (current + 1) % enabled.length;
          break;
        case "ArrowUp":
          next = (current - 1 + enabled.length) % enabled.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = enabled.length - 1;
          break;
        case "Enter":
        case " ": {
          event.preventDefault();
          handleSelect(item, event);
          return;
        }
        default:
          return;
      }

      event.preventDefault();
      const target = enabled[next];
      if (!target) return;
      buttonsRef.current.get(target.id)?.focus();
    },
    [flatItems, handleSelect],
  );

  const handleNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (disableEscapeClose) return;
    if (event.key === "Escape" && onClose) {
      event.stopPropagation();
      onClose();
    }
  };

  const indicatorTransition = reduced ? { duration: 0 } : springs.springy;
  const slideTransition: Transition = reduced
    ? { duration: 0 }
    : tweens.emphasized;

  const widthVar = `${sizes.width}px`;
  const slideOffset = anchor === "start" ? -sizes.width : sizes.width;

  const surfaceClasses = cn(
    anatomy.root,
    shapeClasses[resolvedShape],
    anchorShape[anchor],
    styles.rest,
    styles.fg,
    styles.elevation,
    variant === "outlined" && anchorBorder[anchor],
    disabled && anatomy.disabled,
    className,
  );

  const surface = (
    <motion.nav
      ref={ref}
      aria-label={ariaLabel}
      aria-labelledby={headlineId}
      data-component="drawer"
      data-variant={variant}
      data-size={size}
      data-shape={resolvedShape}
      data-anchor={anchor}
      data-disabled={disabled || undefined}
      data-open={open || undefined}
      onKeyDown={handleNavKeyDown}
      className={surfaceClasses}
      style={{ width: widthVar }}
      initial={isModal ? { x: slideOffset } : false}
      animate={isModal ? { x: 0 } : undefined}
      exit={isModal ? { x: slideOffset } : undefined}
      transition={isModal ? slideTransition : undefined}
      {...rest}
    >
      <span aria-hidden className={anatomy.gutter} />
      {header ? (
        <div data-slot="header" className={anatomy.header}>
          {header}
        </div>
      ) : null}
      {headline !== undefined ? (
        <div
          id={headlineId}
          data-slot="headline"
          className={anatomy.headline}
        >
          {headline}
        </div>
      ) : null}
      {resolvedSections.map((section, sectionIndex) => {
        const showDivider =
          section.divider ?? (sectionIndex > 0);
        return (
          <Fragment key={section.id}>
            {showDivider ? (
              <span
                aria-hidden
                data-slot="divider"
                className={anatomy.divider}
              />
            ) : null}
            <div
              data-slot="section"
              data-section-id={section.id}
              className={anatomy.section}
            >
              {section.headline !== undefined ? (
                <div
                  data-slot="section-headline"
                  className={anatomy.sectionHeadline}
                >
                  {section.headline}
                </div>
              ) : null}
              <ul role="list" data-slot="list" className={anatomy.list}>
                {section.items.map((item) => {
                  const selected =
                    item.id === activeId && !disabled && !item.disabled;
                  return (
                    <li
                      key={item.id}
                      data-slot="list-item"
                      role="none"
                      className="relative"
                    >
                      <DrawerDestination
                        item={item}
                        selected={selected}
                        size={size}
                        anchor={anchor}
                        variant={variant}
                        barDisabled={disabled}
                        indicatorTransition={indicatorTransition}
                        reduced={reduced}
                        onSelect={handleSelect}
                        onKeyDown={handleItemKeyDown(item)}
                        setButtonRef={setButtonRef(item.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </Fragment>
        );
      })}
      {footer ? (
        <div data-slot="footer" className={anatomy.footer}>
          {footer}
        </div>
      ) : null}
    </motion.nav>
  );

  if (!isModal) {
    return (
      <AnimatePresence initial={false}>
        {open ? surface : null}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <Fragment key="modal-drawer">
          {scrim ? (
            <Backdrop
              variant={scrimVariant}
              size="md"
              contained={contained}
              onClose={disableScrimClose ? undefined : onClose ?? undefined}
              closeOnEscape={false}
              data-role="drawer-scrim"
            />
          ) : null}
          <div
            data-component="drawer-positioner"
            className={cn(
              positionClasses[contained ? "contained" : "fixed"],
              anchorAlign[anchor],
              "z-[60] flex pointer-events-none",
            )}
          >
            <div className="pointer-events-auto h-full">{surface}</div>
          </div>
        </Fragment>
      ) : null}
    </AnimatePresence>
  );
});

type DestinationProps = {
  item: DrawerItem;
  selected: boolean;
  size: DrawerSize;
  anchor: DrawerAnchor;
  variant: DrawerVariant;
  barDisabled: boolean;
  indicatorTransition: Transition;
  reduced: boolean | null;
  onSelect: (item: DrawerItem, event: DrawerChangeEvent) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  setButtonRef: (node: HTMLButtonElement | null) => void;
};

function DrawerDestination({
  item,
  selected,
  size,
  anchor,
  barDisabled,
  indicatorTransition,
  reduced,
  onSelect,
  onKeyDown,
  setButtonRef,
}: DestinationProps) {
  const sizes = sizeClasses[size];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const itemDisabled = barDisabled || Boolean(item.disabled);
  const stateLayer = itemDisabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (itemDisabled) return;
    onSelect(item, event);
  };

  const glyph = selected && item.selectedIcon ? item.selectedIcon : item.icon;

  return (
    <button
      ref={setButtonRef}
      type="button"
      role="link"
      aria-current={selected ? "page" : undefined}
      aria-label={item["aria-label"] ?? undefined}
      aria-disabled={itemDisabled || undefined}
      disabled={itemDisabled}
      tabIndex={itemDisabled ? -1 : 0}
      data-slot="destination"
      data-id={item.id}
      data-anchor={anchor}
      data-selected={selected || undefined}
      data-disabled={itemDisabled || undefined}
      data-hovered={hovered || undefined}
      data-focused={focused || undefined}
      data-pressed={pressed || undefined}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => {
        if (!itemDisabled) setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      className={cn(
        anatomy.item,
        sizes.itemPad,
        sizes.itemGap,
        itemDisabled && "opacity-[0.38] cursor-not-allowed",
      )}
      style={{ minHeight: sizes.rowHeight }}
    >
      <motion.span
        aria-hidden
        data-slot="indicator"
        className={anatomy.indicator}
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          scaleX: selected ? 1 : 0.92,
        }}
        transition={indicatorTransition}
      />
      <span
        aria-hidden
        data-slot="state-layer"
        className={anatomy.stateLayer}
        style={{ opacity: stateLayer }}
      />
      {focused && !itemDisabled ? (
        <span aria-hidden data-slot="focus-ring" className={anatomy.focusRing} />
      ) : null}
      {item.icon !== undefined ? (
        <motion.span
          data-slot="icon"
          className={cn(
            anatomy.iconWrap,
            sizes.iconSize,
            selected ? stateColors.iconSelected : stateColors.iconRest,
          )}
          initial={false}
          animate={{ scale: pressed && !reduced ? 0.92 : 1 }}
          transition={reduced ? { duration: 0 } : springs.snappy}
        >
          {glyph}
        </motion.span>
      ) : null}
      <span
        data-slot="label"
        className={cn(
          anatomy.label,
          sizes.labelType,
          selected ? stateColors.labelSelected : stateColors.labelRest,
        )}
      >
        {item.label}
      </span>
      {item.badge !== undefined ? (
        <span
          data-slot="badge"
          className={cn(
            anatomy.badge,
            sizes.labelType,
            selected ? stateColors.badgeSelected : stateColors.badgeRest,
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </button>
  );
}
