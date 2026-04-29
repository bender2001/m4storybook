import { forwardRef, useCallback, useId, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { stateLayerOpacity } from "@/tokens/motion";
import { Checkbox } from "@/components/Checkbox";
import { anatomy, sizeSpec, variantClasses } from "./anatomy";
import type { TransferListItem, TransferListProps } from "./types";

export type {
  TransferListItem,
  TransferListProps,
  TransferListSize,
  TransferListVariant,
} from "./types";

type Side = "source" | "target";

const ChevronRight = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
    <path d="M7 5l5 5-5 5V5z" />
  </svg>
);
const ChevronLeft = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
    <path d="M13 5l-5 5 5 5V5z" />
  </svg>
);
const ChevronDoubleRight = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
    <path d="M4 5l5 5-5 5V5zm6 0l5 5-5 5V5z" />
  </svg>
);
const ChevronDoubleLeft = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
    <path d="M10 5l-5 5 5 5V5zm6 0l-5 5 5 5V5z" />
  </svg>
);

interface ColumnProps {
  rootId: string;
  side: Side;
  label: string;
  items: TransferListItem[];
  selected: Set<string>;
  toggle: (id: string) => void;
  toggleAll: () => void;
  variant: TransferListProps["variant"];
  size: NonNullable<TransferListProps["size"]>;
  disabled: boolean;
}

