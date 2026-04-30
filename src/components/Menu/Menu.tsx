import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs, staggerVariants } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { MenuItem, MenuProps, MenuSize } from "./types";

export type {
  MenuDismissSource,
  MenuItem,
  MenuProps,
  MenuShape,
  MenuSize,
  MenuVariant,
} from "./types";

type MenuSizeBlock = (typeof sizeClasses)[MenuSize];

/**
 * M3-tokenized Menu surface.
 *
 *   - Renders the M3 menu container (default: surface-container,
 *     elevation-2, shape-xs) per https://m3.material.io/components/menus/specs.
 *   - Five variants (text / filled / tonal / outlined / elevated) cover
 *     MUI's variant prop range plus the M3 expressive default.
 *   - Three densities map to M3 list-item heights: sm = 40dp, md = 48dp,
 *     lg = 56dp.
 *   - Per-item state-layer rides hover 0.08 / focus 0.10 / pressed 0.10.
 *   - Open / close animation rides M3 Expressive `springs.gentle` (or
 *     a 0-duration tween under reduced motion).
 *   - Container transitions ride `medium2` (300ms) on `emphasized`.
 *   - Keyboard nav: ArrowUp/ArrowDown moves focus between items, Home /
 *     End jump to the ends, Enter / Space activates, Escape dismisses.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    variant = "elevated",
    size = "md",
    shape = "xs",
    open = true,
    items,
    selectedId,
    label,
    disabled = false,
    error = false,
    dismissOnEscape = true,
    onSelect,
    onDismiss,
    onKeyDown,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const colors = variantClasses[variant];
  const sizes = sizeClasses[size];
  const radius = shapeClasses[shape];

  const fillClass = error ? colors.error : colors.rest;

  const focusableIds = items
    .filter((item) => !item.disabled)
    .map((item) => item.id);
  const initialFocus =
    selectedId && focusableIds.includes(selectedId)
      ? selectedId
      : focusableIds[0] ?? null;
  const [focusedId, setFocusedId] = useState<string | null>(initialFocus);

  // Keep focusedId in sync if items change (or selection moves).
  useEffect(() => {
    if (focusedId == null) {
      setFocusedId(initialFocus);
      return;
    }
    if (!focusableIds.includes(focusedId)) {
      setFocusedId(initialFocus);
    }
  }, [focusableIds, focusedId, initialFocus]);

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      if (focusableIds.length === 0) return;
      const current = focusedId ?? focusableIds[0];
      const idx = focusableIds.indexOf(current);
      const nextIdx =
        (idx + delta + focusableIds.length) % focusableIds.length;
      setFocusedId(focusableIds[nextIdx]);
    },
    [focusableIds, focusedId],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      if (event.key === "Escape" && dismissOnEscape) {
        event.stopPropagation();
        onDismiss?.("escape");
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveFocus(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveFocus(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        if (focusableIds[0]) setFocusedId(focusableIds[0]);
      } else if (event.key === "End") {
        event.preventDefault();
        if (focusableIds.length > 0)
          setFocusedId(focusableIds[focusableIds.length - 1]);
      }
    },
    [
      disabled,
      dismissOnEscape,
      focusableIds,
      moveFocus,
      onDismiss,
      onKeyDown,
    ],
  );

  const activate = useCallback(
    (item: MenuItem) => {
      if (item.disabled || disabled) return;
      item.onSelect?.();
      onSelect?.(item);
      onDismiss?.("select");
    },
    [disabled, onDismiss, onSelect],
  );

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          ref={rootRef}
          role="menu"
          aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
          aria-disabled={disabled || undefined}
          aria-invalid={error || undefined}
          data-component="menu"
          data-variant={variant}
          data-size={size}
          data-shape={shape}
          data-open={open || undefined}
          data-error={error || undefined}
          data-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          initial={
            reduced
              ? { opacity: disabled ? 0.38 : 1, scale: 1 }
              : { opacity: 0, scale: 0.96 }
          }
          animate={{ opacity: disabled ? 0.38 : 1, scale: 1 }}
          exit={
            reduced
              ? { opacity: 0, scale: 1 }
              : { opacity: 0, scale: 0.96 }
          }
          transition={reduced ? { duration: 0 } : springs.gentle}
          onKeyDown={handleKeyDown}
          className={cn(
            anatomy.root,
            radius,
            fillClass,
            colors.border,
            colors.elevation,
            disabled && anatomy.disabled,
            className,
          )}
          style={reduced ? undefined : { transformOrigin: "center top" }}
          {...rest}
        >
          {label ? (
            <div
              data-slot="header"
              className={cn(anatomy.header, sizes.headerPad, sizes.headerType)}
            >
              <span data-slot="label">{label}</span>
            </div>
          ) : null}
          <motion.ul
            role="none"
            data-slot="list"
            className={anatomy.list}
            variants={staggerVariants(reduced).parent}
            initial="closed"
            animate="open"
          >
            {items.map((item) => {
              const isSelected =
                Boolean(item.selected) || selectedId === item.id;
              const isFocused = focusedId === item.id;
              return (
                <Fragment key={item.id}>
                  <MenuRow
                    item={item}
                    sizes={sizes}
                    iconColor={colors.iconColor}
                    isSelected={isSelected}
                    isFocused={isFocused}
                    reduced={Boolean(reduced)}
                    onActivate={activate}
                    onFocusItem={setFocusedId}
                  />
                  {item.divider ? (
                    <li
                      role="separator"
                      data-slot="divider"
                      className={anatomy.divider}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </motion.ul>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});

interface MenuRowProps {
  item: MenuItem;
  sizes: MenuSizeBlock;
  iconColor: string;
  isSelected: boolean;
  isFocused: boolean;
  reduced: boolean;
  onActivate: (item: MenuItem) => void;
  onFocusItem: (id: string) => void;
}

function MenuRow({
  item,
  sizes,
  iconColor,
  isSelected,
  isFocused,
  reduced,
  onActivate,
  onFocusItem,
}: MenuRowProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  // When the parent moves keyboard focus to this row, mirror it onto
  // the actual button element so screen readers + focus rings track it.
  useEffect(() => {
    if (isFocused && buttonRef.current && !item.disabled) {
      // Avoid focus-stealing on initial render unless we're the
      // first focus target — the `focus({ preventScroll: true })`
      // keeps the menu surface stable while still moving focus.
      if (document.activeElement !== buttonRef.current) {
        buttonRef.current.focus({ preventScroll: true });
      }
    }
  }, [isFocused, item.disabled]);

  const stateLayer = item.disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const stateLayerColor = item.error
    ? anatomy.stateLayerError
    : isSelected
      ? anatomy.stateLayerSelected
      : "";

  const rowBg = isSelected ? anatomy.itemSelectedBg : "bg-transparent";
  const rowText = item.error
    ? anatomy.itemErrorText
    : isSelected
      ? anatomy.itemSelectedText
      : anatomy.itemDefaultText;

  return (
    <motion.li
      role="none"
      className="contents"
      variants={staggerVariants(reduced).child}
    >
      <button
        ref={buttonRef}
        type="button"
        role="menuitem"
        tabIndex={item.disabled ? -1 : isFocused ? 0 : -1}
        aria-disabled={item.disabled || undefined}
        aria-selected={isSelected || undefined}
        disabled={item.disabled}
        data-component="menu-item"
        data-id={item.id}
        data-selected={isSelected || undefined}
        data-disabled={item.disabled || undefined}
        data-error={item.error || undefined}
        data-focused={isFocused || undefined}
        onClick={() => onActivate(item)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onFocus={() => {
          setFocused(true);
          if (!item.disabled) onFocusItem(item.id);
        }}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        onKeyDown={(event) => {
          if (event.defaultPrevented) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setPressed(true);
            onActivate(item);
          }
        }}
        onKeyUp={() => setPressed(false)}
        className={cn(
          anatomy.item,
          sizes.itemPad,
          sizes.itemMinH,
          sizes.itemType,
          rowBg,
          rowText,
          item.disabled && anatomy.itemDisabled,
        )}
      >
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(
            anatomy.stateLayer,
            stateLayerColor,
            "rounded-[inherit]",
          )}
          style={{ opacity: stateLayer }}
        />
        {item.leadingIcon ? (
          <span
            aria-hidden
            data-slot="icon-leading"
            className={cn(
              anatomy.icon,
              !item.error && !isSelected ? iconColor : "",
            )}
          >
            {item.leadingIcon}
          </span>
        ) : null}
        {item.label != null ? (
          <span
            data-slot="label"
            className="relative z-[1] flex-1 truncate"
          >
            {item.label}
          </span>
        ) : null}
        {item.trailingText != null ? (
          <span data-slot="trailing-text" className={anatomy.trailingText}>
            {item.trailingText}
          </span>
        ) : null}
        {item.trailingIcon ? (
          <span
            aria-hidden
            data-slot="icon-trailing"
            className={cn(
              anatomy.icon,
              !item.error && !isSelected ? iconColor : "",
              "ml-auto",
            )}
          >
            {item.trailingIcon}
          </span>
        ) : null}
      </button>
    </motion.li>
  );
}
