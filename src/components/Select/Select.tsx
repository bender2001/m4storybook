import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  sizeSpec,
  variantFieldClasses,
  variantStateLayerClasses,
} from "./anatomy";
import type { SelectOption, SelectProps } from "./types";

export type {
  SelectOption,
  SelectProps,
  SelectSize,
  SelectVariant,
} from "./types";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    aria-hidden
    viewBox="0 0 20 20"
    className="h-full w-full"
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
    fill="currentColor"
  >
    <path d="M5.5 7.5L10 12l4.5-4.5H5.5z" />
  </motion.svg>
);

/**
 * Select component — M3 fallback (no dedicated Expressive spec).
 * Trigger uses the M3 Text Field (filled / outlined) anatomy and
 * opens a tokenized M3 Menu popup. The popup is a `listbox` and the
 * trigger advertises itself as a `combobox` with `aria-haspopup`.
 *
 * Keyboard model follows the WAI-ARIA listbox-combobox pattern:
 *   - Enter / Space / ArrowDown — open menu, focus active option
 *   - ArrowUp / ArrowDown — move active option
 *   - Home / End — first / last option
 *   - Enter / Space — commit active option
 *   - Esc / Tab — dismiss menu
 *
 * Motion: chevron spins through the M3 standard tween; menu enters
 * with the emphasized-decelerate tween and exits with emphasized.
 * Reduced-motion collapses both to 0ms.
 *
 * A hidden native `<select>` mirrors the value for native form
 * submission without breaking the M3 visual treatment.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      label,
      options,
      value,
      defaultValue = null,
      onChange,
      variant = "outlined",
      size = "md",
      disabled = false,
      error = false,
      helperText,
      leadingIcon,
      placeholder,
      id,
      name,
      "aria-label": ariaLabel,
      className,
    },
    ref,
  ) {
    const reactId = useId();
    const fieldId = id ?? `select-${reactId}`;
    const listboxId = `${fieldId}-listbox`;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    const reduced = useReducedMotion();
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | null>(
      defaultValue,
    );
    const currentValue = (isControlled ? value : internalValue) ?? null;
    const selectedOption = useMemo(
      () => options.find((o) => o.value === currentValue) ?? null,
      [options, currentValue],
    );

    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    // When opening, focus the currently selected option (or 0 if none).
    useEffect(() => {
      if (!open) return;
      const initial = options.findIndex((o) => o.value === currentValue);
      setActiveIndex(initial >= 0 ? initial : 0);
    }, [open, options, currentValue]);

    // Click-outside closes the menu.
    useEffect(() => {
      if (!open) return;
      const onPointer = (e: PointerEvent) => {
        if (!rootRef.current) return;
        if (rootRef.current.contains(e.target as Node)) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", onPointer);
      return () => document.removeEventListener("pointerdown", onPointer);
    }, [open]);

    const commitValue = useCallback(
      (option: SelectOption | null) => {
        const next = option?.value ?? null;
        if (!isControlled) setInternalValue(next);
        onChange?.(next, option);
      },
      [isControlled, onChange],
    );

    const handleSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;
        commitValue(option);
        setOpen(false);
      },
      [commitValue],
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          setActiveIndex((i) => Math.min(i + 1, options.length - 1));
          return;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          setActiveIndex((i) => Math.max(i - 1, 0));
          return;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          const opt = options[activeIndex];
          if (opt) handleSelect(opt);
          return;
        }
        case "Escape": {
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          return;
        }
        case "Tab": {
          if (open) setOpen(false);
          return;
        }
        case "Home":
          if (open) {
            e.preventDefault();
            setActiveIndex(0);
          }
          return;
        case "End":
          if (open) {
            e.preventDefault();
            setActiveIndex(options.length - 1);
          }
          return;
        default:
          return;
      }
    };

    const stateLayer = disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    const isFloating = focused || open || selectedOption !== null;
    const sz = sizeSpec[size];

    return (
      <div
        ref={rootRef}
        className={cn(anatomy.root, className)}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        data-select-root
      >
        <div
          className={cn(
            anatomy.field,
            sz.field,
            sz.paddingX,
            variantFieldClasses[variant],
            disabled && "pointer-events-none opacity-[0.38]",
            error && "border-error",
          )}
          data-error={error || undefined}
          data-open={open || undefined}
          data-select-field
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => {
            setHovered(false);
            setPressed(false);
          }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
        >
          <span
            aria-hidden
            data-state-layer
            className={cn(
              anatomy.stateLayer,
              variantStateLayerClasses[variant],
            )}
            style={{ opacity: stateLayer }}
          />

          {leadingIcon ? (
            <span
              aria-hidden
              className={cn(anatomy.leadingIcon, sz.iconBox, "mr-3")}
            >
              {leadingIcon}
            </span>
          ) : null}

          {label ? (
            <label
              htmlFor={fieldId}
              className={cn(
                anatomy.label,
                isFloating ? sz.labelFloating : sz.label,
                isFloating
                  ? sz.labelLeftFloating
                  : leadingIcon
                    ? sz.labelLeftWithIcon
                    : sz.labelLeft,
                error && "text-error",
              )}
            >
              {label}
            </label>
          ) : null}

          <button
            ref={ref}
            id={fieldId}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-label={ariaLabel ?? label}
            aria-describedby={helperId}
            aria-disabled={disabled || undefined}
            aria-invalid={error || undefined}
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${listboxId}-opt-${activeIndex}`
                : undefined
            }
            disabled={disabled}
            data-select-trigger
            className={cn(anatomy.trigger, sz.trigger)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setPressed(false);
            }}
            onClick={() => setOpen((v) => !v)}
            onKeyDown={handleKeyDown}
          >
            {selectedOption ? (
              <span data-select-value className={anatomy.value}>
                {selectedOption.label}
              </span>
            ) : (
              <span data-select-placeholder className={anatomy.placeholder}>
                {label && !isFloating ? "" : (placeholder ?? "")}
              </span>
            )}
            <span
              aria-hidden
              data-select-chevron
              className={cn(anatomy.trailingIcon, sz.iconBox, "ml-2")}
            >
              <ChevronIcon open={open} />
            </span>
          </button>

          {/* Hidden native select for form submission. */}
          {name ? (
            <select
              aria-hidden
              tabIndex={-1}
              name={name}
              value={currentValue ?? ""}
              onChange={() => {}}
              className={anatomy.nativeSelect}
            >
              <option value="" />
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {helperText ? (
          <p
            id={helperId}
            data-select-helper
            className={cn(anatomy.helperText, error && "text-error")}
          >
            {helperText}
          </p>
        ) : null}

        <AnimatePresence>
          {open && !disabled ? (
            <motion.div
              key="popup"
              initial={{ opacity: 0, scaleY: 0.92, y: -4 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.96, y: -4 }}
              transition={
                reduced ? { duration: 0 } : tweens.emphasizedDecelerate
              }
              className={cn(anatomy.popup, "top-full")}
              data-select-popup
            >
              <ul
                ref={listRef}
                role="listbox"
                id={listboxId}
                aria-label={label ?? ariaLabel ?? "Options"}
                tabIndex={-1}
                className={anatomy.list}
              >
                {options.length === 0 ? (
                  <li
                    role="option"
                    aria-selected={false}
                    className={anatomy.empty}
                  >
                    No options
                  </li>
                ) : (
                  options.map((opt, idx) => {
                    const isActive = idx === activeIndex;
                    const isSelected = opt.value === currentValue;
                    return (
                      <li
                        key={opt.value}
                        id={`${listboxId}-opt-${idx}`}
                        role="option"
                        data-select-option
                        data-active={isActive || undefined}
                        data-selected={isSelected || undefined}
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled || undefined}
                        className={cn(
                          anatomy.option,
                          sz.popupOption,
                          opt.disabled && "pointer-events-none opacity-[0.38]",
                        )}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(opt);
                        }}
                      >
                        <span
                          aria-hidden
                          data-option-state-layer
                          className={anatomy.optionStateLayer}
                          style={{
                            opacity: isActive
                              ? stateLayerOpacity.hover
                              : isSelected
                                ? stateLayerOpacity.focus
                                : 0,
                          }}
                        />
                        <span className="relative z-[1]">{opt.label}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);
