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
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  triggerShape,
  variantClasses,
} from "./anatomy";
import type {
  TimePickerHourCycle,
  TimePickerMode,
  TimePickerProps,
  TimePickerShape,
  TimePickerSize,
  TimePickerValue,
  TimePickerVariant,
} from "./types";

export type {
  TimePickerCellState,
  TimePickerHourCycle,
  TimePickerMode,
  TimePickerProps,
  TimePickerShape,
  TimePickerSize,
  TimePickerValue,
  TimePickerVariant,
} from "./types";

/**
 * M3-tokenized Time Picker.
 *
 * Re-skins MUI X TimePicker (https://mui.com/x/react-date-pickers/time-picker/)
 * onto M3 tokens. Matches the M3 docs at
 * https://m3.material.io/components/time-pickers/specs.
 *
 *   - 5 variants     : filled / tonal / outlined / text / elevated
 *   - 3 sizes        : 40 / 56 / 64 dp triggers, 224 / 256 / 288 dp dials
 *   - 7 shapes       : full M3 corner scale on the panel + selection blob
 *   - 12h / 24h      : AM/PM toggle for 12-hour cycle, no toggle for 24
 *   - WAI-ARIA       : `role="dialog"` panel, hour / minute time fields
 *                      announced via `aria-label` + `aria-pressed`,
 *                      dial cells render as `role="option"` inside a
 *                      `role="listbox"`; `aria-haspopup="dialog"` +
 *                      `aria-expanded` on the trigger
 *   - Motion         : panel scale / opacity open via `springs.gentle`;
 *                      selection blob springs between dial cells via
 *                      shared `layoutId` + `springs.springy`; collapses
 *                      under reduced motion
 *   - Keyboard       : ArrowUp/Down ±1 step, ArrowLeft/Right ±1 step,
 *                      PageUp/Down ±5 steps, Home/End to first/last
 *                      cell, Enter/Space confirm or advance hour →
 *                      minute, Escape close
 */
