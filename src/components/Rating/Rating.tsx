import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FocusEvent, MouseEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { RatingProps } from "./types";

export type { RatingProps, RatingSize, RatingVariant } from "./types";

const FilledStar = ({ size }: { size: number }) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M12 2l2.9 6.9L22 9.3l-5.5 4.7 1.7 7.3L12 17.8 5.8 21.3l1.7-7.3L2 9.3l7.1-.4L12 2z" />
  </svg>
);

const EmptyStar = ({ size }: { size: number }) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2.9 6.9L22 9.3l-5.5 4.7 1.7 7.3L12 17.8 5.8 21.3l1.7-7.3L2 9.3l7.1-.4L12 2z" />
  </svg>
);

interface RatingItemProps {
  /** Whole-number value this slot represents (1..max). */
  symbol: number;
  /** Visual fill amount for this slot — 0, 0.5, or 1 (drives the icon clip). */
  fill: 0 | 0.5 | 1;
  /** Whether the half-value input should report `checked`. */
  halfChecked: boolean;
  /** Whether the full-value input should report `checked`. */
  fullChecked: boolean;
  /** Size token. */
  size: NonNullable<RatingProps["size"]>;
  /** Variant token. */
  variant: NonNullable<RatingProps["variant"]>;
  /** Half precision allowed? */
  precision: 0.5 | 1;
  /** Disabled — fades + suppresses state-layer. */
  disabled: boolean;
  /** Read-only — like disabled but keeps focusability + opacity. */
  readOnly: boolean;
  /** Reduced-motion preference. */
  reduced: boolean | null;
  /** Native input id prefix; suffixed with -value or -half. */
  inputIdPrefix: string;
  /** Native input name. */
  name: string;
  /** Native input change handler. */
  onSelect: (next: number) => void;
  /** Hover preview — receives the value the cursor is currently over. */
  onHover: (preview: number | null) => void;
  /** aria-label for the full input. */
  fullLabel: string;
  /** aria-label for the half input. */
  halfLabel: string;
  /** Filled icon node — defaults to a star. */
  iconNode: ReactNode;
  /** Empty icon node — defaults to a hollow star. */
  emptyIconNode: ReactNode;
}

function RatingItem({
  symbol,
  fill,
  halfChecked,
  fullChecked,
  size,
  variant,
  precision,
  disabled,
  readOnly,
  reduced,
  inputIdPrefix,
  name,
  onSelect,
  onHover,
  fullLabel,
  halfLabel,
  iconNode,
  emptyIconNode,
}: RatingItemProps): ReactNode {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];

  // The state-layer is suppressed when the row is disabled or read-only.
  const stateLayerOpacityValue =
    disabled || readOnly
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

  const fullId = `${inputIdPrefix}-${symbol}`;
  const halfId = `${inputIdPrefix}-${symbol}-half`;

  const interactive = !disabled && !readOnly;

  // Use click (not change) so a click on an already-checked radio still
  // fires — that's how MUI's "toggle off" behavior is wired up. The
  // empty onChange prop keeps React's controlled-input contract happy.
  const handleFullClick = useCallback(
    (event: MouseEvent<HTMLInputElement>) => {
      if (!interactive) {
        event.preventDefault();
        return;
      }
      onSelect(symbol);
    },
    [interactive, onSelect, symbol],
  );

  const handleHalfClick = useCallback(
    (event: MouseEvent<HTMLInputElement>) => {
      if (!interactive) {
        event.preventDefault();
        return;
      }
      onSelect(symbol - 0.5);
    },
    [interactive, onSelect, symbol],
  );

  const noop = useCallback(() => {}, []);

  return (
    <span
      data-rating-item
      data-fill={fill}
      data-symbol={symbol}
      className={cn(anatomy.item, sizes.item)}
      onPointerEnter={() => {
        if (!interactive) return;
        setHovered(true);
        onHover(symbol);
      }}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => interactive && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerMove={(event) => {
        if (!interactive || precision !== 0.5) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const isLeftHalf = event.clientX - rect.left < rect.width / 2;
        onHover(isLeftHalf ? symbol - 0.5 : symbol);
      }}
    >
      <span
        aria-hidden
        data-rating-state-layer
        className={cn(anatomy.stateLayer, variantStyles.stateLayer)}
        style={{ opacity: stateLayerOpacityValue }}
      />
      <motion.span
        data-rating-icon-wrap
        className={cn(anatomy.iconWrap, sizes.icon)}
        initial={false}
        animate={
          reduced ? { scale: 1 } : pressed ? { scale: 0.92 } : { scale: 1 }
        }
        transition={reduced ? { duration: 0 } : springs.springy}
        style={{ width: sizes.iconPx, height: sizes.iconPx }}
      >
        <span
          aria-hidden
          data-rating-empty
          className={cn(anatomy.emptyIcon)}
        >
          {emptyIconNode}
        </span>
        <span
          aria-hidden
          data-rating-filled
          data-fill={fill}
          className={cn(anatomy.filledIcon, variantStyles.filled)}
          style={{
            // Half-fill is rendered as a left-half clip; full = whole symbol.
            clipPath:
              fill === 1
                ? "inset(0 0 0 0)"
                : fill === 0.5
                  ? "inset(0 50% 0 0)"
                  : "inset(0 100% 0 0)",
          }}
        >
          {iconNode}
        </span>
      </motion.span>
      {precision === 0.5 ? (
        <input
          type="radio"
          id={halfId}
          name={name}
          value={symbol - 0.5}
          aria-label={halfLabel}
          disabled={disabled || readOnly}
          checked={halfChecked}
          onChange={noop}
          onClick={handleHalfClick}
          onFocus={(e: FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            void e;
          }}
          onBlur={() => {
            setFocused(false);
            setPressed(false);
          }}
          className={anatomy.inputHalf}
        />
      ) : null}
      <input
        type="radio"
        id={fullId}
        name={name}
        value={symbol}
        aria-label={fullLabel}
        disabled={disabled || readOnly}
        checked={fullChecked}
        onChange={noop}
        onClick={handleFullClick}
        onFocus={(e: FocusEvent<HTMLInputElement>) => {
          setFocused(true);
          void e;
        }}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        className={anatomy.input}
      />
    </span>
  );
}

