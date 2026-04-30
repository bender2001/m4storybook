import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  connectorVariantClasses,
  dotVariantClasses,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  TimelineEvent,
  TimelineItemState,
  TimelinePosition,
  TimelineProps,
  TimelineShape,
  TimelineSize,
  TimelineVariant,
} from "./types";

export type {
  TimelineConnectorVariant,
  TimelineDotColor,
  TimelineDotVariant,
  TimelineEvent,
  TimelineItemState,
  TimelinePosition,
  TimelineProps,
  TimelineShape,
  TimelineSize,
  TimelineVariant,
} from "./types";

/**
 * M3-tokenized Timeline.
 *
 * Re-skins MUI Lab's `<Timeline />` (https://mui.com/material-ui/react-timeline/)
 * onto M3 tokens — Material 3 has no formal Timeline spec, so this
 * follows the project's "MUI fallback" rule.
 *
 *   - 5 variants     : text / filled / tonal / outlined / elevated
 *   - 3 sizes        : 24 / 28 / 36 dp dot diameters
 *   - 7 shapes       : full M3 corner scale on the wrapper + content card
 *   - 4 positions    : left / right / alternate / alternate-reverse
 *   - 5 dot colors   : primary / secondary / tertiary / error / neutral
 *   - 2 dot fills    : filled / outlined
 *   - 3 connectors   : solid / dashed / faded
 *   - WAI-ARIA       : `role="list"` host + `role="listitem"` rows;
 *                      interactive rows expose `aria-selected`,
 *                      `aria-disabled`, `aria-current="step"` for the
 *                      focused dot
 *   - Motion         : item enter rides springs.springy on a y/opacity
 *                      morph; active-dot cursor slides between rows via
 *                      shared `layoutId`; collapses under reduced motion
 *   - Keyboard       : ArrowUp/Down move focus across rows;
 *                      Home/End jump to first/last row;
 *                      Enter / Space toggle selection
 */
