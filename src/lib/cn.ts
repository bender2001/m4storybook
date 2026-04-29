/**
 * Lightweight class-name composer. Filters out falsy values and joins
 * with spaces. Avoids pulling in clsx/twMerge for this small surface.
 */
export type ClassValue = string | number | null | false | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
