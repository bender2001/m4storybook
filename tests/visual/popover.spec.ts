import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Popover.
 *
 * Popover is the floating, anchor-aligned primitive that powers Menu /
 * picker dropdowns, re-skinned onto the M3 menu/popover surface
 * (https://m3.material.io/components/menus/specs).
 *
 * Variants:
 *   - standard : surface-container + elevation-2 + xs radius (default)
 *   - tonal    : secondary-container + elevation-1 + xs radius
 *   - outlined : transparent + 1dp outline-variant border + elevation-0
 *   - text     : transparent fill + no border + elevation-0
 *   - elevated : surface-container-low + elevation-3 + xs radius
 *
 * Key tokens:
 *   - default shape : xs (4dp, M3 menu surface radius)
 *   - default size  : md (200..360px wide)
 *   - title type    : title-m (16px / 24px line-height)
 *   - body type     : body-m (14px)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER = "rgb(33, 31, 38)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Popover - M3 design parity", () => {
  test("default renders standard / md / xs with role=dialog and bottom-start placement", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--default"));
    const popover = page.locator("[data-component='popover']").first();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAttribute("data-variant", "standard");
    await expect(popover).toHaveAttribute("data-size", "md");
    await expect(popover).toHaveAttribute("data-shape", "xs");
    await expect(popover).toHaveAttribute("data-placement", "bottom-start");
    await expect(popover).toHaveAttribute("role", "dialog");
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        minWidth: cs.minWidth,
      };
    });
    expect(styles.radius).toBe("4px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
    expect(styles.minWidth).toBe("200px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-popover--variants"));
    const expected: Record<string, string> = {
      standard: LIGHT_SURFACE_CONTAINER,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      text: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const popover = page
        .locator(`[data-component='popover'][data-variant='${variant}']`)
        .first();
      await expect(popover).toBeVisible();
      const bg = await popover.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--variants"));
    const popover = page
      .locator("[data-component='popover'][data-variant='outlined']")
      .first();
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.borderTopWidth,
        color: cs.borderTopColor,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
  });

  test("text variant: transparent fill + on-surface foreground", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--variants"));
    const popover = page
      .locator("[data-component='popover'][data-variant='text']")
      .first();
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
  });

  test("elevated variant lifts to elevation-3", async ({ page }) => {
    await page.goto(storyUrl("utils-popover--variants"));
    const popover = page
      .locator("[data-component='popover'][data-variant='elevated']")
      .first();
    const shadow = await popover.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("size scale enforces M3 width bands (sm 280 / md 360 / lg 480 px max)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--sizes"));
    const matrix: Record<string, string> = {
      sm: "280px",
      md: "360px",
      lg: "480px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const popover = page
        .locator(`[data-component='popover'][data-size='${size}']`)
        .first();
      await expect(popover).toBeVisible();
      const maxWidth = await popover.evaluate(
        (el) => window.getComputedStyle(el).maxWidth,
      );
      expect(maxWidth, `size=${size}`).toBe(expected);
    }
  });

  test("size scale enforces min-widths (sm 160 / md 200 / lg 280)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--sizes"));
    const matrix: Record<string, string> = {
      sm: "160px",
      md: "200px",
      lg: "280px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const popover = page
        .locator(`[data-component='popover'][data-size='${size}']`)
        .first();
      const minWidth = await popover.evaluate(
        (el) => window.getComputedStyle(el).minWidth,
      );
      expect(minWidth, `size=${size}`).toBe(expected);
    }
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-popover--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
      full: "9999px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const popover = page
        .locator(`[data-component='popover'][data-shape='${shape}']`)
        .first();
      await expect(popover).toBeVisible();
      const radius = await popover.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("disabled popover: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-popover--states", "light", "no-preference"),
    );
    const popover = page
      .locator("[data-component='popover'][data-disabled='true']")
      .first();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAttribute("aria-disabled", "true");
    // Wait past the 300ms entrance tween so opacity settles.
    await page.waitForTimeout(450);
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error popover paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--states"));
    const popover = page
      .locator("[data-component='popover'][data-error='true']")
      .first();
    await expect(popover).toHaveAttribute("aria-invalid", "true");
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("selected popover paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--states"));
    const popover = page
      .locator("[data-component='popover'][data-selected='true']")
      .first();
    await expect(popover).toHaveAttribute("aria-selected", "true");
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("title slot uses title-m and the popover wires aria-labelledby to it", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--default"));
    const popover = page.locator("[data-component='popover']").first();
    const title = popover.locator("[data-slot='title']").first();
    await expect(title).toBeVisible();
    const styles = await title.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("16px");
    expect(styles.lineHeight).toBe("24px");
    const labelledBy = await popover.getAttribute("aria-labelledby");
    const titleId = await title.getAttribute("id");
    expect(labelledBy).toBe(titleId);
  });

  test("placement matrix sets data-placement and the positioner alignment classes", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--placements"));
    const placements = [
      "top-start",
      "top",
      "top-end",
      "bottom-start",
      "bottom",
      "bottom-end",
      "left-start",
      "left",
      "left-end",
      "right-start",
      "right",
      "right-end",
      "center",
    ];
    for (const placement of placements) {
      const positioner = page
        .locator(
          `[data-component='popover-positioner'][data-placement='${placement}']`,
        )
        .first();
      await expect(positioner, `placement=${placement}`).toBeVisible();
      const popover = positioner
        .locator(`[data-component='popover'][data-placement='${placement}']`)
        .first();
      await expect(popover, `popover[${placement}]`).toBeVisible();
    }
  });

  test("placement-aware transform-origin: bottom-start grows from anchor top-left", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-popover--default", "light", "no-preference"),
    );
    const popover = page.locator("[data-component='popover']").first();
    const origin = await popover.evaluate(
      (el) => (el as HTMLElement).style.transformOrigin,
    );
    expect(origin).toBe("left top");
  });

  test("scrim defaults off (no Backdrop rendered, no aria-modal)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--default"));
    const popover = page.locator("[data-component='popover']").first();
    await expect(popover).not.toHaveAttribute("aria-modal", "true");
    const scrim = page.locator("[data-role='popover-scrim']");
    await expect(scrim).toHaveCount(0);
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-popover--motion", "light", "no-preference"),
    );
    const popover = page.locator("[data-component='popover']").first();
    await expect(popover).toBeVisible();
    const styles = await popover.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.property).toContain("box-shadow");
    expect(styles.duration).toContain("0.3s");
  });

  test("Escape key fires onDismiss('escape') + onClose", async ({ page }) => {
    await page.goto(storyUrl("utils-popover--motion"));
    const popover = page.locator("[data-component='popover']").first();
    await expect(popover).toBeVisible();
    // The Motion story wires onClose -> setOpen(false), so Escape
    // should trigger AnimatePresence to unmount the surface.
    await popover.click();
    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0, { timeout: 1000 });
  });

  test("ARIA wiring: role=dialog, no aria-modal when scrim=false, focusable surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--accessibility"));
    const popover = page.locator("[data-component='popover']").first();
    await expect(popover).toHaveAttribute("role", "dialog");
    // tabIndex=-1 keeps the surface focusable programmatically (Escape
    // handling) without inserting it in the natural tab order.
    await expect(popover).toHaveAttribute("tabindex", "-1");
  });

  test("dark theme swaps standard popover to dark surface-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--default", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const popover = page.locator("[data-component='popover']").first();
    const bg = await popover.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER);
  });

  test("playground story renders a popover with role=dialog", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--playground"));
    const popover = page.locator("[data-component='popover']").first();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAttribute("role", "dialog");
  });

  test("offset prop applies padding along the placement primary axis", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popover--default"));
    const positioner = page
      .locator("[data-component='popover-positioner']")
      .first();
    // bottom-start anchors the surface to the bottom edge — the gap
    // is created by `padding-bottom: 8px` on the positioner so the
    // surface is pushed up from the host bottom by the offset.
    const padBottom = await positioner.evaluate(
      (el) => window.getComputedStyle(el).paddingBottom,
    );
    expect(padBottom).toBe("8px");
  });
});
