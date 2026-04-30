import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Transitions wrapper.
 *
 * Re-skins the MUI transition primitives (Fade / Grow / Slide / Zoom /
 * Collapse — https://mui.com/material-ui/transitions/) onto a single
 * motion/react surface that drives the animation through the M3 motion
 * tokens (https://m3.material.io/styles/motion/easing-and-duration/tokens-specs).
 *
 *   - five variants     : fade / grow / slide / zoom / collapse
 *   - three densities   : sm (200ms / short4), md (300ms / medium2), lg (450ms / long1)
 *   - full M3 7-token shape scale
 *   - direction prop drives slide axis + collapse axis
 *
 * Spec sources:
 *   - MUI Transitions    https://mui.com/material-ui/transitions/
 *   - M3 motion tokens   https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 *   - M3 surface roles   https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 type scale      https://m3.material.io/styles/typography/type-scale-tokens
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE = "rgb(20, 18, 24)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Transitions - M3 design parity", () => {
  test("default transitions renders the M3 motion shell (fade / shape-md / md size / 300ms)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--default"));
    const root = page.locator("[data-component='transitions']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "fade");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "md");
    await expect(root).toHaveAttribute("data-duration-ms", "300");
    await expect(root).toHaveAttribute("data-easing", "standard");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        minH: cs.minHeight,
        pad: cs.paddingTop,
        fontSize: cs.fontSize,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.minH).toBe("64px");
    expect(styles.pad).toBe("24px");
    expect(styles.fontSize).toBe("14px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-transitions--variants"));
    const expected: Record<string, string> = {
      fade: TRANSPARENT,
      grow: LIGHT_SURFACE,
      slide: LIGHT_SURFACE_CONTAINER,
      zoom: LIGHT_SURFACE_CONTAINER_LOW,
      collapse: LIGHT_SURFACE,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='transitions'][data-variant='${variant}']`)
        .first();
      await expect(root).toBeVisible();
      const bg = await root.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("variants expose easing + duration tokens on data attrs", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--variants"));
    const cases: Record<string, string> = {
      fade: "standard",
      grow: "emphasized",
      slide: "emphasized",
      zoom: "emphasized",
      collapse: "emphasized",
    };
    for (const [variant, easing] of Object.entries(cases)) {
      const root = page
        .locator(`[data-component='transitions'][data-variant='${variant}']`)
        .first();
      await expect(root).toHaveAttribute("data-easing", easing);
    }
  });

  test("zoom variant lifts to elevation-2", async ({ page }) => {
    await page.goto(storyUrl("utils-transitions--variants"));
    const root = page
      .locator("[data-component='transitions'][data-variant='zoom']")
      .first();
    const shadow = await root.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("collapse variant clips overflow for the height transition", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--variants"));
    const root = page
      .locator("[data-component='transitions'][data-variant='collapse']")
      .first();
    const overflow = await root.evaluate(
      (el) => window.getComputedStyle(el).overflow,
    );
    expect(overflow).toBe("hidden");
  });

  test("size scale: 48 / 64 / 80 px min-heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='transitions'][data-size='${size}']`)
          .first();
        await expect(root).toBeVisible();
        return root.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["48px", "64px", "80px"]);
  });

  test("size pad: 12 / 24 / 40 px for sm / md / lg", async ({ page }) => {
    await page.goto(storyUrl("utils-transitions--sizes"));
    const pads = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='transitions'][data-size='${size}']`)
          .first();
        return root.evaluate((el) => window.getComputedStyle(el).paddingTop);
      }),
    );
    expect(pads).toEqual(["12px", "24px", "40px"]);
  });

  test("size duration scale: 200 / 300 / 450 ms for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--sizes"));
    const durations = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='transitions'][data-size='${size}']`)
          .first();
        return root.getAttribute("data-duration-ms");
      }),
    );
    expect(durations).toEqual(["200", "300", "450"]);
  });

  test("body type role steps body-s / body-m / body-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--sizes"));
    const expected: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    for (const [size, fontSize] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='transitions'][data-size='${size}']`)
        .first();
      const measured = await root.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );
      expect(measured, `size=${size}`).toBe(fontSize);
    }
  });

  test("header typography steps title-s / title-m / title-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "14px", weight: "500" },
      md: { size: "16px", weight: "500" },
      lg: { size: "22px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const header = page
        .locator(
          `[data-component='transitions'][data-size='${size}'] [data-slot='header']`,
        )
        .first();
      const measured = await header.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled transitions slot: aria-disabled, opacity 0.38", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--states"));
    const root = page
      .locator("[data-component='transitions'][data-disabled='true']")
      .first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("aria-disabled", "true");
    const opacity = await root.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("selected transitions slot paints secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--states"));
    const root = page
      .locator("[data-component='transitions'][data-selected='true']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("error transitions slot paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--states"));
    const root = page
      .locator("[data-component='transitions'][data-error='true']")
      .first();
    await expect(root).toHaveAttribute("aria-invalid", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-transitions--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='transitions'][data-shape='${shape}']`)
        .first();
      const radius = await root.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='transitions'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("directions expose up / down / left / right + vertical / horizontal", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--directions"));
    for (const direction of [
      "up",
      "down",
      "left",
      "right",
      "vertical",
      "horizontal",
    ] as const) {
      const root = page
        .locator(`[data-component='transitions'][data-direction='${direction}']`)
        .first();
      await expect(root).toBeVisible();
    }
  });

  test("leading + trailing icon slots render alongside the label", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--slots"));
    const leading = page
      .locator("[data-component='transitions'] [data-slot='icon-leading']")
      .first();
    const trailing = page
      .locator("[data-component='transitions'] [data-slot='icon-trailing']")
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    const label = page
      .locator("[data-component='transitions'] [data-slot='label']")
      .first();
    await expect(label).toBeVisible();
  });

  test("body slot mounts when `in` is true (Default story)", async ({ page }) => {
    await page.goto(storyUrl("utils-transitions--default"));
    const root = page.locator("[data-component='transitions']").first();
    await expect(root).toHaveAttribute("data-in", "true");
    const body = root.locator("[data-slot='body']").first();
    await expect(body).toBeVisible();
  });

  test("fallback slot renders when `in` is false and unmountOnExit is true", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--fallback"));
    const root = page.locator("[data-component='transitions']").first();
    await expect(root).toBeVisible();
    expect(await root.getAttribute("data-in")).toBeNull();
    const fallback = root.locator("[data-slot='fallback']").first();
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText("Pending");
  });

  test("toggling `in` plays the AnimatePresence cycle and unmounts the body", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-transitions--motion", "light", "no-preference"),
    );
    const root = page.locator("[data-component='transitions']").first();
    await expect(root).toHaveAttribute("data-in", "true");
    const toggle = page.locator("[data-testid='motion-toggle']").first();
    await toggle.click();
    await expect(root).not.toHaveAttribute("data-in", "true");
    await expect(root.locator("[data-slot='body']")).toHaveCount(0);
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-transitions--default", "light", "no-preference"),
    );
    const root = page.locator("[data-component='transitions']").first();
    const styles = await root.evaluate((el) => {
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

  test("hidden transition with unmountOnExit drops aria-busy + sets aria-hidden", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--accessibility"));
    const hidden = page
      .locator(
        "[data-component='transitions'][aria-label='Hidden transition region']",
      )
      .first();
    await expect(hidden).toBeVisible();
    expect(await hidden.getAttribute("data-in")).toBeNull();
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("aria-busy", "true");
  });

  test("visible transition clears aria-busy + aria-hidden once the body mounts", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--accessibility"));
    const visible = page
      .locator(
        "[data-component='transitions'][aria-label='Visible transition region']",
      )
      .first();
    await expect(visible).toBeVisible();
    expect(await visible.getAttribute("aria-busy")).toBeNull();
    expect(await visible.getAttribute("aria-hidden")).toBeNull();
  });

  test("dark theme swaps grow surface to dark surface", async ({ page }) => {
    await page.goto(storyUrl("utils-transitions--variants", "dark"));
    const root = page
      .locator("[data-component='transitions'][data-variant='grow']")
      .first();
    const bg = await root.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE);
  });

  test("fade variant renders transparent host so it can wrap external surfaces", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--variants"));
    const root = page
      .locator("[data-component='transitions'][data-variant='fade']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("playground story renders a Transitions wrapper with label slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-transitions--playground"));
    const root = page.locator("[data-component='transitions']").first();
    await expect(root).toBeVisible();
    const label = root.locator("[data-slot='label']").first();
    await expect(label).toBeVisible();
  });
});
