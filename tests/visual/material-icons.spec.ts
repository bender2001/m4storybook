import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Material Symbols. Every assertion
 * reads computed style so a token drift breaks the test.
 *
 * Variants assert (light theme, glyph color):
 *   - standard      -> transparent + on-surface
 *   - primary       -> transparent + primary
 *   - filled        -> primary-container + on-primary-container
 *   - tonal         -> secondary-container + on-secondary-container
 *   - outlined-box  -> transparent + 1dp outline border + on-surface
 *   - error         -> transparent + error
 *
 * Sizes assert (no label slot):
 *   - sm -> 24px x 24px box, 20px optical-size axis, 20px font-size
 *   - md -> 24px x 24px box, 24px optical-size axis, 24px font-size
 *   - lg -> 48px x 48px box, 40px optical-size axis, 40px font-size
 *
 * States assert:
 *   - selected -> on-secondary-container glyph, aria-pressed=true,
 *                 FILL axis auto-toggles to 1
 *   - disabled -> opacity 0.38 + aria-disabled=true
 *   - error    -> error glyph
 *
 * Style axis asserts the right Material Symbols family is selected
 * for outlined / rounded / sharp.
 *
 * Axes assert FILL + wght data attributes round-trip into the
 * font-variation-settings string.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_ON_PRIMARY_CONTAINER = "rgb(33, 0, 93)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";
const DARK_ON_SURFACE = "rgb(230, 224, 233)";

