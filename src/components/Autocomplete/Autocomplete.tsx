import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
import type { AutocompleteOption, AutocompleteProps } from "./types";

export type {
  AutocompleteOption,
  AutocompleteProps,
  AutocompleteSize,
  AutocompleteVariant,
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

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  function Autocomplete(
    {
      label,
      options,
      value,
      defaultValue = null,
      onChange,
      inputValue,
      defaultInputValue,
      onInputChange,
      variant = "outlined",
      size = "md",
      disabled = false,
      error = false,
      helperText,
      leadingIcon,
      trailingIcon,
      placeholder,
      id,
      name,
      "aria-label": ariaLabel,
      className,
    },
    ref,
  ) {
    const reactId = useId();
    const fieldId = id ?? `autocomplete-${reactId}`;
    const listboxId = `${fieldId}-listbox`;

    const reduced = useReducedMotion();
    const rootRef = useRef<HTMLDivElement>(null);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | null>(
      defaultValue,
    );
    const currentValue = (isControlled ? value : internalValue) ?? null;
    const selectedOption = useMemo(
      () => options.find((o) => o.value === currentValue) ?? null,
      [options, currentValue],
    );

    const initialInput =
      defaultInputValue ?? (selectedOption ? selectedOption.label : "");
    const isInputControlled = inputValue !== undefined;
    const [internalInput, setInternalInput] = useState(initialInput);
    const currentInput = isInputControlled
      ? (inputValue as string)
      : internalInput;

    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const filtered = useMemo(() => {
      if (!currentInput) return options;
      const q = currentInput.toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, currentInput]);

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
      (option: AutocompleteOption | null) => {
        const next = option?.value ?? null;
        if (!isControlled) setInternalValue(next);
        if (!isInputControlled) setInternalInput(option?.label ?? "");
        onChange?.(next, option);
        onInputChange?.(option?.label ?? "");
      },
      [isControlled, isInputControlled, onChange, onInputChange],
    );

    const handleInputChange = (next: string) => {
      if (!isInputControlled) setInternalInput(next);
      onInputChange?.(next);
      setOpen(true);
      setActiveIndex(0);
    };

    const handleSelect = (option: AutocompleteOption) => {
      if (option.disabled) return;
      commitValue(option);
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            setActiveIndex(0);
            return;
          }
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          return;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            setActiveIndex(filtered.length - 1);
            return;
          }
          setActiveIndex((i) => Math.max(i - 1, 0));
          return;
        }
        case "Enter": {
          if (!open) return;
          e.preventDefault();
          const opt = filtered[activeIndex];
          if (opt) handleSelect(opt);
          return;
        }
        case "Escape": {
          e.preventDefault();
          setOpen(false);
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
            setActiveIndex(filtered.length - 1);
          }
          return;
        default:
          return;
      }
    };

    const stateLayer =
      disabled
        ? 0
        : pressed
          ? stateLayerOpacity.pressed
          : focused
            ? stateLayerOpacity.focus
            : hovered
              ? stateLayerOpacity.hover
              : 0;

    const isFloating = focused || open || currentInput.length > 0;
    const sz = sizeSpec[size];

    return (
      <div
        ref={rootRef}
        className={cn(anatomy.root, className)}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
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
            className={cn(anatomy.stateLayer, variantStateLayerClasses[variant])}
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
                leadingIcon && !isFloating && "!left-12",
                error && "text-error",
              )}
            >
              {label}
            </label>
          ) : null}

          <input
            ref={ref}
            id={fieldId}
            name={name}
            role="combobox"
            type="text"
            aria-label={ariaLabel ?? label}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={open}
            aria-disabled={disabled || undefined}
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${listboxId}-opt-${activeIndex}`
                : undefined
            }
            disabled={disabled}
            value={currentInput}
            placeholder={label && !isFloating ? "" : placeholder}
            className={cn(anatomy.input, sz.input, "text-on-surface")}
            onFocus={() => {
              setFocused(true);
              setOpen(true);
            }}
            onBlur={() => {
              setFocused(false);
              setPressed(false);
            }}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={() => setOpen(true)}
          />

          <span
            aria-hidden
            className={cn(anatomy.trailingIcon, sz.iconBox, "ml-2")}
          >
            {trailingIcon ?? <ChevronIcon open={open} />}
          </span>
        </div>

        {helperText ? (
          <p
            className={cn(
              anatomy.helperText,
              error && "text-error",
            )}
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
              transition={reduced ? { duration: 0 } : tweens.emphasizedDecelerate}
              className={cn(anatomy.popup, "top-full")}
              data-popup
            >
              <ul
                role="listbox"
                id={listboxId}
                aria-label={label ?? "Options"}
                className={anatomy.list}
              >
                {filtered.length === 0 ? (
                  <li role="option" aria-selected={false} className={anatomy.empty}>
                    No options
                  </li>
                ) : (
                  filtered.map((opt, idx) => {
                    const isActive = idx === activeIndex;
                    const isSelected = opt.value === currentValue;
                    return (
                      <li
                        key={opt.value}
                        id={`${listboxId}-opt-${idx}`}
                        role="option"
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
                          className={cn(
                            anatomy.optionStateLayer,
                            "bg-on-surface",
                          )}
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
