/**
 * M3 Expressive type scale. Each role maps to a fontSize, lineHeight,
 * letterSpacing, and fontWeight. Surfaced through Tailwind's `fontSize`
 * theme so component code uses `text-display-l`, `text-body-m`, etc.
 */
export type TypeRole =
  | "display-l"
  | "display-m"
  | "display-s"
  | "headline-l"
  | "headline-m"
  | "headline-s"
  | "title-l"
  | "title-m"
  | "title-s"
  | "body-l"
  | "body-m"
  | "body-s"
  | "label-l"
  | "label-m"
  | "label-s";

export interface TypeScaleEntry {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
}

export const typeScale: Record<TypeRole, TypeScaleEntry> = {
  "display-l": { fontSize: "57px", lineHeight: "64px", letterSpacing: "-0.25px", fontWeight: "400" },
  "display-m": { fontSize: "45px", lineHeight: "52px", letterSpacing: "0px", fontWeight: "400" },
  "display-s": { fontSize: "36px", lineHeight: "44px", letterSpacing: "0px", fontWeight: "400" },
  "headline-l": { fontSize: "32px", lineHeight: "40px", letterSpacing: "0px", fontWeight: "400" },
  "headline-m": { fontSize: "28px", lineHeight: "36px", letterSpacing: "0px", fontWeight: "400" },
  "headline-s": { fontSize: "24px", lineHeight: "32px", letterSpacing: "0px", fontWeight: "400" },
  "title-l": { fontSize: "22px", lineHeight: "28px", letterSpacing: "0px", fontWeight: "500" },
  "title-m": { fontSize: "16px", lineHeight: "24px", letterSpacing: "0.15px", fontWeight: "500" },
  "title-s": { fontSize: "14px", lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" },
  "body-l": { fontSize: "16px", lineHeight: "24px", letterSpacing: "0.5px", fontWeight: "400" },
  "body-m": { fontSize: "14px", lineHeight: "20px", letterSpacing: "0.25px", fontWeight: "400" },
  "body-s": { fontSize: "12px", lineHeight: "16px", letterSpacing: "0.4px", fontWeight: "400" },
  "label-l": { fontSize: "14px", lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" },
  "label-m": { fontSize: "12px", lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" },
  "label-s": { fontSize: "11px", lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" },
};

export const tailwindFontSize = Object.fromEntries(
  (Object.entries(typeScale) as [TypeRole, TypeScaleEntry][]).map(
    ([role, entry]) => [
      role,
      [
        entry.fontSize,
        {
          lineHeight: entry.lineHeight,
          letterSpacing: entry.letterSpacing,
          fontWeight: entry.fontWeight,
        },
      ],
    ],
  ),
);