/**
 * Rating component (MUI fallback re-skinned with M3 tokens). M3 has
 * no native Rating spec, so this matches MUI's behavior model
 * (https://mui.com/material-ui/react-rating/) while painting every
 * symbol from M3 token roles.
 *
 * - Filled symbol = primary (or tertiary in `accent` variant).
 * - Empty symbol = on-surface-variant.
 * - State-layer paints at M3 opacities on hover/focus/press.
 * - Symbols press-bounce with the springy motion preset; collapses to
 *   no transition under reduced motion.
 * - Half-precision: each item is split into two radios — one for the
 *   half value and one for the full value. The clip-path on the
 *   filled icon visualises the half/full state.
 */
export function Rating(props: RatingProps) {
  const {
    name,
    value,
    defaultValue,
    onChange,
    onChangeActive,
    max = 5,
    precision = 1,
    size = "md",
    variant = "default",
    readOnly = false,
    disabled = false,
    label,
    helperText,
    icon,
    emptyIcon,
    getLabelText,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    ...rest
  } = props;
  const reduced = useReducedMotion();
  const reactId = useId();
  const groupId = id ?? `rating-${reactId}`;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const labelId = label ? `${groupId}-label` : undefined;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<number | null>(
    defaultValue ?? null,
  );
  const current = isControlled ? value : internal;

  const [hoverPreview, setHoverPreview] = useState<number | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onChangeActiveRef = useRef(onChangeActive);
  onChangeActiveRef.current = onChangeActive;

  const handleSelect = useCallback(
    (next: number) => {
      // Toggling the same value off mirrors MUI's behavior.
      const resolved = next === current ? null : next;
      if (!isControlled) setInternal(resolved);
      onChangeRef.current?.(resolved);
    },
    [current, isControlled],
  );

  const handleHover = useCallback((preview: number | null) => {
    setHoverPreview(preview);
    onChangeActiveRef.current?.(preview);
  }, []);

  const describedBy = useMemo(() => {
    const ids = [helperId, ariaDescribedBy].filter(Boolean) as string[];
    return ids.length > 0 ? ids.join(" ") : undefined;
  }, [helperId, ariaDescribedBy]);

  const inputIdPrefix = `${groupId}-input`;
  const sizes = sizeClasses[size];
  const iconNode = icon ?? <FilledStar size={sizes.iconPx} />;
  const emptyIconNode = emptyIcon ?? <EmptyStar size={sizes.iconPx} />;

  const labelText = (v: number) => getLabelText?.(v) ?? `${v} Stars`;

  // Use the hover preview as the visual fill source if present.
  const visualValue = hoverPreview ?? current ?? 0;

  return (
    <div
      {...rest}
      id={groupId}
      data-rating-root
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn(anatomy.group, className)}
      onPointerLeave={() => handleHover(null)}
    >
      {label !== undefined ? (
        <span id={labelId} className={anatomy.label}>
          {label}
        </span>
      ) : null}
      <div
        role="radiogroup"
        data-rating-row
        aria-label={ariaLabel ?? (label ? undefined : name)}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          anatomy.row,
          (disabled || readOnly) && "opacity-[0.38]",
          disabled && "pointer-events-none",
        )}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((symbol) => {
          const fill: 0 | 0.5 | 1 =
            visualValue >= symbol
              ? 1
              : visualValue >= symbol - 0.5
                ? 0.5
                : 0;
          // Native input checked tracks the canonical `current`, NOT the
          // hover preview — otherwise toggling off when the cursor is
          // still inside the slot would leave it visually stuck.
          const fullChecked = current === symbol;
          const halfChecked = current === symbol - 0.5;
          return (
            <RatingItem
              key={symbol}
              symbol={symbol}
              fill={fill}
              halfChecked={halfChecked}
              fullChecked={fullChecked}
              size={size}
              variant={variant}
              precision={precision}
              disabled={disabled}
              readOnly={readOnly}
              reduced={reduced}
              inputIdPrefix={inputIdPrefix}
              name={name}
              onSelect={handleSelect}
              onHover={handleHover}
              fullLabel={labelText(symbol)}
              halfLabel={labelText(symbol - 0.5)}
              iconNode={iconNode}
              emptyIconNode={emptyIconNode}
            />
          );
        })}
      </div>
      {helperText !== undefined ? (
        <span id={helperId} className={anatomy.helper}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
