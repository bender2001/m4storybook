import { describe, expect, it } from "vitest";
import {
  basicDialogSpec,
  colorMatrix,
  fullscreenDialogSpec,
  fullscreenSurface,
  sizeClasses,
} from "./anatomy";

describe("Dialog M3 specs", () => {
  it("matches the documented basic dialog measurements", () => {
    expect(basicDialogSpec).toEqual({
      containerShape: 28,
      minWidth: 280,
      maxWidth: 560,
      dividerHeight: 1,
      iconSize: 24,
      containerPadding: 24,
      buttonGap: 8,
      titleBodyGap: 16,
      iconTitleGap: 16,
      bodyActionsGap: 24,
    });
  });

  it("keeps every basic density inside the 280..560dp width band", () => {
    for (const spec of Object.values(sizeClasses)) {
      expect(spec.minW).toBe("min-w-[280px]");
      expect(spec.maxW).toBe("max-w-[560px]");
      expect(spec.pad).toBe("p-6");
      expect(spec.iconBox).toBe("h-6 w-6");
    }
  });

  it("matches the documented full-screen dialog surface contract", () => {
    expect(fullscreenDialogSpec).toMatchObject({
      containerShape: 0,
      maxWidth: 560,
      headerHeight: 56,
      closeIconSize: 24,
      bottomActionBarHeight: 56,
      containerPadding: 24,
      elementGap: 8,
      dividerHeight: 1,
    });
    expect(fullscreenSurface).toContain("max-w-[560px]");
    expect(colorMatrix.fullscreen.bg).toBe("bg-surface-container-high");
  });
});
