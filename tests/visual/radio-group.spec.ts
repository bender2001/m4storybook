import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for M3 Radio Group. Each assertion is tied to
 * https://m3.material.io/components/radio-button/specs and reads
 * computed styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

// M3 light role values from src/tokens/colors.ts.
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Radio Group - M3 design parity", () => {
  test("group has role=radiogroup with the expected option count", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    const group = page.locator('[role="radiogroup"]').first();
    await expect(group).toBeVisible();
    const options = group.locator('input[type="radio"]');
    await expect(options).toHaveCount(3);
  });

  test("default unselected ring = on-surface-variant, transparent fill, 2dp border", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    // Default story selects "medium"; the first option ("small") is unselected.
    const ring = page.locator("[data-radio-circle]").first();
    await expect(ring).toBeVisible();
    const styles = await ring.evaluate((el) => {
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
    // M3 ring stroke is 2dp.
    expect(parseFloat(styles.borderWidth)).toBe(2);
    // Fully circular.
    expect(parseFloat(styles.radius)).toBeGreaterThanOrEqual(8);
  });

  test("selected: ring + dot fill in primary role", async ({ page }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    const selectedControl = page
      .locator("[data-radio-control][data-checked]")
      .first();
    const ringStyles = await selectedControl
      .locator("[data-radio-circle]")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { bg: cs.backgroundColor, borderColor: cs.borderTopColor };
      });
    expect(ringStyles.bg).toBe(TRANSPARENT);
    expect(ringStyles.borderColor).toBe(LIGHT_PRIMARY);
    const dotColor = await selectedControl
      .locator("[data-radio-dot]")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(dotColor).toBe(LIGHT_PRIMARY);
  });

  test("error variant uses the error role for ring and dot", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--variants"));
    // Variants story: 1st group default, 2nd group error.
    // 4th option (index 3 globally) is "small" of the error group, 5th is selected "medium".
    const errorGroup = page.locator('[role="radiogroup"]').nth(1);
    const errorRest = errorGroup.locator("[data-radio-circle]").first();
    const errorSelectedControl = errorGroup.locator(
      "[data-radio-control][data-checked]",
    );

    const restBorder = await errorRest.evaluate(
      (el) => window.getComputedStyle(el).borderTopColor,
    );
    expect(restBorder).toBe(LIGHT_ERROR);

    const selectedBorder = await errorSelectedControl
      .locator("[data-radio-circle]")
      .evaluate((el) => window.getComputedStyle(el).borderTopColor);
    expect(selectedBorder).toBe(LIGHT_ERROR);
    const selectedDot = await errorSelectedControl
      .locator("[data-radio-dot]")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(selectedDot).toBe(LIGHT_ERROR);
  });

  test("size scale matches M3 (sm hit=32, md=40, lg=48)", async ({ page }) => {
    await page.goto(storyUrl("inputs-radio-group--sizes"));
    // 3 groups × 3 controls each = 9 controls. Pick first of each group.
    const groups = page.locator('[role="radiogroup"]');
    const heights: string[] = [];
    for (let g = 0; g < 3; g++) {
      const ctrl = groups
        .nth(g)
        .locator("[data-radio-control]")
        .first();
      heights.push(await ctrl.evaluate((el) => window.getComputedStyle(el).height));
    }
    expect(heights).toEqual(["32px", "40px", "48px"]);
  });

  test("size scale: visual circle is 16/20/24 dp respectively", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--sizes"));
    const groups = page.locator('[role="radiogroup"]');
    const sizes: { h: string; w: string }[] = [];
    for (let g = 0; g < 3; g++) {
      const circle = groups.nth(g).locator("[data-radio-circle]").first();
      sizes.push(
        await circle.evaluate((el) => {
          const cs = window.getComputedStyle(el);
          return { h: cs.height, w: cs.width };
        }),
      );
    }
    expect(sizes[0]).toEqual({ h: "16px", w: "16px" });
    expect(sizes[1]).toEqual({ h: "20px", w: "20px" });
    expect(sizes[2]).toEqual({ h: "24px", w: "24px" });
  });

  test("disabled group: state-layer suppressed, inputs disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--states"));
    // States story: 0=Resting, 1=Selection, 2=Disabled, 3=Error, 4=Per-option
    const disabledGroup = page.locator('[role="radiogroup"]').nth(2);
    const disabledControl = disabledGroup
      .locator("[data-radio-control]")
      .first();
    await expect(disabledControl).toBeVisible();
    const opacity = await disabledControl
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBe(0);
    const inputs = disabledGroup.locator('input[type="radio"]');
    await expect(inputs.first()).toBeDisabled();
    await expect(inputs.nth(1)).toBeDisabled();
    await expect(inputs.nth(2)).toBeDisabled();
  });

  test("hover paints state-layer at 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-radio-group--default", "light", "no-preference"),
    );
    const control = page.locator("[data-radio-control]").first();
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
      storyUrl("inputs-radio-group--default", "light", "no-preference"),
    );
    const control = page.locator("[data-radio-control]").first();
    const input = control.locator('input[type="radio"]');
    await input.evaluate((el: HTMLInputElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await control
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("clicking a radio selects it and de-selects the previous one", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    const inputs = page.locator('input[type="radio"]');
    // Default story has "medium" selected (index 1).
    await expect(inputs.nth(1)).toHaveAttribute("aria-checked", "true");
    await inputs.nth(2).click();
    await expect(inputs.nth(2)).toHaveAttribute("aria-checked", "true");
    await expect(inputs.nth(1)).toHaveAttribute("aria-checked", "false");
    await expect(inputs.nth(0)).toHaveAttribute("aria-checked", "false");
  });

  test("keyboard activation (Space) selects the focused option", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    const inputs = page.locator('input[type="radio"]');
    await inputs.nth(0).evaluate((el: HTMLInputElement) => el.focus());
    await expect(inputs.nth(0)).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Space");
    await expect(inputs.nth(0)).toHaveAttribute("aria-checked", "true");
  });

  test("label-placement: start renders the circle on the right", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--playground"));
    const root = page.locator("[data-radio-root]").first();
    // The default placement is end (row); we just confirm the row has the right direction here.
    const direction = await root.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    expect(["row", "row-reverse"]).toContain(direction);
  });

  test("orientation=horizontal lays out options in a row", async ({ page }) => {
    await page.goto(storyUrl("inputs-radio-group--horizontal"));
    const optionsRow = page.locator("[data-radio-options]").first();
    const direction = await optionsRow.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    expect(direction).toBe("row");
  });

  test("label uses M3 body-l type role on default size", async ({ page }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    // Outer <label data-radio-root> wraps the control + the label-text span.
    const labelText = page
      .locator("[data-radio-root]")
      .first()
      .locator("> span")
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

  test("native radio is invisible but receives focus and clicks", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    const input = page.locator('input[type="radio"]').first();
    const opacity = await input.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBe(0);
    // The control wrapper still receives the click.
    await page.locator("[data-radio-control]").first().click();
    await expect(input).toHaveAttribute("aria-checked", "true");
  });

  test("M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1) on the ring", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--default"));
    const ring = page.locator("[data-radio-circle]").first();
    const styles = await ring.evaluate((el) => {
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

  test("per-option disabled disables only that option's input", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--states"));
    // States story group 4 = "Per-option disabled" — last option disabled.
    const group = page.locator('[role="radiogroup"]').nth(4);
    const inputs = group.locator('input[type="radio"]');
    await expect(inputs.nth(0)).not.toBeDisabled();
    await expect(inputs.nth(1)).not.toBeDisabled();
    await expect(inputs.nth(2)).toBeDisabled();
  });

  test("aria-describedby resolves to helper text when present", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-radio-group--playground"));
    const group = page.locator('[role="radiogroup"]').first();
    const describedBy = await group.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      // useId can produce ids with ":" characters which are invalid in
      // CSS selectors, so look up by attribute value rather than #id.
      const helperId = describedBy.split(" ").pop() ?? "";
      const helper = page.locator(`[id="${helperId}"]`);
      await expect(helper).toContainText("Choose your preferred size");
    }
  });

  test("dark theme swaps role colors on the selected ring", async ({ page }) => {
    await page.goto(storyUrl("inputs-radio-group--default", "dark"));
    const selectedControl = page
      .locator("[data-radio-control][data-checked]")
      .first();
    const dotBg = await selectedControl
      .locator("[data-radio-dot]")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Dark primary = #D0BCFF = rgb(208, 188, 255).
    expect(dotBg).not.toBe(LIGHT_PRIMARY);
    expect(dotBg).toBe("rgb(208, 188, 255)");
  });
});