function Column({
  rootId,
  side,
  label,
  items,
  selected,
  toggle,
  toggleAll,
  variant,
  size,
  disabled,
}: ColumnProps) {
  const sz = sizeSpec[size];
  const variantStyles = variantClasses[variant ?? "filled"];
  const headerId = `${rootId}-${side}-header`;
  const listId = `${rootId}-${side}-list`;

  const enabledIds = items.filter((it) => !it.disabled).map((it) => it.id);
  const enabledSelectedCount = enabledIds.filter((id) => selected.has(id)).length;
  const allChecked: boolean | "indeterminate" =
    enabledIds.length > 0 && enabledSelectedCount === enabledIds.length
      ? true
      : enabledSelectedCount === 0
        ? false
        : "indeterminate";

  return (
    <div
      data-transferlist-card
      data-side={side}
      data-variant={variant}
      data-size={size}
      className={cn(anatomy.card, sz.cardHeight, variantStyles.card)}
    >
      <div className={anatomy.cardHeader} data-transferlist-header id={headerId}>
        <div className="flex min-w-0 items-center gap-3">
          <Checkbox
            size="sm"
            checked={allChecked}
            onChange={toggleAll}
            disabled={disabled || enabledIds.length === 0}
            aria-label={`Select all ${label}`}
            data-transferlist-select-all
          />
          <span className={anatomy.cardTitle} data-transferlist-title>
            {label}
          </span>
        </div>
        <span
          className={anatomy.cardCount}
          data-transferlist-count
        >{`${enabledSelectedCount}/${items.length}`}</span>
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        aria-labelledby={headerId}
        className={anatomy.list}
        data-transferlist-list
        data-side={side}
      >
        {items.map((item) => (
          <Row
            key={item.id}
            item={item}
            checked={selected.has(item.id)}
            disabled={disabled || item.disabled === true}
            size={size}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </ul>
    </div>
  );
}

interface RowProps {
  item: TransferListItem;
  checked: boolean;
  disabled: boolean;
  size: NonNullable<TransferListProps["size"]>;
  onToggle: () => void;
}

function Row({ item, checked, disabled, size, onToggle }: RowProps) {
  const sz = sizeSpec[size];
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

  const handleKey = (event: KeyboardEvent<HTMLLIElement>) => {
    if (disabled) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <li
      role="option"
      tabIndex={disabled ? -1 : 0}
      aria-selected={checked}
      aria-disabled={disabled || undefined}
      data-transferlist-row
      data-id={item.id}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
      data-hovered={hovered || undefined}
      data-focused={focused || undefined}
      data-pressed={pressed || undefined}
      className={cn(
        anatomy.row,
        sz.rowHeight,
        disabled && "pointer-events-none opacity-[0.38]",
      )}
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
      onClick={onToggle}
      onKeyDown={handleKey}
    >
      <span
        aria-hidden
        data-transferlist-row-state-layer
        className={anatomy.rowStateLayer}
        style={{ opacity: stateLayer }}
      />
      <span className={anatomy.checkboxSlot} data-transferlist-row-check>
        <Checkbox
          size="sm"
          checked={checked}
          onChange={() => undefined}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          data-transferlist-row-checkbox
        />
      </span>
      <span className={anatomy.rowText}>
        <span className={cn("text-on-surface truncate", sz.rowLabelType)} data-transferlist-row-label>
          {item.label}
        </span>
        {item.description ? (
          <span className={anatomy.rowDescription} data-transferlist-row-description>
            {item.description}
          </span>
        ) : null}
      </span>
    </li>
  );
}

interface ArrowButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  testid: string;
  children: React.ReactNode;
}

function ArrowButton({
  label,
  onClick,
  disabled,
  testid,
  children,
}: ArrowButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-transferlist-arrow={testid}
      onClick={onClick}
      className={anatomy.arrowButton}
    >
      <span className={anatomy.arrowIcon} aria-hidden>
        {children}
      </span>
    </button>
  );
}

/**
 * M3 Transfer List — MUI fallback re-skinned with M3 tokens. Two M3
 * surface-container-low cards (left = source, right = target) with a
 * center action rail of 4 M3 Icon Buttons that move items between
 * columns. Each row pairs a 24dp M3 Checkbox with a label + optional
 * description; rows paint the M3 state-layer at hover 0.08, focus
 * 0.10, pressed 0.10. Filled (default) cards paint
 * surface-container-low; outlined cards are transparent with a 1dp
 * outline-variant border.
 *
 * Spec: no native M3 Expressive Transfer List, so this matches the
 * MUI reference behavior model with M3 tokens for surface, shape,
 * type, motion and elevation.
 */
export const TransferList = forwardRef<HTMLDivElement, TransferListProps>(
  function TransferList(
    {
      source,
      target,
      onChange,
      variant = "filled",
      size = "md",
      sourceLabel = "Choices",
      targetLabel = "Chosen",
      disabled = false,
      className,
      "aria-label": ariaLabel = "Transfer list",
      helperText,
    },
    ref,
  ) {
    const reactId = useId();
    const rootId = `transferlist-${reactId}`;

    const [sourceSelected, setSourceSelected] = useState<Set<string>>(
      () => new Set(),
    );
    const [targetSelected, setTargetSelected] = useState<Set<string>>(
      () => new Set(),
    );

    const sourceMap = useMemo(
      () => new Map(source.map((item) => [item.id, item])),
      [source],
    );
    const targetMap = useMemo(
      () => new Map(target.map((item) => [item.id, item])),
      [target],
    );

    const toggleInSet = (set: Set<string>, id: string): Set<string> => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    };

    const toggleSource = useCallback((id: string) => {
      const item = sourceMap.get(id);
      if (item?.disabled) return;
      setSourceSelected((prev) => toggleInSet(prev, id));
    }, [sourceMap]);

    const toggleTarget = useCallback((id: string) => {
      const item = targetMap.get(id);
      if (item?.disabled) return;
      setTargetSelected((prev) => toggleInSet(prev, id));
    }, [targetMap]);

    const toggleAllSource = useCallback(() => {
      const enabled = source.filter((it) => !it.disabled).map((it) => it.id);
      const allSelected = enabled.every((id) => sourceSelected.has(id));
      setSourceSelected(allSelected ? new Set() : new Set(enabled));
    }, [source, sourceSelected]);

    const toggleAllTarget = useCallback(() => {
      const enabled = target.filter((it) => !it.disabled).map((it) => it.id);
      const allSelected = enabled.every((id) => targetSelected.has(id));
      setTargetSelected(allSelected ? new Set() : new Set(enabled));
    }, [target, targetSelected]);

    const moveSelectedToTarget = useCallback(() => {
      if (sourceSelected.size === 0) return;
      const moving = source.filter(
        (it) => sourceSelected.has(it.id) && !it.disabled,
      );
      if (moving.length === 0) return;
      const movingIds = new Set(moving.map((it) => it.id));
      const nextSource = source.filter((it) => !movingIds.has(it.id));
      const nextTarget = [...target, ...moving];
      setSourceSelected(new Set());
      onChange?.({ source: nextSource, target: nextTarget });
    }, [source, target, sourceSelected, onChange]);

    const moveSelectedToSource = useCallback(() => {
      if (targetSelected.size === 0) return;
      const moving = target.filter(
        (it) => targetSelected.has(it.id) && !it.disabled,
      );
      if (moving.length === 0) return;
      const movingIds = new Set(moving.map((it) => it.id));
      const nextTarget = target.filter((it) => !movingIds.has(it.id));
      const nextSource = [...source, ...moving];
      setTargetSelected(new Set());
      onChange?.({ source: nextSource, target: nextTarget });
    }, [source, target, targetSelected, onChange]);

    const moveAllToTarget = useCallback(() => {
      const moving = source.filter((it) => !it.disabled);
      if (moving.length === 0) return;
      const movingIds = new Set(moving.map((it) => it.id));
      const nextSource = source.filter((it) => !movingIds.has(it.id));
      const nextTarget = [...target, ...moving];
      setSourceSelected(new Set());
      onChange?.({ source: nextSource, target: nextTarget });
    }, [source, target, onChange]);

    const moveAllToSource = useCallback(() => {
      const moving = target.filter((it) => !it.disabled);
      if (moving.length === 0) return;
      const movingIds = new Set(moving.map((it) => it.id));
      const nextTarget = target.filter((it) => !movingIds.has(it.id));
      const nextSource = [...source, ...moving];
      setTargetSelected(new Set());
      onChange?.({ source: nextSource, target: nextTarget });
    }, [source, target, onChange]);

    const sourceEnabled = source.filter((it) => !it.disabled);
    const targetEnabled = target.filter((it) => !it.disabled);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        data-transferlist-root
        data-variant={variant}
        data-size={size}
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          disabled && "pointer-events-none opacity-[0.38]",
          className,
        )}
      >
        <div className={anatomy.grid} data-transferlist-grid>
          <Column
            rootId={rootId}
            side="source"
            label={sourceLabel}
            items={source}
            selected={sourceSelected}
            toggle={toggleSource}
            toggleAll={toggleAllSource}
            variant={variant}
            size={size}
            disabled={disabled}
          />
          <div className={anatomy.rail} data-transferlist-rail>
            <ArrowButton
              label="Move all to target"
              testid="all-right"
              onClick={moveAllToTarget}
              disabled={disabled || sourceEnabled.length === 0}
            >
              <ChevronDoubleRight />
            </ArrowButton>
            <ArrowButton
              label="Move selected to target"
              testid="right"
              onClick={moveSelectedToTarget}
              disabled={disabled || sourceSelected.size === 0}
            >
              <ChevronRight />
            </ArrowButton>
            <ArrowButton
              label="Move selected to source"
              testid="left"
              onClick={moveSelectedToSource}
              disabled={disabled || targetSelected.size === 0}
            >
              <ChevronLeft />
            </ArrowButton>
            <ArrowButton
              label="Move all to source"
              testid="all-left"
              onClick={moveAllToSource}
              disabled={disabled || targetEnabled.length === 0}
            >
              <ChevronDoubleLeft />
            </ArrowButton>
          </div>
          <Column
            rootId={rootId}
            side="target"
            label={targetLabel}
            items={target}
            selected={targetSelected}
            toggle={toggleTarget}
            toggleAll={toggleAllTarget}
            variant={variant}
            size={size}
            disabled={disabled}
          />
        </div>
        {helperText ? (
          <p data-transferlist-helper className={anatomy.helperText}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
