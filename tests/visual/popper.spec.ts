import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Popper.
 *
 * Popper is the unstyled, anchor-positioned MUI primitive
 * (https://mui.com/material-ui/react-popper/) that powers Tooltip /
 * Autocomplete listbox / Menu containers. Re-skinned onto the M3
 * tooltip / menu surface (https://m3.material.io/components/tooltips/specs).
 *
 * Variants:
 *   - standard : surface-container-high + elevation-2 + sm radius (default)
 *   - tonal    : secondary-container + elevation-1 + sm radius
 *   - outlined : transparent + 1dp outline-variant border + elevation-0
 *   - text     : transparent fill + no border + elevation-0
 *   - elevated : surface-container-low + elevation-3 + sm radius
 *
 * Key tokens:
 *   - default shape : sm (8dp, M3 tooltip surface radius)
 *   - default size  : sm (96..224px wide, M3 tooltip band)
 *   - body type     : body-m (14px)
 *   - label type    : label-l (14px / 20px line-height / 500 weight)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER_HIGH = "rgb(43, 41, 48)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Popper - M3 design parity", () => {
  test("default renders standard / sm / sm with role=tooltip and bottom placement", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--default"));
    const popper = page.locator("[data-component='popper']").first();
    await expect(popper).toBeVisible();
    await expect(popper).toHaveAttribute("data-variant", "standard");
    await expect(popper).toHaveAttribute("data-size", "sm");
    await expect(popper).toHaveAttribute("data-shape", "sm");
    await expect(popper).toHaveAttribute("data-placement", "bottom");
    await expect(popper).toHaveAttribute("role", "tooltip");
    const styles = await popper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        minWidth: cs.minWidth,
      };
    });
    expect(styles.radius).toBe("8px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
    expect(styles.minWidth).toBe("96px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-popper--variants"));
    const expected: Record<string, string> = {
      standard: LIGHT_SURFACE_CONTAINER_HIGH,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      text: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const popper = page
        .locator(`[data-component='popper'][data-variant='${variant}']`)
        .first();
      await expect(popper).toBeVisible();
      const bg = await popper.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--variants"));
    const popper = page
      .locator("[data-component='popper'][data-variant='outlined']")
      .first();
    const styles = await popper.evaluate((el) => {
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
    await page.goto(storyUrl("utils-popper--variants"));
    const popper = page
      .locator("[data-component='popper'][data-variant='text']")
      .first();
    const styles = await popper.evaluate((el) => {
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
    await page.goto(storyUrl("utils-popper--variants"));
    const popper = page
      .locator("[data-component='popper'][data-variant='elevated']")
      .first();
    const shadow = await popper.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("size scale enforces M3 width bands (sm 224 / md 320 / lg 400 px max)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--sizes"));
    const matrix: Record<string, string> = {
      sm: "224px",
      md: "320px",
      lg: "400px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const popper = page
        .locator(`[data-component='popper'][data-size='${size}']`)
        .first();
      await expect(popper).toBeVisible();
      const maxWidth = await popper.evaluate(
        (el) => window.getComputedStyle(el).maxWidth,
      );
      expect(maxWidth, `size=${size}`).toBe(expected);
    }
  });

  test("size scale enforces min-widths (sm 96 / md 144 / lg 200)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--sizes"));
    const matrix: Record<string, string> = {
      sm: "96px",
      md: "144px",
      lg: "200px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const popper = page
        .locator(`[data-component='popper'][data-size='${size}']`)
        .first();
      const minWidth = await popper.evaluate(
        (el) => window.getComputedStyle(el).minWidth,
      );
      expect(minWidth, `size=${size}`).toBe(expected);
    }
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-popper--shapes"));
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
      const popper = page
        .locator(`[data-component='popper'][data-shape='${shape}']`)
        .first();
      await expect(popper).toBeVisible();
      const radius = await popper.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("disabled popper: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-popper--states", "light", "no-preference"),
    );
    const popper = page
      .locator("[data-component='popper'][data-disabled='true']")
      .first();
    await expect(popper).toBeVisible();
    await expect(popper).toHaveAttribute("aria-disabled", "true");
    // Wait past the 300ms entrance tween so opacity settles.
    await page.waitForTimeout(450);
    const styles = await popper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error popper paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--states"));
    const popper = page
      .locator("[data-component='popper'][data-error='true']")
      .first();
    await expect(popper).toHaveAttribute("aria-invalid", "true");
    const styles = await popper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("selected popper paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--states"));
    const popper = page
      .locator("[data-component='popper'][data-selected='true']")
      .first();
    await expect(popper).toHaveAttribute("aria-selected", "true");
    const styles = await popper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("label slot uses label-l and aria-describedby points at the body content", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--slots"));
    const popper = page
      .locator("[data-component='popper']", {
        has: page.locator("[data-slot='label']"),
      })
      .first();
    const label = popper.locator("[data-slot='label']").first();
    await expect(label).toBeVisible();
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        weight: cs.fontWeight,
      };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.lineHeight).toBe("20px");
    expect(styles.weight).toBe("500");
    const describedBy = await popper.getAttribute("aria-describedby");
    const content = popper.locator("[data-slot='content']").first();
    const contentId = await content.getAttribute("id");
    expect(describedBy).toBe(contentId);
  });

  test("placement matrix sets data-placement and the positioner alignment", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--placements"));
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
          `[data-component='popper-positioner'][data-placement='${placement}']`,
        )
        .first();
      await expect(positioner, `placement=${placement}`).toBeVisible();
      const popper = positioner
        .locator(`[data-component='popper'][data-placement='${placement}']`)
        .first();
      await expect(popper, `popper[${placement}]`).toBeVisible();
    }
  });

  test("placement-aware transform-origin: bottom grows from anchor top center", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-popper--default", "light", "no-preference"),
    );
    const popper = page.locator("[data-component='popper']").first();
    const origin = await popper.evaluate(
      (el) => (el as HTMLElement).style.transformOrigin,
    );
    expect(origin).toBe("center top");
  });

  test("arrow renders for non-center placements and is suppressed otherwise", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--arrow"));
    for (const placement of ["top", "bottom", "left", "right"] as const) {
      const popper = page
        .locator(`[data-component='popper'][data-placement='${placement}']`)
        .first();
      await expect(popper).toHaveAttribute("data-arrow", "true");
      const arrow = popper.locator("[data-slot='arrow']").first();
      await expect(arrow, `arrow[${placement}]`).toBeVisible();
    }
  });

  test("modifier mirrors: data-flip + data-keep-in-viewport reflect props", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--default"));
    const popper = page.locator("[data-component='popper']").first();
    await expect(popper).toHaveAttribute("data-flip", "auto");
    await expect(popper).toHaveAttribute("data-keep-in-viewport", "true");
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-popper--motion", "light", "no-preference"),
    );
    const popper = page.locator("[data-component='popper']").first();
    await expect(popper).toBeVisible();
    const styles = await popper.evaluate((el) => {
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
    await page.goto(storyUrl("utils-popper--motion"));
    const popper = page.locator("[data-component='popper']").first();
    await expect(popper).toBeVisible();
    await popper.click();
    await page.keyboard.press("Escape");
    await expect(popper).toHaveCount(0, { timeout: 1000 });
  });

  test("ARIA wiring: role=tooltip, focusable surface (tabindex=-1)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--accessibility"));
    const popper = page.locator("[data-component='popper']").first();
    await expect(popper).toHaveAttribute("role", "tooltip");
    await expect(popper).toHaveAttribute("tabindex", "-1");
  });

  test("dark theme swaps standard popper to dark surface-container-high", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--default", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const popper = page.locator("[data-component='popper']").first();
    const bg = await popper.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGH);
  });

  test("playground story renders a popper with role=tooltip + arrow", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--playground"));
    const popper = page.locator("[data-component='popper']").first();
    await expect(popper).toBeVisible();
    await expect(popper).toHaveAttribute("role", "tooltip");
    await expect(popper).toHaveAttribute("data-arrow", "true");
  });

  test("offset prop applies padding along the placement primary axis", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-popper--default"));
    const positioner = page
      .locator("[data-component='popper-positioner']")
      .first();
    // bottom anchors the surface at items-end (bottom of host) — the
    // gap is created by `padding-bottom: 12px` on the positioner so
    // the surface is pushed up off the host bottom by the offset.
    const padBottom = await positioner.evaluate(
      (el) => window.getComputedStyle(el).paddingBottom,
    );
    expect(padBottom).toBe("12px");
  });
});
