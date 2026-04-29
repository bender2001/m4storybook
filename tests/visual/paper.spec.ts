import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Paper surface primitive. Every
 * assertion reads computed style so a token drift breaks the test.
 *
 * Color roles per variant (light theme):
 *   - elevated  -> surface-container-low + on-surface
 *                  + elevation-1 box-shadow
 *   - filled    -> surface-container-highest + on-surface
 *   - tonal     -> secondary-container + on-secondary-container
 *   - outlined  -> transparent + 1dp outline-variant + on-surface
 *
 * Shape: shape-md (12px) by default.
 * Motion: medium2 (300ms) emphasized easing on shape/elevation/color
 * transitions.
 * Density: padding 8 / 16 / 24 px for sm / md / lg.
 * Interactive: tabindex=0, role=button, state-layer overlay paints at
 * the M3 hover (0.08) opacity on hover.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_SURFACE_CONTAINER_LOW = "rgb(29, 27, 32)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Paper - M3 design parity", () => {
  test("default renders an elevated paper at shape-md (12px)", async ({ page }) => {
    await page.goto(storyUrl("surfaces-paper--default"));
    const paper = page.locator("[data-variant]").first();
    await expect(paper).toBeVisible();
    await expect(paper).toHaveAttribute("data-variant", "elevated");
    await expect(paper).toHaveAttribute("data-shape", "md");
    await expect(paper).toHaveAttribute("data-elevation", "1");
    const radius = await paper.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
  });

  test("elevated variant paints surface-container-low + on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--variants"));
    const paper = page.locator("[data-variant='elevated']").first();
    const styles = await paper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("filled variant paints surface-container-highest + on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--variants"));
    const paper = page.locator("[data-variant='filled']").first();
    const styles = await paper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("tonal variant paints secondary-container + on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--variants"));
    const paper = page.locator("[data-variant='tonal']").first();
    const styles = await paper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined variant has transparent fill + 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--variants"));
    const paper = page.locator("[data-variant='outlined']").first();
    const styles = await paper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderTop: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderTop).toBe("1px");
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant paints elevation-1 box-shadow at rest", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--variants"));
    const paper = page.locator("[data-variant='elevated']").first();
    const shadow = await paper.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    // elevation-1 = "0px 1px 2px 0px rgb(0 0 0 / 0.30), 0px 1px 3px 1px rgb(0 0 0 / 0.15)"
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("elevation prop scales the resting box-shadow", async ({ page }) => {
    await page.goto(storyUrl("surfaces-paper--elevation"));
    const levels = await Promise.all(
      [0, 1, 2, 3, 4, 5].map(async (level) => {
        const paper = page.locator(`[data-elevation='${level}']`).first();
        await expect(paper).toBeVisible();
        return paper.evaluate(
          (el) => window.getComputedStyle(el).boxShadow,
        );
      }),
    );
    // Level 0: Tailwind's composed box-shadow string still renders but
    // every layer is transparent (rgba 0,0,0,0). Levels 1..5 paint
    // visible umbra/penumbra at 0.30 / 0.15 alphas.
    expect(levels[0]).not.toContain("rgba(0, 0, 0, 0.3)");
    expect(levels[0]).not.toContain("rgba(0, 0, 0, 0.15)");
    levels.slice(1).forEach((shadow) => {
      expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
      expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    });
  });

  test("size scale matches M3 density: padding 8 / 16 / 24 px", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--sizes"));
    const paddings = await Promise.all(
      [
        "[data-size='sm']",
        "[data-size='md']",
        "[data-size='lg']",
      ].map(async (sel) => {
        const paper = page.locator(sel).first();
        await expect(paper).toBeVisible();
        return paper.evaluate(
          (el) => window.getComputedStyle(el).paddingTop,
        );
      }),
    );
    expect(paddings).toEqual(["8px", "16px", "24px"]);
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const paper = page.locator(`[data-shape='${shape}']`).first();
      await expect(paper).toBeVisible();
      const radius = await paper.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius).toBe(value);
    }
  });

  test("interactive paper exposes role=button + tabindex=0 + state-layer slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--states"));
    const paper = page.getByRole("button", { name: "Interactive paper" });
    await expect(paper).toBeVisible();
    await expect(paper).toHaveAttribute("data-interactive", "true");
    await expect(paper).toHaveAttribute("tabindex", "0");
    await expect(paper.locator("[data-slot='state-layer']")).toHaveCount(1);
  });

  test("hover paints state layer at M3 0.08 hover opacity", async ({ page }) => {
    await page.goto(
      storyUrl("surfaces-paper--states", "light", "no-preference"),
    );
    const paper = page.getByRole("button", { name: "Interactive paper" });
    await paper.hover();
    // Wait for the state-layer transition (short4 = 200ms) to settle.
    await page.waitForTimeout(280);
    const opacity = await paper.getAttribute("data-state-layer-opacity");
    expect(parseFloat(opacity ?? "0")).toBeCloseTo(0.08, 2);
    const layer = paper.locator("[data-slot='state-layer']");
    const layerOpacity = await layer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(layerOpacity)).toBeCloseTo(0.08, 2);
  });

  test("focus paints state layer at M3 0.10 focus opacity", async ({ page }) => {
    await page.goto(
      storyUrl("surfaces-paper--states", "light", "no-preference"),
    );
    const paper = page.getByRole("button", { name: "Interactive paper" });
    await paper.focus();
    await page.waitForTimeout(280);
    const opacity = await paper.getAttribute("data-state-layer-opacity");
    expect(parseFloat(opacity ?? "0")).toBeCloseTo(0.1, 2);
  });

  test("selected interactive paper sets aria-selected + secondary-container fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--states"));
    const paper = page.getByRole("button", { name: "Selected paper" });
    await expect(paper).toBeVisible();
    await expect(paper).toHaveAttribute("aria-selected", "true");
    const bg = await paper.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("disabled interactive paper sets aria-disabled + opacity 0.38", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--states"));
    const paper = page.getByRole("button", { name: "Disabled paper" });
    await expect(paper).toBeVisible();
    await expect(paper).toHaveAttribute("aria-disabled", "true");
    const opacity = await paper.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("slots render leading icon + label + trailing icon", async ({ page }) => {
    await page.goto(storyUrl("surfaces-paper--slots"));
    const paper = page
      .locator("[data-variant]")
      .filter({ has: page.locator("[data-slot='leading-icon']") })
      .filter({ has: page.locator("[data-slot='trailing-icon']") })
      .first();
    await expect(paper).toBeVisible();
    await expect(paper.locator("[data-slot='leading-icon']")).toHaveCount(1);
    await expect(paper.locator("[data-slot='label']")).toHaveCount(1);
    await expect(paper.locator("[data-slot='trailing-icon']")).toHaveCount(1);
  });

  test("M3 motion: emphasized easing + medium2 duration on shape/elevation transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-paper--default", "light", "no-preference"),
    );
    const paper = page.locator("[data-variant]").first();
    const styles = await paper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("box-shadow");
    expect(styles.property).toContain("background-color");
    expect(styles.duration).toContain("0.3s");
  });

  test("state layer paints standard easing on opacity transition", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-paper--states", "light", "no-preference"),
    );
    const layer = page
      .getByRole("button", { name: "Interactive paper" })
      .locator("[data-slot='state-layer']");
    const styles = await layer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
      };
    });
    expect(styles.property).toContain("opacity");
    expect(styles.timing).toContain(EASE_STANDARD);
  });

  test("dark theme swaps the elevated variant to the dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--variants", "dark"));
    const paper = page.locator("[data-variant='elevated']").first();
    const bg = await paper.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("playground story renders + accepts a runtime label control", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-paper--playground"));
    const paper = page.locator("[data-variant]").first();
    await expect(paper).toBeVisible();
    await expect(paper.locator("[data-slot='label']")).toHaveCount(1);
  });
});
