import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  errorClasses,
  orientationClasses,
  shapeClasses,
  sizeClasses,
  tabDisabledClasses,
  variantClasses,
} from "./anatomy";
import type {
  TabsItem,
  TabsItemState,
  TabsProps,
  TabsShape,
  TabsVariant,
} from "./types";

export type {
  TabsItem,
  TabsItemState,
  TabsOrientation,
  TabsProps,
  TabsShape,
  TabsSize,
  TabsVariant,
} from "./types";

/**
 * M3-tokenized Tabs.
 *
 * Implements both M3 Primary Tabs + M3 Secondary Tabs spec
 * (https://m3.material.io/components/tabs/specs) plus the M3
 * Expressive selection morph: the active indicator is a shared
 * `layoutId` element that springs between tabs, and the indicator
 * shape morphs from `shape-xs` to the selected `shape` token via
 * motion/react springs.
 *
 *   - 5 variants     : filled / tonal / outlined / text / elevated
 *   - 3 sizes        : 40 / 48 / 64 dp tab containers
 *   - 2 orientations : horizontal / vertical
 *   - 7 shapes       : full M3 corner scale on the active morph
 *   - WAI-ARIA       : `role="tablist"` + `role="tab"` + `aria-selected`
 *                      + `aria-controls`; optional `role="tabpanel"`
 *                      + `aria-labelledby` when `renderTabContent` is set
 *   - Motion         : springy indicator slide + shape morph; collapses
 *                      under reduced motion
 *   - Keyboard       : ArrowLeft/Right/Up/Down move focus along the tab
 *                      list; Home/End jumps; Enter/Space activates
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    activeKey,
    defaultActiveKey,
    onChange,
    variant = "filled",
    size = "md",
    orientation = "horizontal",
    shape = "md",
    fullWidth = false,
    disabled = false,
    ariaLabel,
    renderTabContent,
    className,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const reactId = useId();
  const sanitizedReactId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");

  const isControlled = activeKey !== undefined;
  const initialKey =
    defaultActiveKey ??
    items.find((item) => !item.disabled)?.key ??
    items[0]?.key ??
    "";
  const [uncontrolledActive, setUncontrolledActive] = useState<string>(
    initialKey,
  );
  const active = isControlled ? String(activeKey) : uncontrolledActive;

  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.key === active)),
    [items, active],
  );

  const setActive = useCallback(
    (nextKey: string) => {
      const idx = items.findIndex((item) => item.key === nextKey);
      if (idx < 0) return;
      if (items[idx]?.disabled) return;
      if (!isControlled) setUncontrolledActive(nextKey);
      onChange?.(nextKey, idx);
    },
    [isControlled, onChange, items],
  );

  const variantStyles = variantClasses[variant];
  const orient = orientationClasses[orientation];

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const setTabRef = useCallback(
    (key: string, node: HTMLButtonElement | null) => {
      tabRefs.current[key] = node;
    },
    [],
  );

  const reachableKeys = useMemo(
    () =>
      items
        .filter((item) => !item.disabled)
        .map((item) => item.key),
    [items],
  );

  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  useEffect(() => {
    if (focusedKey == null && reachableKeys.length > 0) {
      setFocusedKey(
        reachableKeys.includes(active) ? active : reachableKeys[0],
      );
    } else if (
      focusedKey != null &&
      !reachableKeys.includes(focusedKey)
    ) {
      setFocusedKey(reachableKeys[0] ?? null);
    }
  }, [active, focusedKey, reachableKeys]);

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      if (reachableKeys.length === 0) return;
      const current = focusedKey ?? reachableKeys[0];
      const idx = reachableKeys.indexOf(current);
      const nextIdx =
        (idx + delta + reachableKeys.length) % reachableKeys.length;
      const nextKey = reachableKeys[nextIdx];
      setFocusedKey(nextKey);
      tabRefs.current[nextKey]?.focus({ preventScroll: true });
    },
    [focusedKey, reachableKeys],
  );

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, item: TabsItem) => {
      if (disabled) return;
      const fwdKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const backKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      if (event.key === fwdKey) {
        event.preventDefault();
        moveFocus(1);
        return;
      }
      if (event.key === backKey) {
        event.preventDefault();
        moveFocus(-1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        if (reachableKeys[0]) {
          setFocusedKey(reachableKeys[0]);
          tabRefs.current[reachableKeys[0]]?.focus({ preventScroll: true });
        }
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        if (reachableKeys.length > 0) {
          const lastKey = reachableKeys[reachableKeys.length - 1];
          setFocusedKey(lastKey);
          tabRefs.current[lastKey]?.focus({ preventScroll: true });
        }
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(item.key);
      }
    },
    [disabled, moveFocus, orientation, reachableKeys, setActive],
  );

  const activeItem = items[activeIndex];

  return (
    <motion.div
      ref={ref}
      data-component="tabs"
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      data-shape={shape}
      data-full-width={fullWidth || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        anatomy.root,
        variantStyles.host,
        orientation === "vertical" && "flex-row",
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      <div
        role="tablist"
        data-component="tabs-list"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={cn(
          anatomy.list,
          orient.listFlow,
          orientation === "horizontal" && "w-full",
          orientation === "vertical" && "h-full min-w-[200px]",
        )}
      >
        {items.map((item, index) => {
          const state = resolveState(item, item.key === active);
          const isFocused = focusedKey === item.key;
          const isSelected = state === "selected";
          const isDisabledTab = item.disabled === true;
          const interactive = !disabled && !isDisabledTab;
          const isLast = index === items.length - 1;

          return (
            <Tab
              key={item.key}
              item={item}
              index={index}
              state={state}
              variant={variant}
              shape={shape}
              size={size}
              orientation={orientation}
              fullWidth={fullWidth}
              isFocused={isFocused}
              isSelected={isSelected}
              isLast={isLast}
              interactive={interactive}
              tablistId={sanitizedReactId}
              reduced={Boolean(reduced)}
              onActivate={() => setActive(item.key)}
              onKeyDown={handleTabKeyDown}
              onFocus={() => {
                if (interactive) setFocusedKey(item.key);
              }}
              registerRef={setTabRef}
            />
          );
        })}

        {variantStyles.showDivider ? (
          <span
            aria-hidden
            data-slot="tabs-divider"
            className={cn(anatomy.divider, orient.dividerAxis)}
          />
        ) : null}
      </div>

      {renderTabContent && activeItem ? (
        <div
          role="tabpanel"
          id={`${sanitizedReactId}-panel-${activeItem.key}`}
          aria-labelledby={`${sanitizedReactId}-tab-${activeItem.key}`}
          data-component="tabs-panel"
          data-key={activeItem.key}
          tabIndex={0}
          className={cn(anatomy.panel)}
        >
          {renderTabContent(activeItem, activeIndex)}
        </div>
      ) : null}
    </motion.div>
  );
});

interface TabProps {
  item: TabsItem;
  index: number;
  state: TabsItemState;
  variant: TabsVariant;
  shape: TabsShape;
  size: keyof typeof sizeClasses;
  orientation: "horizontal" | "vertical";
  fullWidth: boolean;
  isFocused: boolean;
  isSelected: boolean;
  isLast: boolean;
  interactive: boolean;
  tablistId: string;
  reduced: boolean;
  onActivate: () => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    item: TabsItem,
  ) => void;
  onFocus: () => void;
  registerRef: (key: string, node: HTMLButtonElement | null) => void;
}

function Tab({
  item,
  index,
  state,
  variant,
  shape,
  size,
  orientation,
  fullWidth,
  isFocused,
  isSelected,
  isLast,
  interactive,
  tablistId,
  reduced,
  onActivate,
  onKeyDown,
  onFocus,
  registerRef,
}: TabProps) {
  const variantStyles = variantClasses[variant];
  const sizes = sizeClasses[size];
  const isError = state === "error";
  const isDisabledTab = state === "disabled";

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const stateLayer = !interactive
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const stateLayerColor = isError
    ? errorClasses.stateLayer
    : isSelected
      ? variantStyles.selectedStateLayer
      : variantStyles.inactiveStateLayer;

  const labelColor = isError
    ? errorClasses.label
    : isSelected
      ? variantStyles.selectedLabel
      : variantStyles.inactiveLabel;

  const tabId = `${tablistId}-tab-${item.key}`;
  const panelId = `${tablistId}-panel-${item.key}`;

  return (
    <button
      ref={(node) => registerRef(item.key, node)}
      id={tabId}
      type="button"
      role="tab"
      data-component="tabs-tab"
      data-key={item.key}
      data-index={index}
      data-state={state}
      data-selected={isSelected || undefined}
      data-error={isError || undefined}
      data-disabled={isDisabledTab || undefined}
      data-focused={isFocused || undefined}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={!interactive || undefined}
      tabIndex={!interactive ? -1 : isFocused ? 0 : -1}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onFocus={() => {
        setFocused(true);
        onFocus();
      }}
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={(event) => onKeyDown(event, item)}
      className={cn(
        anatomy.tab,
        sizes.tabHeight,
        labelColor,
        variantStyles.tabBorder,
        fullWidth && "flex-1",
        orientation === "vertical" && "w-full justify-start",
        isDisabledTab && tabDisabledClasses,
        !interactive && "cursor-default",
        !isLast && variant === "outlined" && orientation === "horizontal" && "-mr-[1px]",
        !isLast && variant === "outlined" && orientation === "vertical" && "-mb-[1px]",
      )}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.tabStateLayer, stateLayerColor)}
        style={{ opacity: stateLayer }}
      />

      <span
        data-slot="tab-content"
        className={cn(anatomy.tabContent, sizes.iconLabelGap)}
      >
        {item.icon ? (
          <span
            aria-hidden
            data-slot="tab-icon"
            className={cn(anatomy.icon, sizes.iconBox)}
          >
            {item.icon}
          </span>
        ) : null}
        <span
          data-slot="tab-label"
          className={cn(anatomy.label, sizes.label)}
        >
          {item.label}
        </span>
        {item.trailing ? (
          <span data-slot="tab-trailing" className={anatomy.trailing}>
            {item.trailing}
          </span>
        ) : null}
      </span>

      {isSelected ? (
        <motion.span
          layout
          layoutId={`tabs-indicator-${tablistId}`}
          aria-hidden
          data-slot="tabs-indicator"
          data-shape={shape}
          className={cn(
            anatomy.indicator,
            variantStyles.indicator,
            shapeClasses[shape],
            orientation === "horizontal"
              ? cn("left-0 right-0", sizes.indicatorOffset)
              : "top-0 bottom-0 right-0",
            orientation === "horizontal" ? "h-[3px]" : "w-[3px]",
          )}
          transition={
            reduced
              ? { duration: 0 }
              : { ...springs.springy, layout: springs.springy }
          }
        />
      ) : null}
    </button>
  );
}

function resolveState(item: TabsItem, isActive: boolean): TabsItemState {
  if (item.disabled) return "disabled";
  if (item.error) return "error";
  if (isActive) return "selected";
  return "inactive";
}