test.describe("Material Symbols - M3 design parity", () => {
  test("default renders the ligature glyph wrapper with data attrs", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--default"));
    const symbol = page
      .locator('[data-component="material-icon"]')
      .first();
    await expect(symbol).toBeVisible();
    await expect(symbol).toHaveAttribute("data-icon-style", "outlined");
    await expect(symbol).toHaveAttribute("data-name", "favorite");
    await expect(symbol).toHaveAttribute("data-variant", "standard");
    await expect(symbol).toHaveAttribute("data-size", "md");
    await expect(symbol).toHaveAttribute("data-state", "default");
    await expect(symbol).toHaveAttribute("data-fill", "0");
    await expect(symbol).toHaveAttribute("data-weight", "400");
    // labelled story => role=img + aria-label
    await expect(symbol).toHaveAttribute("role", "img");
    await expect(symbol).toHaveAttribute("aria-label", "Favorite");
    // Glyph slot carries the symbol name as text content for ligature.
    const glyph = symbol.locator('[data-slot="glyph"]');
    await expect(glyph).toBeVisible();
    await expect(glyph).toHaveText("favorite");
  });

  test("standard variant renders a transparent container", async ({ page }) => {
    await page.goto(storyUrl("data-display-material-symbols--variants"));
    const symbol = page.getByTestId("variant-standard");
    const styles = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("primary variant paints primary glyph color", async ({ page }) => {
    await page.goto(storyUrl("data-display-material-symbols--variants"));
    const symbol = page.getByTestId("variant-primary");
    const styles = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("filled variant paints primary-container fill + on-primary-container glyph", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--variants"));
    const symbol = page.getByTestId("variant-filled");
    const styles = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: parseFloat(cs.borderTopLeftRadius),
      };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
    // md size => shape-sm = 8dp
    expect(styles.radius).toBe(8);
  });

  test("tonal variant paints secondary-container fill + on-secondary-container glyph", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--variants"));
    const symbol = page.getByTestId("variant-tonal");
    const styles = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined-box variant paints a 1dp outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--variants"));
    const symbol = page.getByTestId("variant-outlined-box");
    const styles = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderTopColor,
        borderWidth: parseFloat(cs.borderTopWidth),
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(styles.borderWidth).toBe(1);
  });

  test("error variant paints the error glyph color", async ({ page }) => {
    await page.goto(storyUrl("data-display-material-symbols--variants"));
    const symbol = page.getByTestId("variant-error");
    const color = await symbol.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("style axis selects the matching Material Symbols family", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--styles"));
    for (const style of ["outlined", "rounded", "sharp"] as const) {
      const symbol = page.getByTestId(`style-${style}`);
      await expect(symbol).toHaveAttribute("data-icon-style", style);
      const fontFamily = await symbol
        .locator('[data-slot="glyph"]')
        .evaluate((el) => window.getComputedStyle(el).fontFamily);
      const expected =
        style === "outlined"
          ? "Material Symbols Outlined"
          : style === "rounded"
            ? "Material Symbols Rounded"
            : "Material Symbols Sharp";
      expect(fontFamily).toContain(expected);
    }
  });

  test("size sm is a 24x24 box with a 20px glyph at opsz 20", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--sizes"));
    const symbol = page.getByTestId("size-sm");
    const dims = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const glyph = el.querySelector('[data-slot="glyph"]') as HTMLElement;
      const gs = window.getComputedStyle(glyph);
      return {
        boxW: parseFloat(cs.width),
        boxH: parseFloat(cs.height),
        glyphFontSize: parseFloat(gs.fontSize),
        variation: gs.fontVariationSettings,
      };
    });
    expect(dims.boxW).toBe(24);
    expect(dims.boxH).toBe(24);
    expect(dims.glyphFontSize).toBe(20);
    expect(dims.variation).toContain('"opsz" 20');
  });

  test("size md is a 24x24 box with a 24px glyph at opsz 24", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--sizes"));
    const symbol = page.getByTestId("size-md");
    const dims = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const glyph = el.querySelector('[data-slot="glyph"]') as HTMLElement;
      const gs = window.getComputedStyle(glyph);
      return {
        boxW: parseFloat(cs.width),
        boxH: parseFloat(cs.height),
        glyphFontSize: parseFloat(gs.fontSize),
        variation: gs.fontVariationSettings,
      };
    });
    expect(dims.boxW).toBe(24);
    expect(dims.boxH).toBe(24);
    expect(dims.glyphFontSize).toBe(24);
    expect(dims.variation).toContain('"opsz" 24');
  });

  test("size lg is a 48x48 box with a 40px glyph at opsz 40 + shape-md radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--sizes"));
    const symbol = page.getByTestId("size-lg");
    const dims = await symbol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const glyph = el.querySelector('[data-slot="glyph"]') as HTMLElement;
      const gs = window.getComputedStyle(glyph);
      return {
        boxW: parseFloat(cs.width),
        boxH: parseFloat(cs.height),
        glyphFontSize: parseFloat(gs.fontSize),
        variation: gs.fontVariationSettings,
        radius: parseFloat(cs.borderTopLeftRadius),
      };
    });
    expect(dims.boxW).toBe(48);
    expect(dims.boxH).toBe(48);
    expect(dims.glyphFontSize).toBe(40);
    expect(dims.variation).toContain('"opsz" 40');
    // lg => shape-md = 12dp
    expect(dims.radius).toBe(12);
  });

  test("selected state paints on-secondary-container glyph + aria-pressed + FILL=1", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--states"));
    const symbol = page.getByTestId("state-selected");
    await expect(symbol).toHaveAttribute("data-state", "selected");
    await expect(symbol).toHaveAttribute("aria-pressed", "true");
    // selected glyphs auto-toggle the FILL axis to 1 per the M3 spec
    await expect(symbol).toHaveAttribute("data-fill", "1");
    const glyphVariation = await symbol
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(glyphVariation).toContain('"FILL" 1');
    const color = await symbol.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("disabled state fades to 0.38 + aria-disabled", async ({ page }) => {
    await page.goto(storyUrl("data-display-material-symbols--states"));
    const symbol = page.getByTestId("state-disabled");
    await expect(symbol).toHaveAttribute("data-state", "disabled");
    await expect(symbol).toHaveAttribute("aria-disabled", "true");
    const opacity = await symbol.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("error state paints the error glyph color", async ({ page }) => {
    await page.goto(storyUrl("data-display-material-symbols--states"));
    const symbol = page.getByTestId("state-error");
    await expect(symbol).toHaveAttribute("data-state", "error");
    const color = await symbol.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("axes: fill + weight round-trip into font-variation-settings", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--axes"));
    const fill0 = page.getByTestId("axis-fill-0");
    const fill1 = page.getByTestId("axis-fill-1");
    await expect(fill0).toHaveAttribute("data-fill", "0");
    await expect(fill1).toHaveAttribute("data-fill", "1");
    const fillVar0 = await fill0
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(fillVar0).toContain('"FILL" 0');
    const fillVar1 = await fill1
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(fillVar1).toContain('"FILL" 1');

    const wght300 = page.getByTestId("axis-weight-300");
    const wght700 = page.getByTestId("axis-weight-700");
    await expect(wght300).toHaveAttribute("data-weight", "300");
    await expect(wght700).toHaveAttribute("data-weight", "700");
    const wghtVar300 = await wght300
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(wghtVar300).toContain('"wght" 300');
    const wghtVar700 = await wght700
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(wghtVar700).toContain('"wght" 700');
  });

  test("slots: leading + trailing label render via data-slot attrs", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--slots"));
    const both = page.getByTestId("slot-both");
    await expect(both.locator('[data-slot="leading-label"]')).toHaveText(
      "Save",
    );
    await expect(both.locator('[data-slot="trailing-label"]')).toHaveText("3");
    await expect(both.locator('[data-slot="glyph"]')).toBeVisible();
    await expect(
      page.getByTestId("slot-leading").locator('[data-slot="leading-label"]'),
    ).toHaveText("Search");
    await expect(
      page.getByTestId("slot-trailing").locator('[data-slot="trailing-label"]'),
    ).toHaveText("Home");
  });

  test("interactive symbol is a labelled, focusable, keyboard-activated affordance", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--accessibility"));
    const symbol = page.getByTestId("a11y-interactive");
    await expect(symbol).toHaveAttribute("role", "img");
    await expect(symbol).toHaveAttribute("aria-label", "Toggle favorite");
    await expect(symbol).toHaveAttribute("tabindex", "0");
    await symbol.focus();
    await expect(symbol).toBeFocused();
  });

  test("decorative symbol is aria-hidden and has no role=img", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--accessibility"));
    const symbol = page.getByTestId("a11y-decorative");
    await expect(symbol).toHaveAttribute("aria-hidden", "true");
    expect(await symbol.getAttribute("role")).toBeNull();
    expect(await symbol.getAttribute("aria-label")).toBeNull();
  });

  test("transition uses the M3 standard easing on color changes", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-material-symbols--default"));
    const symbol = page.locator('[data-component="material-icon"]').first();
    const easing = await symbol.evaluate(
      (el) => window.getComputedStyle(el).transitionTimingFunction,
    );
    expect(easing).toBe(EASE_STANDARD);
  });

  test("dark theme repaints the standard glyph to dark on-surface", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--variants", "dark"),
    );
    const symbol = page.getByTestId("variant-standard");
    const color = await symbol.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(DARK_ON_SURFACE);
  });

  test("playground story honors variant + size + iconStyle args", async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=data-display-material-symbols--playground&viewMode=story&args=variant:tonal;size:lg;iconStyle:rounded&globals=theme:light;reducedMotion:reduce`,
    );
    const symbol = page.locator('[data-component="material-icon"]').first();
    await expect(symbol).toHaveAttribute("data-variant", "tonal");
    await expect(symbol).toHaveAttribute("data-size", "lg");
    await expect(symbol).toHaveAttribute("data-icon-style", "rounded");
  });
});