function TimelineInner(
  {
    events,
    variant = "text",
    size = "md",
    shape = "md",
    position = "right",
    ariaLabel,
    selectable = false,
    selected,
    defaultSelected = null,
    onSelectedChange,
    focusedId,
    defaultFocusedId = null,
    onFocusedChange,
    disabled = false,
    showCursor = true,
    className,
    ...rest
  }: TimelineProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const reduced = useReducedMotion();
  const reactId = useId();
  const timelineId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");

  const variantStyles = variantClasses[variant];
  const sizes = sizeClasses[size];

  // -------- selection (controlled / uncontrolled) ---------------------------

  const isSelectionControlled = selected !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] = useState<
    string | null
  >(() => defaultSelected ?? null);
  const selectedId = isSelectionControlled
    ? (selected as string | null)
    : uncontrolledSelected;

  const commitSelection = useCallback(
    (next: string | null) => {
      if (!isSelectionControlled) setUncontrolledSelected(next);
      onSelectedChange?.(next);
    },
    [isSelectionControlled, onSelectedChange],
  );

  // -------- focus / roving tabindex (controlled / uncontrolled) -------------

  const isFocusControlled = focusedId !== undefined;
  const [uncontrolledFocused, setUncontrolledFocused] = useState<
    string | null
  >(() => defaultFocusedId ?? null);
  const focusedKey = isFocusControlled
    ? (focusedId as string | null)
    : uncontrolledFocused;

  const commitFocus = useCallback(
    (next: string | null) => {
      if (!isFocusControlled) setUncontrolledFocused(next);
      onFocusedChange?.(next);
    },
    [isFocusControlled, onFocusedChange],
  );

  // -------- reachable rows for keyboard nav ---------------------------------

  const reachable = useMemo(
    () =>
      events
        .filter((evt) => !evt.disabled && !disabled)
        .map((evt) => evt.id),
    [events, disabled],
  );

  // -------- ensure the focused id stays valid -------------------------------

  useEffect(() => {
    if (!selectable) return;
    if (focusedKey == null && reachable.length > 0) {
      const fallback = selectedId ?? reachable[0];
      commitFocus(fallback);
    } else if (focusedKey != null && !reachable.includes(focusedKey)) {
      commitFocus(reachable[0] ?? null);
    }
    // commitFocus / selectedId tracked via the closure above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedKey, reachable, selectable]);

  // -------- ref registry so keyboard nav can move DOM focus -----------------

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setRowRef = useCallback(
    (id: string, node: HTMLDivElement | null) => {
      rowRefs.current[id] = node;
    },
    [],
  );

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      if (reachable.length === 0) return;
      const current = focusedKey ?? reachable[0];
      const idx = reachable.indexOf(current);
      const nextIdx = (idx + delta + reachable.length) % reachable.length;
      const nextId = reachable[nextIdx];
      commitFocus(nextId);
      rowRefs.current[nextId]?.focus({ preventScroll: true });
    },
    [reachable, focusedKey, commitFocus],
  );

  const focusById = useCallback(
    (id: string) => {
      commitFocus(id);
      rowRefs.current[id]?.focus({ preventScroll: true });
    },
    [commitFocus],
  );

  // -------- selection toggling ---------------------------------------------

  const toggleSelection = useCallback(
    (id: string) => {
      if (!selectable) return;
      const evt = events.find((e) => e.id === id);
      if (!evt || evt.disabled) return;
      commitSelection(selectedId === id ? null : id);
    },
    [commitSelection, events, selectable, selectedId],
  );

  // -------- keyboard handling ----------------------------------------------

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, id: string) => {
      if (disabled || !selectable) return;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          moveFocus(1);
          return;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          moveFocus(-1);
          return;
        case "Home": {
          event.preventDefault();
          const first = reachable[0];
          if (first) focusById(first);
          return;
        }
        case "End": {
          event.preventDefault();
          const last = reachable[reachable.length - 1];
          if (last) focusById(last);
          return;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          toggleSelection(id);
          return;
        default:
          return;
      }
    },
    [disabled, focusById, moveFocus, reachable, selectable, toggleSelection],
  );

  // -------- render ----------------------------------------------------------

  return (
    <motion.div
      ref={ref}
      data-component="timeline"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-position={position}
      data-selectable={selectable || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        anatomy.wrapper,
        variantStyles.wrapper,
        shapeClasses[shape],
        sizes.wrapperPadding,
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      <ul
        role="list"
        data-component="timeline-list"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={cn(anatomy.list, sizes.rowGap)}
      >
        {events.map((event, index) => (
          <TimelineRow
            key={event.id}
            event={event}
            index={index}
            total={events.length}
            timelineId={timelineId}
            variant={variant}
            size={size}
            shape={shape}
            position={position}
            selectable={selectable}
            selectedId={selectedId}
            focusedKey={focusedKey}
            disabledTimeline={disabled}
            showCursor={showCursor}
            reduced={Boolean(reduced)}
            registerRef={setRowRef}
            onActivate={toggleSelection}
            onFocusRow={(id) => commitFocus(id)}
            onKeyDown={(ev, id) => handleKeyDown(ev, id)}
          />
        ))}
      </ul>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* TimelineRow                                                                */
/* -------------------------------------------------------------------------- */

interface TimelineRowProps {
  event: TimelineEvent;
  index: number;
  total: number;
  timelineId: string;
  variant: TimelineVariant;
  size: TimelineSize;
  shape: TimelineShape;
  position: TimelinePosition;
  selectable: boolean;
  selectedId: string | null;
  focusedKey: string | null;
  disabledTimeline: boolean;
  showCursor: boolean;
  reduced: boolean;
  registerRef: (id: string, node: HTMLDivElement | null) => void;
  onActivate: (id: string) => void;
  onFocusRow: (id: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>, id: string) => void;
}

function TimelineRow({
  event,
  index,
  total,
  timelineId,
  variant,
  size,
  shape,
  position,
  selectable,
  selectedId,
  focusedKey,
  disabledTimeline,
  showCursor,
  reduced,
  registerRef,
  onActivate,
  onFocusRow,
  onKeyDown,
}: TimelineRowProps) {
  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];

  const isSelected = selectedId === event.id;
  const isDisabled = Boolean(event.disabled) || disabledTimeline;
  const isError = Boolean(event.error);
  const isFocused = focusedKey === event.id;
  const interactive = selectable && !isDisabled;

  const isLast = event.last ?? index === total - 1;
  const layoutMode = resolveLayout(position, index);

  const dotColor = event.dotColor ?? "primary";
  const dotVariant = event.dotVariant ?? "filled";
  const connectorVariant = event.connectorVariant ?? "solid";

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const stateLayer = !interactive
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focusVisible
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const itemState = resolveItemState({
    isSelected,
    isDisabled,
    isError,
  });

  const dotStyle: CSSProperties = {
    height: `${sizes.dotSize}px`,
    width: `${sizes.dotSize}px`,
  };

  const cursorStyle: CSSProperties = {
    height: `${sizes.cursorSize}px`,
    width: `${sizes.cursorSize}px`,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

  // Disabled wash routes through `animate` because motion/react writes
  // inline `opacity` that beats Tailwind's `opacity-[0.38]` class. The
  // wrapper-level `disabled` swap rides the same path.
  const targetOpacity = isDisabled ? 0.38 : 1;

  return (
    <motion.li
      data-component="timeline-item"
      data-id={event.id}
      data-index={index}
      data-state={itemState}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-error={isError || undefined}
      data-focused={isFocused || undefined}
      data-layout={layoutMode}
      className={cn(
        anatomy.item,
        layoutMode === "left" ? anatomy.itemLeft : anatomy.itemRight,
        sizes.contentGap,
        isDisabled && anatomy.itemDisabledCursor,
      )}
      initial={
        reduced
          ? { opacity: targetOpacity, y: 0 }
          : { opacity: 0, y: 12 }
      }
      animate={{ opacity: targetOpacity, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { ...springs.springy, delay: index * 0.04 }
      }
    >
      {event.oppositeContent !== undefined ? (
        <div
          data-slot="opposite-content"
          className={cn(anatomy.oppositeContent, sizes.secondaryType)}
        >
          {event.oppositeContent}
        </div>
      ) : (
        <div data-slot="opposite-content" aria-hidden className="flex-1" />
      )}

      <div data-slot="separator" className={anatomy.separator}>
        <div data-slot="dot-wrap" className="relative">
          <AnimatePresence>
            {showCursor && interactive && isFocused ? (
              <motion.span
                key="cursor"
                layout
                layoutId={`timeline-cursor-${timelineId}`}
                aria-hidden
                data-slot="timeline-cursor"
                data-shape={shape}
                className={cn(anatomy.cursor, variantStyles.cursor)}
                style={cursorStyle}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { ...springs.springy, layout: springs.springy }
                }
              />
            ) : null}
          </AnimatePresence>

          <span
            data-slot="dot"
            data-color={dotColor}
            data-fill={dotVariant}
            className={cn(anatomy.dot, dotVariantClasses(dotVariant, dotColor))}
            style={dotStyle}
          >
            {event.dotIcon ? (
              <span
                aria-hidden
                data-slot="dot-icon"
                className={cn(anatomy.dotIcon, sizes.dotGlyph)}
              >
                {event.dotIcon}
              </span>
            ) : null}
          </span>
        </div>

        {!isLast ? (
          <span
            data-slot="connector"
            data-variant={connectorVariant}
            aria-hidden
            className={cn(
              anatomy.connector,
              connectorVariantClasses(connectorVariant, dotColor),
            )}
          />
        ) : null}
      </div>

      <div
        ref={(el) => registerRef(event.id, el)}
        role="listitem"
        data-component="timeline-content"
        data-id={event.id}
        data-state={itemState}
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-error={isError || undefined}
        data-focused={isFocused || undefined}
        aria-selected={interactive ? isSelected : undefined}
        aria-current={isFocused && interactive ? "step" : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={!interactive ? -1 : isFocused ? 0 : -1}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => {
          if (interactive) setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        onFocus={(ev) => {
          if (interactive) onFocusRow(event.id);
          if (ev.target.matches(":focus-visible")) setFocusVisible(true);
        }}
        onBlur={() => {
          setFocusVisible(false);
          setPressed(false);
        }}
        onClick={() => {
          if (!interactive) return;
          onActivate(event.id);
        }}
        onKeyDown={(ev) => onKeyDown(ev, event.id)}
        className={cn(
          anatomy.content,
          shapeClasses[shape],
          sizes.contentPadding,
          interactive && anatomy.contentInteractive,
          isSelected
            ? variantStyles.selected
            : isError
              ? anatomy.contentError
              : "text-current",
        )}
      >
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.stateLayer, "bg-on-surface")}
          style={{ opacity: stateLayer }}
        />

        <span data-slot="label-stack" className={anatomy.labelStack}>
          <span
            data-slot="label"
            className={cn(anatomy.label, sizes.labelType)}
          >
            {event.label}
          </span>
          {event.secondary ? (
            <span data-slot="secondary" className={anatomy.secondary}>
              {event.secondary}
            </span>
          ) : null}
        </span>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function resolveLayout(
  position: TimelinePosition,
  index: number,
): "left" | "right" {
  switch (position) {
    case "left":
      return "left";
    case "right":
      return "right";
    case "alternate":
      return index % 2 === 0 ? "right" : "left";
    case "alternate-reverse":
      return index % 2 === 0 ? "left" : "right";
    default:
      return "right";
  }
}

function resolveItemState({
  isSelected,
  isDisabled,
  isError,
}: {
  isSelected: boolean;
  isDisabled: boolean;
  isError: boolean;
}): TimelineItemState {
  if (isDisabled) return "disabled";
  if (isError) return "error";
  if (isSelected) return "selected";
  return "default";
}

export const Timeline = forwardRef(TimelineInner);