function TimePickerInner(
  {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    mode,
    defaultMode,
    onModeChange,
    variant = "filled",
    size = "md",
    shape = "xl",
    hourCycle = 12,
    minuteStep = 5,
    label,
    supportingText,
    placeholder = "HH:MM",
    ariaLabel,
    disabled = false,
    error = false,
    leadingIcon,
    trailingIcon,
    formatTime = defaultFormat,
    className,
    ...rest
  }: TimePickerProps,
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
  const dialId = `${baseId}-dial`;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] =
    useState<TimePickerValue | null>(() => clampValue(defaultValue ?? null));
  const selected = isControlled
    ? clampValue(value ?? null)
    : uncontrolledValue;

  const isOpenControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(
    () => Boolean(defaultOpen),
  );
  const isOpen = !disabled && (isOpenControlled ? Boolean(open) : uncontrolledOpen);

  const isModeControlled = mode !== undefined;
  const [uncontrolledMode, setUncontrolledMode] = useState<TimePickerMode>(
    () => defaultMode ?? "hours",
  );
  const activeMode = isModeControlled ? (mode as TimePickerMode) : uncontrolledMode;

  const [draft, setDraft] = useState<TimePickerValue>(() =>
    selected ?? { hours: 0, minutes: 0 },
  );

  const sizes = sizeClasses[size];

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const setMode = useCallback(
    (next: TimePickerMode) => {
      if (!isModeControlled) setUncontrolledMode(next);
      onModeChange?.(next);
    },
    [isModeControlled, onModeChange],
  );

  useEffect(() => {
    if (isOpen) {
      setDraft(selected ?? { hours: 0, minutes: 0 });
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
    (next: TimePickerValue | null) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
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
    commitValue({ ...draft });
    setOpen(false);
  }, [commitValue, draft, setOpen]);

  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const registerCellRef = useCallback(
    (key: string, node: HTMLButtonElement | null) => {
      if (node) cellRefs.current[key] = node;
      else delete cellRefs.current[key];
    },
    [],
  );

  const focusCell = useCallback((value: number) => {
    requestAnimationFrame(() => {
      cellRefs.current[String(value)]?.focus({ preventScroll: true });
    });
  }, []);

  const setDraftHour = useCallback(
    (hours: number) => {
      setDraft((prev) => ({ ...prev, hours }));
    },
    [],
  );

  const setDraftMinute = useCallback(
    (minutes: number) => {
      setDraft((prev) => ({ ...prev, minutes }));
    },
    [],
  );

  const handleDialActivate = useCallback(
    (next: number) => {
      if (activeMode === "hours") {
        setDraftHour(next);
        setMode("minutes");
      } else {
        setDraftMinute(next);
      }
    },
    [activeMode, setDraftHour, setDraftMinute, setMode],
  );

  const moveStep = useCallback(
    (delta: number) => {
      if (activeMode === "hours") {
        if (hourCycle === 24) {
          const real = ((draft.hours + delta) % 24 + 24) % 24;
          setDraftHour(real);
          focusCell(real);
        } else {
          const visual = (draft.hours % 12) === 0 ? 12 : draft.hours % 12;
          const nextVisual = ((visual - 1 + delta + 12) % 12) + 1;
          const isPm = draft.hours >= 12;
          const real = nextVisual === 12
            ? (isPm ? 12 : 0)
            : nextVisual + (isPm ? 12 : 0);
          setDraftHour(real);
          focusCell(real);
        }
      } else {
        const total = 60;
        const next = ((draft.minutes + delta * minuteStep) % total + total) % total;
        setDraftMinute(next);
        focusCell(next);
      }
    },
    [activeMode, draft.hours, draft.minutes, focusCell, hourCycle, minuteStep, setDraftHour, setDraftMinute],
  );

  const handlePanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen) return;
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setOpen(false);
          return;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          moveStep(1);
          return;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          moveStep(-1);
          return;
        case "PageDown":
          event.preventDefault();
          moveStep(5);
          return;
        case "PageUp":
          event.preventDefault();
          moveStep(-5);
          return;
        case "Home":
          event.preventDefault();
          if (activeMode === "hours") setDraftHour(hourCycle === 24 ? 0 : 1);
          else setDraftMinute(0);
          return;
        case "End":
          event.preventDefault();
          if (activeMode === "hours") setDraftHour(hourCycle === 24 ? 23 : 12);
          else setDraftMinute(60 - minuteStep);
          return;
        case "Enter":
        case " ":
          event.preventDefault();
          if (activeMode === "hours") setMode("minutes");
          else handleConfirm();
          return;
        default:
          return;
      }
    },
    [
      activeMode,
      handleConfirm,
      hourCycle,
      isOpen,
      minuteStep,
      moveStep,
      setDraftHour,
      setDraftMinute,
      setMode,
      setOpen,
    ],
  );

  const triggerLabel = formatTriggerValue(selected, formatTime, hourCycle);
  const periodLabel = hourCycle === 12 ? (draft.hours >= 12 ? "PM" : "AM") : null;
  const visibleHour = hourCycle === 24
    ? draft.hours
    : ((draft.hours % 12) || 12);

  const dialCells = useMemo(() => {
    if (activeMode === "hours") {
      if (hourCycle === 24) {
        return Array.from({ length: 24 }, (_, i) => ({
          value: i,
          label: String(i).padStart(2, "0"),
          angle: (i % 12) * 30,
          ring: i >= 12 ? "inner" : ("outer" as const),
        }));
      }
      const isPm = draft.hours >= 12;
      return Array.from({ length: 12 }, (_, i) => {
        const visual = i + 1;
        const real = isPm ? (visual === 12 ? 12 : visual + 12) : (visual === 12 ? 0 : visual);
        return {
          value: real,
          label: String(visual),
          angle: visual === 12 ? 0 : visual * 30,
          ring: "outer" as const,
        };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const minute = i * 5;
      return {
        value: minute,
        label: String(minute).padStart(2, "0"),
        angle: i * 30,
        ring: "outer" as const,
      };
    });
  }, [activeMode, draft.hours, hourCycle]);

  const activeCell = useMemo(() => {
    if (activeMode === "hours") {
      return dialCells.find((cell) => cell.value === draft.hours) ?? dialCells[0];
    }
    const snapped = Math.round(draft.minutes / 5) * 5;
    return dialCells.find((cell) => cell.value === snapped) ?? dialCells[0];
  }, [activeMode, dialCells, draft.hours, draft.minutes]);

  const dialPx = activeMode === "hours" && hourCycle === 24 ? sizes.dialRadius - 32 : sizes.dialRadius;

  return (
    <motion.div
      ref={rootRef}
      data-component="time-picker"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-mode={activeMode}
      data-cycle={hourCycle}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-open={isOpen || undefined}
      className={cn(anatomy.root, disabled && anatomy.disabled, className)}
      {...rest}
    >
      <TimePickerTrigger
        triggerId={triggerId}
        labelId={labelId}
        supportingId={supportingText ? supportingId : undefined}
        panelId={panelId}
        ariaLabel={ariaLabel}
        label={label}
        valueText={triggerLabel}
        placeholder={placeholder}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon ?? <ClockGlyph />}
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
            data-slot="time-picker-panel"
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
            transition={reduced ? { duration: 0 } : springs.gentle}
            onKeyDown={handlePanelKeyDown}
            className={cn(anatomy.panel, shapeClasses[shape])}
          >
            <span data-slot="time-picker-eyebrow" className={anatomy.panelEyebrow}>
              Select time
            </span>

            <div data-slot="time-picker-fields" className={anatomy.panelTimeRow}>
              <button
                type="button"
                data-slot="time-picker-hour-field"
                aria-label={`Hours, ${visibleHour}`}
                aria-pressed={activeMode === "hours"}
                className={cn(
                  anatomy.timeField,
                  activeMode === "hours"
                    ? anatomy.timeFieldActive
                    : anatomy.timeFieldDefault,
                )}
                onClick={() => setMode("hours")}
              >
                <span id={headlineId} className={anatomy.timeFieldDigit}>
                  {String(visibleHour).padStart(2, "0")}
                </span>
              </button>
              <span data-slot="time-picker-colon" className={anatomy.timeColon}>
                :
              </span>
              <button
                type="button"
                data-slot="time-picker-minute-field"
                aria-label={`Minutes, ${String(draft.minutes).padStart(2, "0")}`}
                aria-pressed={activeMode === "minutes"}
                className={cn(
                  anatomy.timeField,
                  activeMode === "minutes"
                    ? anatomy.timeFieldActive
                    : anatomy.timeFieldDefault,
                )}
                onClick={() => setMode("minutes")}
              >
                <span className={anatomy.timeFieldDigit}>
                  {String(draft.minutes).padStart(2, "0")}
                </span>
              </button>
              {hourCycle === 12 ? (
                <div
                  data-slot="time-picker-ampm"
                  role="radiogroup"
                  aria-label="AM or PM"
                  className={anatomy.ampmColumn}
                >
                  {(["AM", "PM"] as const).map((label) => {
                    const isSelected = (label === "AM" && draft.hours < 12) || (label === "PM" && draft.hours >= 12);
                    return (
                      <button
                        key={label}
                        type="button"
                        data-slot="time-picker-ampm-cell"
                        data-period={label.toLowerCase()}
                        data-selected={isSelected || undefined}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={label}
                        className={cn(
                          anatomy.ampmCell,
                          isSelected && anatomy.ampmCellSelected,
                        )}
                        onClick={() => {
                          if (label === "AM" && draft.hours >= 12) {
                            setDraftHour(draft.hours - 12);
                          } else if (label === "PM" && draft.hours < 12) {
                            setDraftHour(draft.hours + 12);
                          }
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div
              id={dialId}
              data-slot="time-picker-dial"
              role="listbox"
              aria-label={activeMode === "hours" ? "Hour" : "Minute"}
              aria-activedescendant={`${dialId}-${activeCell.value}`}
              className={cn(anatomy.dialFrame, sizes.dialSize)}
            >
              <span data-slot="time-picker-pivot" aria-hidden className={anatomy.dialPivot} />
              <DialStroke
                periodLabel={periodLabel}
                radius={dialPx}
                angle={activeCell.angle}
                reduced={Boolean(reduced)}
                cellValue={activeCell.value}
              />
              {dialCells.map((cell) => {
                const isSelected = cell.value === activeCell.value;
                const radius = cell.ring === "inner"
                  ? sizes.dialRadius - 32
                  : sizes.dialRadius;
                const cellId = `${dialId}-${cell.value}`;
                return (
                  <DialCell
                    key={cell.value}
                    cellId={cellId}
                    baseId={baseId}
                    label={cell.label}
                    value={cell.value}
                    angleDeg={cell.angle}
                    radius={radius}
                    isSelected={isSelected}
                    shape={shape}
                    reduced={Boolean(reduced)}
                    registerRef={registerCellRef}
                    onActivate={() => handleDialActivate(cell.value)}
                  />
                );
              })}
            </div>

            <div data-slot="time-picker-actions" className={anatomy.panelActions}>
              <button
                type="button"
                data-slot="time-picker-cancel"
                className={anatomy.actionButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                data-slot="time-picker-ok"
                className={anatomy.actionButton}
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

interface TimePickerTriggerProps {
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
  variant: TimePickerVariant;
  size: TimePickerSize;
  disabled: boolean;
  error: boolean;
  isOpen: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

function TimePickerTrigger({
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
}: TimePickerTriggerProps) {
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
      data-slot="time-picker-trigger"
      data-component="time-picker-trigger"
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

interface DialCellProps {
  cellId: string;
  baseId: string;
  label: string;
  value: number;
  angleDeg: number;
  radius: number;
  isSelected: boolean;
  shape: TimePickerShape;
  reduced: boolean;
  registerRef: (key: string, node: HTMLButtonElement | null) => void;
  onActivate: () => void;
}

function DialCell({
  cellId,
  baseId,
  label,
  value,
  angleDeg,
  radius,
  isSelected,
  shape,
  reduced,
  registerRef,
  onActivate,
}: DialCellProps) {
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
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const x = 50 + (radius / (radius * 2)) * 50 * Math.cos(angleRad);
  const y = 50 + (radius / (radius * 2)) * 50 * Math.sin(angleRad);
  const left = `calc(50% + ${Math.cos(angleRad) * radius}px)`;
  const top = `calc(50% + ${Math.sin(angleRad) * radius}px)`;
  // x/y reserved for non-percent positioning fallbacks if needed.
  void x;
  void y;
  return (
    <button
      ref={(node) => registerRef(String(value), node)}
      id={cellId}
      type="button"
      role="option"
      aria-selected={isSelected}
      data-slot="time-picker-dial-cell"
      data-value={value}
      data-selected={isSelected || undefined}
      data-angle={angleDeg}
      tabIndex={isSelected ? 0 : -1}
      onClick={onActivate}
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
      style={{
        left,
        top,
        color: isSelected ? "var(--md-sys-color-on-primary)" : undefined,
      }}
      className={cn(
        anatomy.dialCell,
        isSelected && anatomy.dialCellSelected,
      )}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.stateLayer, "bg-on-surface")}
        style={{ opacity: stateLayer }}
      />
      {isSelected ? (
        <motion.span
          layout
          layoutId={`time-picker-blob-${baseId}`}
          aria-hidden
          data-slot="time-picker-dial-blob"
          data-shape={shape}
          className={cn(anatomy.dialBlob, shapeClasses[shape])}
          style={{ left: "50%", top: "50%" }}
          transition={
            reduced
              ? { duration: 0 }
              : { ...springs.springy, layout: springs.springy }
          }
        />
      ) : null}
      <span data-slot="time-picker-dial-label" className="relative z-[2]">
        {label}
      </span>
    </button>
  );
}

interface DialStrokeProps {
  radius: number;
  angle: number;
  reduced: boolean;
  cellValue: number;
  periodLabel: string | null;
}

function DialStroke({ radius, angle, reduced, cellValue, periodLabel }: DialStrokeProps) {
  // Re-render keyed by selected cell so the stroke morphs with the
  // shared layout transition via motion/react.
  void cellValue;
  void periodLabel;
  return (
    <motion.span
      aria-hidden
      data-slot="time-picker-dial-stroke"
      className={anatomy.dialStroke}
      style={{
        left: "50%",
        top: "50%",
        width: radius,
      }}
      animate={{ rotate: angle - 90 }}
      transition={reduced ? { duration: 0 } : springs.springy}
    />
  );
}

function ClockGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm.5-13H11v6l5.2 3.1.8-1.3-4.5-2.7z" />
    </svg>
  );
}

function defaultFormat(value: TimePickerValue, hourCycle: TimePickerHourCycle): string {
  if (hourCycle === 24) {
    return `${pad2(value.hours)}:${pad2(value.minutes)}`;
  }
  const period = value.hours >= 12 ? "PM" : "AM";
  const visual = value.hours % 12 === 0 ? 12 : value.hours % 12;
  return `${pad2(visual)}:${pad2(value.minutes)} ${period}`;
}

function formatTriggerValue(
  value: TimePickerValue | null,
  formatter: (v: TimePickerValue, hourCycle: TimePickerHourCycle) => string,
  hourCycle: TimePickerHourCycle,
): string {
  if (!value) return "";
  return formatter(value, hourCycle);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function clampValue(value: TimePickerValue | null): TimePickerValue | null {
  if (!value) return null;
  const hours = clamp(value.hours, 0, 23);
  const minutes = clamp(value.minutes, 0, 59);
  return { hours, minutes };
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export const TimePicker = forwardRef(TimePickerInner);
