import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs, tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  triggerShape,
  variantClasses,
} from "./anatomy";
import type {
  DateRange,
  DateRangePickerDayState,
  DateRangePickerProps,
  DateRangePickerShape,
  DateRangePickerSize,
  DateRangePickerVariant,
} from "./types";

export type {
  DateRange,
  DateRangePickerDayState,
  DateRangePickerProps,
  DateRangePickerShape,
  DateRangePickerSize,
  DateRangePickerVariant,
} from "./types";

const SHORT_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const FULL_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * M3-tokenized Date Range Picker.
 *
 * Re-skins MUI X DateRangePicker
 * (https://mui.com/x/react-date-pickers/date-range-picker/) onto M3 tokens.
 * Material 3 has no formal Lab Date Range Picker JSON spec, so this follows
 * the project's MUI fallback rule and matches the M3 docs at
 * https://m3.material.io/components/date-pickers/specs.
 *
 *   - 5 variants     : filled / tonal / outlined / text / elevated
 *   - 3 sizes        : 40 / 56 / 64 dp triggers, 32 / 40 / 48 dp days
 *   - 7 shapes       : full M3 corner scale on the panel + endpoints
 *   - WAI-ARIA       : `role="dialog"` panel + `role="grid"` day grid +
 *                      `role="row"` weeks + `role="gridcell"` days +
 *                      `aria-haspopup="dialog"` + `aria-expanded` on
 *                      the trigger; `aria-selected` on each endpoint;
 *                      `aria-current="date"` on today
 *   - Motion         : panel scale / opacity open via spring; endpoint
 *                      cursors slide between days via shared
 *                      `layoutId` + springs.springy; range fill grows
 *                      via tween; collapses under reduced motion
 *   - Keyboard       : ArrowUp/Down ±7 days, ArrowLeft/Right ±1 day,
 *                      Home/End to start/end of week, PageUp/Down ±1
 *                      month, Enter/Space confirm, Escape close
 */
function DateRangePickerInner(
  {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    variant = "filled",
    size = "md",
    shape = "xl",
    label,
    supportingText,
    placeholder = "Start – End",
    ariaLabel,
    disabled = false,
    error = false,
    minDate,
    maxDate,
    leadingIcon,
    trailingIcon,
    formatDate = defaultFormat,
    weekStartsOn = 0,
    className,
    ...rest
  }: DateRangePickerProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const reactId = useId();
  const baseId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");
  const triggerId = `${baseId}-trigger`;
  const labelId = `${baseId}-label`;
  const supportingId = `${baseId}-supporting`;
  const panelId = `${baseId}-panel`;
  const headlineId = `${baseId}-headline`;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    () => normalizeRange(defaultValue ?? EMPTY_RANGE),
  );
  const selected = isControlled
    ? normalizeRange(value ?? EMPTY_RANGE)
    : uncontrolledValue;

  const isOpenControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(
    () => Boolean(defaultOpen),
  );
  const isOpen = !disabled && (isOpenControlled ? Boolean(open) : uncontrolledOpen);

  const initialMonth = useMemo(
    () => startOfMonth(selected.start ?? selected.end ?? new Date()),
    // We only seed once; month moves via the nav buttons after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [viewMonth, setViewMonth] = useState<Date>(initialMonth);
  const [draft, setDraft] = useState<DateRange>(selected);
  const [focusedDay, setFocusedDay] = useState<Date | null>(
    selected.start ?? selected.end ?? startOfMonth(new Date()),
  );

  const sizes = sizeClasses[size];

  const today = useMemo(() => normalize(new Date()), []);

  const isOutOfRange = useCallback(
    (date: Date) => {
      const t = normalize(date).getTime();
      if (minDate && t < normalize(minDate).getTime()) return true;
      if (maxDate && t > normalize(maxDate).getTime()) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  useEffect(() => {
    if (isOpen) {
      const seed = selected.start ?? selected.end ?? new Date();
      setViewMonth(startOfMonth(seed));
      setDraft(selected);
      setFocusedDay(seed);
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: PointerEvent) => {
      const node = rootRef.current;
      if (!node) return;
      if (node.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [isOpen, setOpen]);

  const commitValue = useCallback(
    (next: DateRange) => {
      const normalized = normalizeRange(next);
      if (!isControlled) setUncontrolledValue(normalized);
      onValueChange?.(normalized);
    },
    [isControlled, onValueChange],
  );

  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    setOpen(!isOpen);
  }, [disabled, isOpen, setOpen]);

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setOpen(false);
      }
    },
    [disabled, isOpen, setOpen],
  );

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleConfirm = useCallback(() => {
    commitValue(draft);
    setOpen(false);
  }, [commitValue, draft, setOpen]);

  const moveMonth = useCallback((delta: number) => {
    setViewMonth((prev) => addMonths(prev, delta));
  }, []);

  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const registerDayRef = useCallback(
    (key: string, node: HTMLButtonElement | null) => {
      if (node) dayRefs.current[key] = node;
      else delete dayRefs.current[key];
    },
    [],
  );

  const focusDay = useCallback((date: Date) => {
    const key = toLocalDateString(date);
    requestAnimationFrame(() => {
      dayRefs.current[key]?.focus({ preventScroll: true });
    });
  }, []);

  const handleDayActivate = useCallback(
    (date: Date) => {
      if (isOutOfRange(date)) return;
      const next = normalize(date);
      setDraft((prev) => advanceRange(prev, next));
      setFocusedDay(next);
    },
    [isOutOfRange],
  );

  const moveFocusedDay = useCallback(
    (delta: number) => {
      setFocusedDay((prev) => {
        const seed = prev ?? new Date();
        const next = normalize(addDays(seed, delta));
        setViewMonth((m) =>
          isSameMonth(m, next) ? m : startOfMonth(next),
        );
        focusDay(next);
        return next;
      });
    },
    [focusDay],
  );

  const handlePanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen) return;
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setOpen(false);
          return;
        case "ArrowDown":
          event.preventDefault();
          moveFocusedDay(7);
          return;
        case "ArrowUp":
          event.preventDefault();
          moveFocusedDay(-7);
          return;
        case "ArrowLeft":
          event.preventDefault();
          moveFocusedDay(-1);
          return;
        case "ArrowRight":
          event.preventDefault();
          moveFocusedDay(1);
          return;
        case "Home":
          event.preventDefault();
          setFocusedDay((prev) => {
            const next = startOfWeek(prev ?? new Date(), weekStartsOn);
            focusDay(next);
            return next;
          });
          return;
        case "End":
          event.preventDefault();
          setFocusedDay((prev) => {
            const next = endOfWeek(prev ?? new Date(), weekStartsOn);
            focusDay(next);
            return next;
          });
          return;
        case "PageUp":
          event.preventDefault();
          moveMonth(-1);
          return;
        case "PageDown":
          event.preventDefault();
          moveMonth(1);
          return;
        case "Enter":
        case " ":
          if (focusedDay) {
            event.preventDefault();
            handleDayActivate(focusedDay);
          }
          return;
        default:
          return;
      }
    },
    [
      focusDay,
      focusedDay,
      handleDayActivate,
      isOpen,
      moveFocusedDay,
      moveMonth,
      setOpen,
      weekStartsOn,
    ],
  );

  const triggerLabel = formatTriggerRange(selected, formatDate);
  const headline = formatHeadline(draft);
  const monthLabel = `${MONTH_LABELS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  const visibleWeeks = useMemo(
    () => buildMonthMatrix(viewMonth, weekStartsOn),
    [viewMonth, weekStartsOn],
  );
  const orderedWeekdays = useMemo(
    () => rotate(SHORT_WEEKDAYS, weekStartsOn),
    [weekStartsOn],
  );
  const orderedFullWeekdays = useMemo(
    () => rotate(FULL_WEEKDAYS, weekStartsOn),
    [weekStartsOn],
  );

  return (
    <motion.div
      ref={rootRef}
      data-component="date-range-picker"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-open={isOpen || undefined}
      className={cn(
        anatomy.root,
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      <DateRangePickerTrigger
        triggerId={triggerId}
        labelId={labelId}
        supportingId={supportingText ? supportingId : undefined}
        panelId={panelId}
        ariaLabel={ariaLabel}
        label={label}
        valueText={triggerLabel}
        placeholder={placeholder}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon ?? <CalendarRangeGlyph />}
        variant={variant}
        size={size}
        disabled={disabled}
        error={error}
        isOpen={isOpen}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      />

      {supportingText ? (
        <span
          id={supportingId}
          data-slot="supporting-text"
          className={cn(
            anatomy.supporting,
            error ? anatomy.supportingError : anatomy.supportingDefault,
          )}
        >
          {supportingText}
        </span>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="panel"
            id={panelId}
            data-slot="date-range-picker-panel"
            data-shape={shape}
            role="dialog"
            aria-modal="false"
            aria-labelledby={headlineId}
            tabIndex={-1}
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, y: -4 }
            }
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -4 }
            }
            transition={
              reduced ? { duration: 0 } : springs.gentle
            }
            onKeyDown={handlePanelKeyDown}
            className={cn(anatomy.panel, shapeClasses[shape])}
          >
            <div
              data-slot="date-range-picker-header"
              className={anatomy.panelHeader}
            >
              <span
                data-slot="date-range-picker-eyebrow"
                className={anatomy.panelHeaderEyebrow}
              >
                Select range
              </span>
              <span
                id={headlineId}
                data-slot="date-range-picker-headline"
                className={cn(anatomy.panelHeadline, sizes.headlineSize)}
              >
                {headline}
              </span>
            </div>

            <div
              data-slot="date-range-picker-nav"
              className={anatomy.panelNav}
            >
              <button
                type="button"
                data-slot="date-range-picker-prev"
                aria-label="Previous month"
                className={anatomy.panelNavButton}
                onClick={() => moveMonth(-1)}
              >
                <ChevronGlyph direction="left" />
              </button>
              <span
                data-slot="date-range-picker-month-label"
                className={anatomy.panelNavLabel}
                aria-live="polite"
              >
                {monthLabel}
              </span>
              <button
                type="button"
                data-slot="date-range-picker-next"
                aria-label="Next month"
                className={anatomy.panelNavButton}
                onClick={() => moveMonth(1)}
              >
                <ChevronGlyph direction="right" />
              </button>
            </div>

            <div
              data-slot="date-range-picker-grid"
              role="grid"
              aria-labelledby={headlineId}
              className="px-0"
            >
              <div
                role="row"
                data-slot="weekday-row"
                className={anatomy.weekdayRow}
              >
                {orderedWeekdays.map((short, index) => (
                  <span
                    key={`${short}-${index}`}
                    role="columnheader"
                    aria-label={orderedFullWeekdays[index]}
                    data-slot="weekday-cell"
                    className={anatomy.weekdayCell}
                  >
                    {short}
                  </span>
                ))}
              </div>

              <div className={anatomy.dayGrid}>
                {visibleWeeks.flatMap((week, weekIndex) =>
                  week.map((cell, cellIndex) => {
                    const cellDate = normalize(cell.date);
                    const inMonth = cell.inMonth;
                    const isStart =
                      draft.start != null && isSameDay(draft.start, cellDate);
                    const isEnd =
                      draft.end != null &&
                      draft.start != null &&
                      isSameDay(draft.end, cellDate) &&
                      !isSameDay(draft.start, draft.end);
                    const isInRange =
                      draft.start != null &&
                      draft.end != null &&
                      cellDate.getTime() > draft.start.getTime() &&
                      cellDate.getTime() < draft.end.getTime();
                    const isToday = isSameDay(cellDate, today);
                    const cellDisabled = disabled || isOutOfRange(cellDate);
                    const isFocused =
                      focusedDay != null && isSameDay(focusedDay, cellDate);
                    const state = resolveDayState({
                      isStart,
                      isEnd,
                      isInRange,
                      isToday,
                      cellDisabled,
                    });
                    return (
                      <DayCell
                        key={`${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`}
                        baseId={baseId}
                        date={cellDate}
                        size={size}
                        shape={shape}
                        cellIndex={cellIndex}
                        inMonth={inMonth}
                        isStart={isStart}
                        isEnd={isEnd}
                        isInRange={isInRange}
                        isToday={isToday}
                        isDisabled={cellDisabled}
                        isFocused={isFocused}
                        weekIndex={weekIndex}
                        state={state}
                        reduced={Boolean(reduced)}
                        registerRef={registerDayRef}
                        onActivate={() => handleDayActivate(cellDate)}
                        onFocus={() => setFocusedDay(cellDate)}
                      />
                    );
                  }),
                )}
              </div>
            </div>

            <div
              data-slot="date-range-picker-actions"
              className={anatomy.panelActions}
            >
              <button
                type="button"
                data-slot="date-range-picker-cancel"
                className={anatomy.actionButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                data-slot="date-range-picker-ok"
                aria-disabled={
                  draft.start == null && draft.end == null ? true : undefined
                }
                className={cn(
                  anatomy.actionButton,
                  draft.start == null && draft.end == null && anatomy.actionDisabled,
                )}
                onClick={handleConfirm}
              >
                OK
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

interface DateRangePickerTriggerProps {
  triggerId: string;
  labelId: string;
  supportingId?: string;
  panelId: string;
  ariaLabel?: string;
  label?: ReactNode;
  valueText: string;
  placeholder: string;
  leadingIcon?: ReactNode;
  trailingIcon: ReactNode;
  variant: DateRangePickerVariant;
  size: DateRangePickerSize;
  disabled: boolean;
  error: boolean;
  isOpen: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

function DateRangePickerTrigger({
  triggerId,
  labelId,
  supportingId,
  panelId,
  ariaLabel,
  label,
  valueText,
  placeholder,
  leadingIcon,
  trailingIcon,
  variant,
  size,
  disabled,
  error,
  isOpen,
  onClick,
  onKeyDown,
}: DateRangePickerTriggerProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];
  const stateLayer = !disabled
    ? pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0
    : 0;
  const hasValue = valueText.length > 0;
  const ariaLabelledBy = label ? labelId : undefined;
  return (
    <button
      type="button"
      id={triggerId}
      data-slot="date-range-picker-trigger"
      data-component="date-range-picker-trigger"
      data-variant={variant}
      data-size={size}
      data-error={error || undefined}
      data-open={isOpen || undefined}
      data-disabled={disabled || undefined}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
      aria-describedby={supportingId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
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
      className={cn(
        anatomy.trigger,
        variantStyles.trigger,
        triggerShape,
        sizes.triggerHeight,
        sizes.triggerPadding,
        error && "text-error border-error",
      )}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.stateLayer, "bg-on-surface")}
        style={{ opacity: stateLayer }}
      />
      {leadingIcon ? (
        <span
          aria-hidden
          data-slot="leading-icon"
          className={anatomy.triggerIcon}
        >
          {leadingIcon}
        </span>
      ) : null}
      <span
        data-slot="trigger-content"
        className="relative z-[1] flex flex-1 flex-col items-start text-left"
      >
        {label ? (
          <span id={labelId} className={anatomy.triggerLabel}>
            {label}
          </span>
        ) : null}
        <span
          data-slot="trigger-value"
          className={cn(
            anatomy.triggerValue,
            !hasValue && anatomy.triggerPlaceholder,
          )}
        >
          {hasValue ? valueText : placeholder}
        </span>
      </span>
      <span
        aria-hidden
        data-slot="trailing-icon"
        className={anatomy.triggerIcon}
      >
        {trailingIcon}
      </span>
    </button>
  );
}

interface DayCellProps {
  baseId: string;
  date: Date;
  size: DateRangePickerSize;
  shape: DateRangePickerShape;
  cellIndex: number;
  inMonth: boolean;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  weekIndex: number;
  state: DateRangePickerDayState;
  reduced: boolean;
  registerRef: (key: string, node: HTMLButtonElement | null) => void;
  onActivate: () => void;
  onFocus: () => void;
}

function DayCell({
  baseId,
  date,
  size,
  shape,
  cellIndex,
  inMonth,
  isStart,
  isEnd,
  isInRange,
  isToday,
  isDisabled,
  isFocused,
  weekIndex,
  state,
  reduced,
  registerRef,
  onActivate,
  onFocus,
}: DayCellProps) {
  const sizes = sizeClasses[size];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const stateLayer = !isDisabled
    ? pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0
    : 0;
  const dayLabel = `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onActivate();
  };
  const dayKey = toLocalDateString(date);
  const isEndpoint = isStart || isEnd;
  const rangeFillClass = isStart
    ? anatomy.rangeFillStart
    : isEnd
      ? anatomy.rangeFillEnd
      : isInRange
        ? anatomy.rangeFillFull
        : null;
  const showRangeFill = rangeFillClass != null;
  const isWeekStart = cellIndex === 0;
  const isWeekEnd = cellIndex === 6;
  const ariaSelected = isEndpoint ? true : isInRange ? true : false;
  return (
    <div
      data-slot="date-range-picker-day-wrap"
      data-week-index={weekIndex}
      data-cell-index={cellIndex}
      data-in-range={isInRange || undefined}
      data-start={isStart || undefined}
      data-end={isEnd || undefined}
      className={cn(anatomy.dayCellWrap, sizes.dayRowHeight)}
    >
      {showRangeFill ? (
        <span
          aria-hidden
          data-slot="date-range-picker-range-fill"
          className={cn(
            anatomy.rangeFill,
            rangeFillClass,
            isWeekStart && "left-0 rounded-l-shape-full",
            isWeekEnd && "right-0 rounded-r-shape-full",
          )}
        />
      ) : null}
      <button
        ref={(node) => registerRef(dayKey, node)}
        type="button"
        role="gridcell"
        data-slot="date-range-picker-day"
        data-day={dayKey}
        data-week-index={weekIndex}
        data-in-month={inMonth || undefined}
        data-start={isStart || undefined}
        data-end={isEnd || undefined}
        data-in-range={isInRange || undefined}
        data-today={isToday || undefined}
        data-disabled={isDisabled || undefined}
        data-focused={isFocused || undefined}
        data-state={state}
        aria-label={dayLabel}
        aria-selected={ariaSelected}
        aria-current={isToday ? "date" : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isFocused ? 0 : -1}
        disabled={isDisabled}
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => {
          if (!isDisabled) setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        className={cn(
          anatomy.dayCell,
          sizes.daySize,
          !inMonth && anatomy.dayCellOutside,
          isToday && !isEndpoint && anatomy.dayCellToday,
          isEndpoint && anatomy.dayCellEndpoint,
          !isEndpoint && isInRange && anatomy.dayCellInRange,
          isDisabled && anatomy.dayCellDisabled,
        )}
      >
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.stateLayer, "bg-on-surface")}
          style={{ opacity: stateLayer }}
        />
        {isStart ? (
          <motion.span
            layout
            layoutId={`date-range-picker-cursor-start-${baseId}`}
            aria-hidden
            data-slot="date-range-picker-day-cursor"
            data-endpoint="start"
            data-shape={shape}
            className={cn(anatomy.dayCursor, shapeClasses[shape])}
            transition={
              reduced
                ? { duration: 0 }
                : { ...springs.springy, layout: springs.springy }
            }
          />
        ) : null}
        {isEnd ? (
          <motion.span
            layout
            layoutId={`date-range-picker-cursor-end-${baseId}`}
            aria-hidden
            data-slot="date-range-picker-day-cursor"
            data-endpoint="end"
            data-shape={shape}
            className={cn(anatomy.dayCursor, shapeClasses[shape])}
            transition={
              reduced
                ? { duration: 0 }
                : { ...springs.springy, layout: springs.springy }
            }
          />
        ) : null}
        <span
          data-slot="day-label"
          className={anatomy.dayCellLabel}
          style={{
            color: isEndpoint
              ? "var(--md-sys-color-on-primary)"
              : isInRange
                ? "var(--md-sys-color-on-primary-container)"
                : undefined,
            transition: reduced
              ? "none"
              : `color ${tweens.standard.duration}s`,
          }}
        >
          {date.getDate()}
        </span>
      </button>
    </div>
  );
}

function CalendarRangeGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="currentColor"
    >
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
      <path d="M7 13h4v2H7v-2zm6 0h4v2h-4v-2z" />
    </svg>
  );
}

function ChevronGlyph({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="currentColor"
      style={{
        transform: direction === "left" ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="M9 6l6 6-6 6V6z" />
    </svg>
  );
}

function defaultFormat(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = String(date.getFullYear()).padStart(4, "0");
  return `${m}/${d}/${y}`;
}

function formatTriggerRange(
  range: DateRange,
  formatter: (date: Date) => string,
): string {
  if (range.start == null && range.end == null) return "";
  const startText = range.start ? formatter(range.start) : "—";
  const endText = range.end ? formatter(range.end) : "—";
  return `${startText} – ${endText}`;
}

function formatHeadline(range: DateRange): string {
  if (range.start == null && range.end == null) return "Select range";
  const formatPart = (date: Date) => {
    const weekday = FULL_WEEKDAYS[date.getDay()].slice(0, 3);
    const month = MONTH_LABELS[date.getMonth()].slice(0, 3);
    return `${weekday}, ${month} ${date.getDate()}`;
  };
  if (range.start && range.end) {
    return `${formatPart(range.start)} – ${formatPart(range.end)}`;
  }
  if (range.start) return `${formatPart(range.start)} – —`;
  return `— – ${formatPart(range.end as Date)}`;
}

function normalize(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLocalDateString(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeRange(range: DateRange): DateRange {
  const start = range.start ? normalize(range.start) : null;
  const end = range.end ? normalize(range.end) : null;
  if (start && end && start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function addDays(date: Date, delta: number): Date {
  return new Date(date.getTime() + delta * MS_PER_DAY);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

function startOfWeek(date: Date, weekStartsOn: number): Date {
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return normalize(addDays(date, -diff));
}

function endOfWeek(date: Date, weekStartsOn: number): Date {
  const start = startOfWeek(date, weekStartsOn);
  return addDays(start, 6);
}

function rotate<T>(values: readonly T[], offset: number): T[] {
  const len = values.length;
  const out: T[] = new Array(len);
  for (let i = 0; i < len; i += 1) {
    out[i] = values[(i + offset) % len];
  }
  return out;
}

interface DayMatrixCell {
  date: Date;
  inMonth: boolean;
}

function buildMonthMatrix(
  viewMonth: Date,
  weekStartsOn: number,
): DayMatrixCell[][] {
  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, weekStartsOn);
  const weeks: DayMatrixCell[][] = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w += 1) {
    const week: DayMatrixCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = normalize(cursor);
      week.push({ date, inMonth: isSameMonth(date, monthStart) });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/**
 * Range advancement state machine — three click states cycle in
 * order: "no start" → pick start, "start only" → pick end (or
 * replace start if before it), "complete" → reset to a fresh
 * `start` and clear `end`.
 */
function advanceRange(prev: DateRange, next: Date): DateRange {
  if (prev.start && prev.end) {
    return { start: next, end: null };
  }
  if (prev.start && !prev.end) {
    if (next.getTime() < prev.start.getTime()) {
      return { start: next, end: prev.start };
    }
    if (isSameDay(next, prev.start)) {
      return { start: prev.start, end: prev.start };
    }
    return { start: prev.start, end: next };
  }
  return { start: next, end: null };
}

function resolveDayState({
  isStart,
  isEnd,
  isInRange,
  isToday,
  cellDisabled,
}: {
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isToday: boolean;
  cellDisabled: boolean;
}): DateRangePickerDayState {
  if (cellDisabled) return "disabled";
  if (isStart) return "start";
  if (isEnd) return "end";
  if (isInRange) return "in-range";
  if (isToday) return "today";
  return "default";
}

export const DateRangePicker = forwardRef(DateRangePickerInner);
