import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  AccordionItemProps,
  AccordionProps,
  AccordionShape,
  AccordionSize,
  AccordionVariant,
} from "./types";

export type {
  AccordionItemProps,
  AccordionProps,
  AccordionShape,
  AccordionSize,
  AccordionVariant,
} from "./types";

const ChevronIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
);

interface AccordionContextValue {
  variant: AccordionVariant;
  size: AccordionSize;
  shape: AccordionShape;
  expandedSet: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

/**
 * M3 Expressive Accordion. Stacks AccordionItem children, owns the
 * variant / size / shape contract, and orchestrates single- vs multi-
 * panel expansion per the M3 expansion-panel spec
 * (https://m3.material.io/components/expansion-panels).
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      variant = "filled",
      size = "md",
      shape = "md",
      multiple = false,
      defaultExpanded,
      expanded,
      onExpandedChange,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = expanded !== undefined;
    const [internal, setInternal] = useState<string[]>(
      defaultExpanded ?? [],
    );
    const expandedList = isControlled ? expanded : internal;
    const expandedSet = useMemo(() => new Set(expandedList), [expandedList]);

    const toggle = useCallback(
      (id: string) => {
        const isOpen = expandedSet.has(id);
        let next: string[];
        if (multiple) {
          next = isOpen
            ? expandedList.filter((x) => x !== id)
            : [...expandedList, id];
        } else {
          next = isOpen ? [] : [id];
        }
        if (!isControlled) setInternal(next);
        onExpandedChange?.(next);
      },
      [
        expandedList,
        expandedSet,
        isControlled,
        multiple,
        onExpandedChange,
      ],
    );

    const ctx = useMemo<AccordionContextValue>(
      () => ({ variant, size, shape, expandedSet, toggle }),
      [variant, size, shape, expandedSet, toggle],
    );

    return (
      <AccordionContext.Provider value={ctx}>
        <div
          ref={ref}
          data-component="accordion"
          data-multiple={multiple || undefined}
          className={cn(anatomy.root, "gap-2", className)}
          {...rest}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);

/**
 * One panel of an Accordion. Reads the surface contract from the
 * parent context (or falls back to filled/md/md when used standalone).
 * Owns its hover / focus / pressed state-layer + the M3 chevron
 * rotation + the spring-driven height transition for the panel.
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    {
      id: idProp,
      title,
      subhead,
      leadingIcon,
      trailingIcon,
      disabled = false,
      expanded: expandedProp,
      defaultExpanded = false,
      onChange,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const ctx = useContext(AccordionContext);
    const fallbackId = useId();
    const id = idProp ?? fallbackId;

    const [internal, setInternal] = useState(defaultExpanded);
    const isControlled = expandedProp !== undefined;
    const standaloneExpanded = isControlled ? expandedProp : internal;
    const expanded = ctx ? ctx.expandedSet.has(id) : standaloneExpanded;

    const variant = ctx?.variant ?? "filled";
    const size = ctx?.size ?? "md";
    const shape = ctx?.shape ?? "md";

    const styles = variantClasses[variant];
    const sizes = sizeClasses[size];

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const stateLayer = disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    const headerId = `${id}-header`;
    const panelId = `${id}-panel`;

    const handleToggle = useCallback(() => {
      if (disabled) return;
      if (ctx) {
        ctx.toggle(id);
        return;
      }
      const next = !expanded;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    }, [ctx, disabled, expanded, id, isControlled, onChange]);

    const handleKey = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (e.defaultPrevented) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (e.key === " ") setPressed(true);
          handleToggle();
        }
      },
      [disabled, handleToggle],
    );

    const trailing = trailingIcon ?? (
      <motion.span
        aria-hidden
        data-slot="chevron"
        className={cn(
          "inline-flex items-center justify-center",
          sizes.iconSize,
        )}
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : tweens.emphasized}
      >
        <ChevronIcon />
      </motion.span>
    );

    return (
      <div
        ref={ref}
        data-component="accordion-item"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-expanded={expanded || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.item,
          shapeClasses[shape],
          styles.rest,
          styles.elevation,
          !disabled && styles.hover,
          className,
        )}
        {...rest}
      >
        <button
          type="button"
          id={headerId}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          data-slot="header"
          data-state-layer-opacity={stateLayer}
          onClick={handleToggle}
          onKeyDown={handleKey}
          onKeyUp={() => setPressed(false)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => {
            setHovered(false);
            setPressed(false);
          }}
          onPointerDown={() => {
            if (!disabled) setPressed(true);
          }}
          onPointerUp={() => setPressed(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setPressed(false);
          }}
          className={cn(
            anatomy.header,
            sizes.headerPadding,
            sizes.height,
            disabled && anatomy.headerDisabled,
          )}
        >
          <span
            aria-hidden
            data-slot="state-layer"
            className={cn(anatomy.stateLayer, styles.stateLayer)}
            style={{ opacity: stateLayer }}
          />
          {leadingIcon ? (
            <span
              aria-hidden
              data-slot="leading-icon"
              className={cn(anatomy.leading, sizes.iconSize)}
            >
              {leadingIcon}
            </span>
          ) : null}
          <span data-slot="text" className={anatomy.text}>
            <span data-slot="title" className={anatomy.title}>
              {title}
            </span>
            {subhead ? (
              <span data-slot="subhead" className={anatomy.subhead}>
                {subhead}
              </span>
            ) : null}
          </span>
          <span data-slot="trailing-icon" className={anatomy.trailing}>
            {trailing}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="panel"
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              data-slot="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : tweens.emphasized}
              className={anatomy.panel}
            >
              <div
                data-slot="panel-content"
                className={cn(anatomy.panelContent, sizes.contentPadding)}
              >
                {children}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);
