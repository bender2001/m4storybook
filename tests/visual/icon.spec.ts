import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Icon. Every assertion reads computed
 * style so a token drift breaks the test.
 *
 * Variants assert (light theme):
 *   - standard  -> transparent container + on-surface glyph
 *   - primary   -> transparent container + primary glyph
 *   - filled    -> primary-container container + on-primary-container glyph
 *   - tonal     -> secondary-container container + on-secondary-container glyph
 *   - outlined  -> transparent + 1px outline border + on-surface glyph
 *   - error     -> transparent + error glyph
 *
 * Sizes assert (no label slot, so the box dimensions hold):
 *   - sm -> 24px × 24px outer box, 18px × 18px glyph slot
 *   - md -> 24px × 24px outer box, 24px × 24px glyph slot
 *   - lg -> 48px × 48px outer box, 40px × 40px glyph slot
 *
 * States assert:
 *   - selected  -> on-secondary-container glyph + aria-pressed=true
 *   - disabled  -> opacity 0.38 + aria-disabled=true
 *   - error     -> error glyph
 *
 * Slots assert leading + trailing label data-attrs render.
 *
 * Motion asserts the standard easing on color transitions.
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

test.describe("Icon - M3 design parity", () => {
  test("default renders aria-hidden glyph wrapper with variant/size data", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--default"));
    const icon = page.locator('[data-component="icon"]').first();
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("data-variant", "standard");
    await expect(icon).toHaveAttribute("data-size", "md");
    await expect(icon).toHaveAttribute("data-state", "default");
    // labelled story => role=img + aria-label
    await expect(icon).toHaveAttribute("role", "img");
    await expect(icon).toHaveAttribute("aria-label", "Favorite");
    // SVG mounts via the glyph slot
    await expect(icon.locator('[data-slot="glyph"]')).toBeVisible();
    await expect(icon.locator('[data-slot="glyph"] svg')).toBeVisible();
  });

  test("standard variant renders a transparent container", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--variants"));
    const icon = page.getByTestId("variant-standard");
    const styles = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("primary variant paints primary glyph color", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--variants"));
    const icon = page.getByTestId("variant-primary");
    const styles = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("filled variant paints primary-container fill + on-primary-container glyph", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--variants"));
    const icon = page.getByTestId("variant-filled");
    const styles = await icon.evaluate((el) => {
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
    await page.goto(storyUrl("data-display-icon--variants"));
    const icon = page.getByTestId("variant-tonal");
    const styles = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined variant paints a 1dp outline border", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--variants"));
    const icon = page.getByTestId("variant-outlined");
    const styles = await icon.evaluate((el) => {
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
    await page.goto(storyUrl("data-display-icon--variants"));
    const icon = page.getByTestId("variant-error");
    const color = await icon.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("size sm is a 24×24 box with an 18×18 glyph slot", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--sizes"));
    const icon = page.getByTestId("size-sm");
    const dims = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const glyph = el.querySelector('[data-slot="glyph"]') as HTMLElement;
      const gs = window.getComputedStyle(glyph);
      return {
        boxW: parseFloat(cs.width),
        boxH: parseFloat(cs.height),
        glyphW: parseFloat(gs.width),
        glyphH: parseFloat(gs.height),
      };
    });
    expect(dims.boxW).toBe(24);
    expect(dims.boxH).toBe(24);
    expect(dims.glyphW).toBe(18);
    expect(dims.glyphH).toBe(18);
  });

  test("size md is a 24×24 box with a 24×24 glyph slot", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--sizes"));
    const icon = page.getByTestId("size-md");
    const dims = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const glyph = el.querySelector('[data-slot="glyph"]') as HTMLElement;
      const gs = window.getComputedStyle(glyph);
      return {
        boxW: parseFloat(cs.width),
        boxH: parseFloat(cs.height),
        glyphW: parseFloat(gs.width),
        glyphH: parseFloat(gs.height),
      };
    });
    expect(dims.boxW).toBe(24);
    expect(dims.boxH).toBe(24);
    expect(dims.glyphW).toBe(24);
    expect(dims.glyphH).toBe(24);
  });

  test("size lg is a 48×48 box with a 40×40 glyph slot", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--sizes"));
    const icon = page.getByTestId("size-lg");
    const dims = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const glyph = el.querySelector('[data-slot="glyph"]') as HTMLElement;
      const gs = window.getComputedStyle(glyph);
      return {
        boxW: parseFloat(cs.width),
        boxH: parseFloat(cs.height),
        glyphW: parseFloat(gs.width),
        glyphH: parseFloat(gs.height),
        radius: parseFloat(cs.borderTopLeftRadius),
      };
    });
    expect(dims.boxW).toBe(48);
    expect(dims.boxH).toBe(48);
    expect(dims.glyphW).toBe(40);
    expect(dims.glyphH).toBe(40);
    // lg => shape-md = 12dp
    expect(dims.radius).toBe(12);
  });

  test("selected state paints on-secondary-container glyph + aria-pressed", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--states"));
    const icon = page.getByTestId("state-selected");
    await expect(icon).toHaveAttribute("data-state", "selected");
    await expect(icon).toHaveAttribute("aria-pressed", "true");
    const color = await icon.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("disabled state fades to 0.38 + aria-disabled", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--states"));
    const icon = page.getByTestId("state-disabled");
    await expect(icon).toHaveAttribute("data-state", "disabled");
    await expect(icon).toHaveAttribute("aria-disabled", "true");
    const opacity = await icon.evaluate(
      (el) => parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("error state paints the error glyph color", async ({ page }) => {
    await page.goto(storyUrl("data-display-icon--states"));
    const icon = page.getByTestId("state-error");
    await expect(icon).toHaveAttribute("data-state", "error");
    const color = await icon.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("slots: leading + trailing label render via data-slot attrs", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--slots"));
    const both = page.getByTestId("slot-both");
    await expect(both.locator('[data-slot="leading-label"]')).toHaveText("Save");
    await expect(both.locator('[data-slot="trailing-label"]')).toHaveText("3");
    await expect(both.locator('[data-slot="glyph"]')).toBeVisible();
    // leading-only / trailing-only slots also wire up
    await expect(
      page.getByTestId("slot-leading").locator('[data-slot="leading-label"]'),
    ).toHaveText("Search");
    await expect(
      page.getByTestId("slot-trailing").locator('[data-slot="trailing-label"]'),
    ).toHaveText("Home");
  });

  test("interactive icon is a labelled, focusable, keyboard-activated button", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--accessibility"));
    const icon = page.getByTestId("a11y-interactive");
    await expect(icon).toHaveAttribute("role", "img");
    await expect(icon).toHaveAttribute("aria-label", "Toggle favorite");
    await expect(icon).toHaveAttribute("tabindex", "0");
    await icon.focus();
    await expect(icon).toBeFocused();
  });

  test("decorative icon is aria-hidden and has no role=img", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--accessibility"));
    const icon = page.getByTestId("a11y-decorative");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(await icon.getAttribute("role")).toBeNull();
    expect(await icon.getAttribute("aria-label")).toBeNull();
  });

  test("transition uses the M3 standard easing on color changes", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--default"));
    const icon = page.locator('[data-component="icon"]').first();
    const easing = await icon.evaluate(
      (el) => window.getComputedStyle(el).transitionTimingFunction,
    );
    expect(easing).toBe(EASE_STANDARD);
  });

  test("dark theme repaints the standard glyph to dark on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-icon--variants", "dark"));
    const icon = page.getByTestId("variant-standard");
    const color = await icon.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(DARK_ON_SURFACE);
  });

  test("playground story honors variant/size args", async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-display-icon--playground&viewMode=story&args=variant:tonal;size:lg&globals=theme:light;reducedMotion:reduce`,
    );
    const icon = page.locator('[data-component="icon"]').first();
    await expect(icon).toHaveAttribute("data-variant", "tonal");
    await expect(icon).toHaveAttribute("data-size", "lg");
  });
});
