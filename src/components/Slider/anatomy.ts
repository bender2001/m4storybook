import type { SliderSize } from "./types";

export const anatomy = {
  root: "relative inline-flex w-full flex-col gap-2 font-sans select-none",
  header: "flex items-center justify-between gap-3",
  label: "text-label-l text-on-surface-variant",
  field: "relative flex w-full items-center gap-3",
  leadingIcon:
    "inline-flex h-11 w-11 shrink-0 items-center justify-center text-on-surface-variant",
  trailingIcon:
    "inline-flex h-11 w-11 shrink-0 items-center justify-center text-on-surface-variant",
  trackWrapper:
    "relative flex flex-1 items-center cursor-pointer touch-none select-none",
  track: "absolute top-1/2 -translate-y-1/2 transition-[left,width,height,background-color,opacity] duration-short4 ease-standard",
  stop:
    "absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-shape-full",
  handle: [
    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full outline-none focus-visible:ring-0",
    "transition-[width,height,background-color,opacity] duration-short4 ease-emphasized",
  ].join(" "),
  handleStateLayer: [
    "pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full bg-primary transition-opacity duration-short4 ease-standard",
  ].join(" "),
  valueIndicator: [
    "pointer-events-none absolute z-10 flex h-11 min-w-12 -translate-x-1/2 items-center justify-center",
    "rounded-shape-full bg-inverse-surface px-3 text-[14px] font-normal leading-5 tracking-[0.5px]",
    "text-inverse-on-surface shadow-elevation-2 tabular-nums",
  ].join(" "),
  nativeInput: [
    "absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0",
    "appearance-none focus:outline-none focus-visible:outline-none",
    "disabled:cursor-not-allowed",
  ].join(" "),
  helperText: "px-1 text-body-s text-on-surface-variant",
} as const;

interface SizeSpec {
  fieldClass: string;
  trackHeight: number;
  trackRadius: number;
  handleHeight: number;
  handleWidth: number;
  activeHandleWidth: number;
  handleGap: number;
}

export const sizeSpec: Record<SliderSize, SizeSpec> = {
  xs: {
    fieldClass: "h-11",
    trackHeight: 16,
    trackRadius: 8,
    handleHeight: 44,
    handleWidth: 4,
    activeHandleWidth: 2,
    handleGap: 6,
  },
  s: {
    fieldClass: "h-11",
    trackHeight: 24,
    trackRadius: 8,
    handleHeight: 44,
    handleWidth: 4,
    activeHandleWidth: 2,
    handleGap: 6,
  },
  m: {
    fieldClass: "h-[52px]",
    trackHeight: 40,
    trackRadius: 12,
    handleHeight: 52,
    handleWidth: 4,
    activeHandleWidth: 2,
    handleGap: 6,
  },
  l: {
    fieldClass: "h-[68px]",
    trackHeight: 56,
    trackRadius: 16,
    handleHeight: 68,
    handleWidth: 4,
    activeHandleWidth: 2,
    handleGap: 6,
  },
  xl: {
    fieldClass: "h-[108px]",
    trackHeight: 96,
    trackRadius: 28,
    handleHeight: 108,
    handleWidth: 4,
    activeHandleWidth: 2,
    handleGap: 6,
  },
};
