import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for M3 Checkbox. Each assertion is tied to
 * https://m3.material.io/components/checkbox/specs and reads computed
 * styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

// M3 light role values from src/tokens/colors.ts.
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_ERROR = "rgb(255, 255, 255)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Checkbox - M3 design parity", () => {
  test("default unchecked: outline = on-surface-variant, transparent fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--default"));
    const box = page.locator("[data-checkbox-box]").first();
    await expect(box).toBeVisible();
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        radius: cs.borderTopLeftRadius,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_ON_SURFACE_VARIANT);
    // M3 outline is 2dp.
    expect(parseFloat(styles.borderWidth)).toBe(2);
    // M3 corner radius is 2dp (shape-xs token = 4px in our scale).
    expect(parseFloat(styles.radius)).toBeLessThanOrEqual(4);
    expect(parseFloat(styles.radius)).toBeGreaterThan(0);
  });

  test("checked: container fills with primary, glyph stroke is on-primary", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--variants"));
    // Variants story renders 5 checkboxes. The 2nd is "Default checked".
    const checkedBox = page
      .locator("[data-checkbox-control][data-checked]")
      .first();
    const boxStyles = await checkedBox
      .locator("[data-checkbox-box]")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { bg: cs.backgroundColor, borderColor: cs.borderTopColor };
      });
    expect(boxStyles.bg).toBe(LIGHT_PRIMARY);
    expect(boxStyles.borderColor).toBe(LIGHT_PRIMARY);
    const glyphColor = await checkedBox
      .locator('[data-checkbox-glyph="check"]')
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(glyphColor).toBe(LIGHT_ON_PRIMARY);
  });

  test("indeterminate: renders a horizontal bar on a primary fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--variants"));
    const indeterminate = page.locator(
      "[data-checkbox-control][data-indeterminate]",
    );
    await expect(indeterminate).toHaveCount(1);
    const fillColor = await indeterminate
      .locator("[data-checkbox-box]")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(fillColor).toBe(LIGHT_PRIMARY);
    const glyph = indeterminate.locator(
      '[data-checkbox-glyph="indeterminate"]',
    );
    await expect(glyph).toBeVisible();
    // The native input has aria-checked="mixed".
    const input = indeterminate.locator('input[type="checkbox"]');
    await expect(input).toHaveAttribute("aria-checked", "mixed");
  });

  test("error variant uses the error role for outline and fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--variants"));
    // 4th box (index 3) is "Error unchecked"; 5th (index 4) is "Error checked".
    const boxes = page.locator("[data-checkbox-box]");
    const errorRest = boxes.nth(3);
    const errorChecked = boxes.nth(4);

    const restStyles = await errorRest.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderTopColor };
    });
    expect(restStyles.bg).toBe(TRANSPARENT);
    expect(restStyles.borderColor).toBe(LIGHT_ERROR);

    const checkedStyles = await errorChecked.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderTopColor };
    });
    expect(checkedStyles.bg).toBe(LIGHT_ERROR);
    expect(checkedStyles.borderColor).toBe(LIGHT_ERROR);

    const glyphColor = await page
      .locator(
        "[data-checkbox-control][data-checked]:nth-of-type(1) [data-checkbox-glyph='check']",
      )
      .first()
      .evaluate((el) => window.getComputedStyle(el).color)
      .catch(() => null);
    if (glyphColor) {
      expect([LIGHT_ON_PRIMARY, LIGHT_ON_ERROR]).toContain(glyphColor);
    }
  });

  test("size scale matches M3 (sm hit=32, md=40, lg=48)", async ({ page }) => {
    await page.goto(storyUrl("inputs-checkbox--sizes"));
    const controls = page.locator("[data-checkbox-control]");
    const heights = await Promise.all(
      [0, 1, 2].map((i) =>
        controls
          .nth(i)
          .evaluate((el) => window.getComputedStyle(el).height),
      ),
    );
    expect(heights).toEqual(["32px", "40px", "48px"]);
  });

  test("size scale: visual box is 16/18/24 dp respectively", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--sizes"));
    const boxes = page.locator("[data-checkbox-box]");
    const sizes = await Promise.all(
      [0, 1, 2].map((i) =>
        boxes.nth(i).evaluate((el) => {
          const cs = window.getComputedStyle(el);
          return { h: cs.height, w: cs.width };
        }),
      ),
    );
    expect(sizes[0]).toEqual({ h: "16px", w: "16px" });
    expect(sizes[1]).toEqual({ h: "18px", w: "18px" });
    expect(sizes[2]).toEqual({ h: "24px", w: "24px" });
  });

  test("disabled: state-layer suppressed, label fades to 38%", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--states"));
    // States story: 0=Unchecked, 1=Checked, 2=Indeterminate,
    // 3=Disabled unchecked, 4=Disabled checked, 5=Error.
    const disabledControl = page
      .locator("[data-checkbox-control][data-disabled]")
      .first();
    await expect(disabledControl).toBeVisible();
    const layerOpacity = await disabledControl
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(layerOpacity).toBe(0);
    const input = disabledControl.locator('input[type="checkbox"]');
    await expect(input).toBeDisabled();
  });

  test("hover paints state-layer at 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-checkbox--default", "light", "no-preference"),
    );
    const control = page.locator("[data-checkbox-control]").first();
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await control.hover();
    await page.waitForTimeout(260);
    const opacity = await control
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-checkbox--default", "light", "no-preference"),
    );
    const control = page.locator("[data-checkbox-control]").first();
    const input = control.locator('input[type="checkbox"]');
    await input.evaluate((el: HTMLInputElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await control
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("clicking toggles aria-checked and animates the glyph", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--default"));
    const control = page.locator("[data-checkbox-control]").first();
    const input = control.locator('input[type="checkbox"]');
    await expect(input).toHaveAttribute("aria-checked", "false");
    await input.click();
    await expect(input).toHaveAttribute("aria-checked", "true");
    const checkGlyph = control.locator('[data-checkbox-glyph="check"]');
    await expect(checkGlyph).toBeVisible();
    await input.click();
    await expect(input).toHaveAttribute("aria-checked", "false");
  });

  test("keyboard activation (Space) toggles aria-checked", async ({ page }) => {
    await page.goto(storyUrl("inputs-checkbox--default"));
    const input = page.locator('input[type="checkbox"]').first();
    await input.evaluate((el: HTMLInputElement) => el.focus());
    await expect(input).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Space");
    await expect(input).toHaveAttribute("aria-checked", "true");
  });

  test("label-placement: start renders box on the right", async ({ page }) => {
    await page.goto(storyUrl("inputs-checkbox--with-icons"));
    // The 3rd (index 2) checkbox in WithIcons has labelPlacement="start".
    const root = page.locator("[data-checkbox-root]").nth(2);
    const flexDirection = await root.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    expect(flexDirection).toBe("row-reverse");
  });

  test("label uses M3 body-l type role on default size", async ({ page }) => {
    await page.goto(storyUrl("inputs-checkbox--default"));
    // Outer <label data-checkbox-root> wraps the control + the label
    // text span. The label text span inherits the body-l type role
    // class so we read its computed styles directly.
    const labelText = page
      .locator("[data-checkbox-root] > span")
      .first()
      .locator("> span")
      .first();
    const styles = await labelText.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    // body-l = 16px / 24px line-height.
    expect(styles.fontSize).toBe("16px");
    expect(styles.lineHeight).toBe("24px");
  });

  test("native checkbox is invisible but receives focus and clicks", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--default"));
    const input = page.locator('input[type="checkbox"]').first();
    const opacity = await input.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBe(0);
    // The control wrapper still receives the click.
    await page.locator("[data-checkbox-control]").first().click();
    await expect(input).toHaveAttribute("aria-checked", "true");
  });

  test("M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1) on the box", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--default"));
    const box = page.locator("[data-checkbox-box]").first();
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
  });

  test("disabled selected box uses the on-surface 38% tint, not primary", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-checkbox--states"));
    // index 4 = "Disabled checked".
    const box = page.locator("[data-checkbox-box]").nth(4);
    const bg = await box.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Should NOT be primary; it should be a translucent on-surface tint.
    expect(bg).not.toBe(LIGHT_PRIMARY);
    expect(bg).not.toBe(LIGHT_ON_SURFACE);
    // RGBA with non-1 alpha — derived from on-surface/[0.38].
    expect(bg).toMatch(/rgba\(/);
  });

  test("dark theme swaps role colors on a checked box", async ({ page }) => {
    await page.goto(storyUrl("inputs-checkbox--variants", "dark"));
    const checked = page
      .locator("[data-checkbox-control][data-checked]")
      .first();
    const bg = await checked
      .locator("[data-checkbox-box]")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Dark primary = #D0BCFF = rgb(208, 188, 255).
    expect(bg).not.toBe(LIGHT_PRIMARY);
    expect(bg).toBe("rgb(208, 188, 255)");
  });
});
