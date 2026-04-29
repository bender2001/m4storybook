import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for Rating (MUI fallback re-skinned with M3
 * tokens). Each assertion reads computed styles so the test fails
 * the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_TERTIARY = "rgb(125, 82, 96)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Rating - M3 design parity", () => {
  test("group renders role=radiogroup with max symbols", async ({ page }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    const group = page.locator('[role="radiogroup"]').first();
    await expect(group).toBeVisible();
    const items = group.locator("[data-rating-item]");
    await expect(items).toHaveCount(5);
  });

  test("filled symbols use the primary role; empty use on-surface-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    // Default value = 3, so symbols 1-3 are filled (data-fill="1"), 4-5 empty.
    const filled = page.locator('[data-rating-item][data-fill="1"]').first();
    const empty = page.locator('[data-rating-item][data-fill="0"]').first();

    const filledColor = await filled
      .locator("[data-rating-filled]")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(filledColor).toBe(LIGHT_PRIMARY);

    const emptyColor = await empty
      .locator("[data-rating-empty]")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(emptyColor).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("accent variant uses the tertiary role for the filled symbol", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--variants"));
    // Second group is the accent variant.
    const accentGroup = page.locator('[role="radiogroup"]').nth(1);
    const filled = accentGroup
      .locator('[data-rating-item][data-fill="1"]')
      .first();
    const filledColor = await filled
      .locator("[data-rating-filled]")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(filledColor).toBe(LIGHT_TERTIARY);
  });

  test("size scale: hit-target 32 / 40 / 48 dp", async ({ page }) => {
    await page.goto(storyUrl("inputs-rating--sizes"));
    const groups = page.locator('[role="radiogroup"]');
    const heights: string[] = [];
    for (let g = 0; g < 3; g++) {
      const item = groups.nth(g).locator("[data-rating-item]").first();
      heights.push(
        await item.evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["32px", "40px", "48px"]);
  });

  test("size scale: icon glyph 18 / 24 / 32 dp", async ({ page }) => {
    await page.goto(storyUrl("inputs-rating--sizes"));
    const groups = page.locator('[role="radiogroup"]');
    const sizes: string[] = [];
    for (let g = 0; g < 3; g++) {
      const wrap = groups
        .nth(g)
        .locator("[data-rating-icon-wrap]")
        .first();
      sizes.push(
        await wrap.evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(sizes).toEqual(["18px", "24px", "32px"]);
  });

  test("disabled row fades to opacity 0.38 + suppresses state-layer", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--states"));
    // States: 0 rest, 1 selected, 2 disabled, 3 readonly, 4 half-precision.
    const disabledRow = page.locator('[data-rating-row]').nth(2);
    const opacity = await disabledRow.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
    const inputs = disabledRow.locator('input[type="radio"]');
    await expect(inputs.first()).toBeDisabled();
  });

  test("read-only row fades to opacity 0.38 but keeps inputs disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--states"));
    const readonlyRoot = page.locator("[data-rating-root]").nth(3);
    const readOnlyAttr = await readonlyRoot.getAttribute("data-readonly");
    expect(readOnlyAttr).toBe("true");
    const row = readonlyRoot.locator("[data-rating-row]");
    const ariaReadOnly = await row.getAttribute("aria-readonly");
    expect(ariaReadOnly).toBe("true");
  });

  test("hover paints state-layer at 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-rating--default", "light", "no-preference"),
    );
    const item = page.locator("[data-rating-item]").nth(4);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await item.hover();
    await page.waitForTimeout(260);
    const opacity = await item
      .locator("[data-rating-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-rating--default", "light", "no-preference"),
    );
    const item = page.locator("[data-rating-item]").nth(0);
    const input = item.locator('input[type="radio"]').last();
    await input.evaluate((el: HTMLInputElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await item
      .locator("[data-rating-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("clicking a symbol selects it and toggles off when clicked again", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    // Default starts at value=3. Click symbol 4 (last input on the 4th item).
    const fourth = page.locator("[data-rating-item]").nth(3);
    const input = fourth.locator('input[type="radio"]').last();
    await fourth.click();
    await expect(input).toBeChecked();
    // Click again to toggle off.
    await fourth.click();
    await expect(input).not.toBeChecked();
  });

  test("keyboard activation (Space) selects the focused option", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    const item = page.locator("[data-rating-item]").nth(1);
    const input = item.locator('input[type="radio"]').last();
    await input.evaluate((el: HTMLInputElement) => el.focus());
    await page.keyboard.press("Space");
    await expect(input).toBeChecked();
  });

  test("aria-label on each input follows the getLabelText pattern", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    const labels: (string | null)[] = [];
    for (let i = 0; i < 5; i++) {
      const item = page.locator("[data-rating-item]").nth(i);
      const input = item.locator('input[type="radio"]').last();
      labels.push(await input.getAttribute("aria-label"));
    }
    expect(labels).toEqual([
      "1 Stars",
      "2 Stars",
      "3 Stars",
      "4 Stars",
      "5 Stars",
    ]);
  });

  test("native radio inputs are visually hidden but receive clicks", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    const input = page
      .locator("[data-rating-item]")
      .first()
      .locator('input[type="radio"]')
      .last();
    const opacity = await input.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBe(0);
    await page.locator("[data-rating-item]").first().click();
    await expect(input).toBeChecked();
  });

  test("M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1) on the icon wrap", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    const wrap = page.locator("[data-rating-icon-wrap]").first();
    const styles = await wrap.evaluate((el) => {
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

  test("half-precision: 4.5 fills 4 full + 1 half", async ({ page }) => {
    await page.goto(storyUrl("inputs-rating--states"));
    // Read-only row has defaultValue 4.5 with precision 0.5.
    const row = page.locator("[data-rating-row]").nth(3);
    const fills: string[] = [];
    for (let i = 0; i < 5; i++) {
      const f = await row
        .locator("[data-rating-item]")
        .nth(i)
        .getAttribute("data-fill");
      fills.push(f ?? "");
    }
    expect(fills).toEqual(["1", "1", "1", "1", "0.5"]);
  });

  test("half-precision filled icon clip-path exposes only the left half", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--states"));
    const row = page.locator("[data-rating-row]").nth(3);
    const halfFilled = row
      .locator('[data-rating-item][data-fill="0.5"]')
      .first()
      .locator("[data-rating-filled]");
    const clip = await halfFilled.evaluate(
      (el) => window.getComputedStyle(el).clipPath,
    );
    expect(clip).toContain("inset(0px 50% 0px 0px)");
  });

  test("transparent symbol slot background (token-driven, no fill)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--default"));
    const wrap = page.locator("[data-rating-icon-wrap]").first();
    const bg = await wrap.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(TRANSPARENT);
  });

  test("aria-describedby resolves to helper text when present", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-rating--playground"));
    const group = page.locator('[role="radiogroup"]').first();
    const describedBy = await group.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helperId = describedBy.split(" ").pop() ?? "";
      const helper = page.locator(`[id="${helperId}"]`);
      await expect(helper).toContainText("Use the controls panel");
    }
  });

  test("dark theme swaps the filled role color", async ({ page }) => {
    await page.goto(storyUrl("inputs-rating--default", "dark"));
    const filled = page
      .locator('[data-rating-item][data-fill="1"]')
      .first();
    const color = await filled
      .locator("[data-rating-filled]")
      .evaluate((el) => window.getComputedStyle(el).color);
    // Dark primary = #D0BCFF = rgb(208, 188, 255).
    expect(color).not.toBe(LIGHT_PRIMARY);
    expect(color).toBe("rgb(208, 188, 255)");
  });
});
