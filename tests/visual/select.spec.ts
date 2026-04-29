import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Select. M3 has no
 * dedicated Expressive Select spec; the trigger re-uses the M3
 * Text Field spec (https://m3.material.io/components/text-fields/specs)
 * and the popup re-uses the M3 Menu spec
 * (https://m3.material.io/components/menus/specs). Every assertion
 * reads computed styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

// M3 emphasized easing token (medium2 / 300ms).
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Select - M3 design parity", () => {
  test("trigger advertises combobox + listbox semantics", async ({ page }) => {
    await page.goto(storyUrl("inputs-select--default"));
    const trigger = page.getByRole("combobox");
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("outlined variant matches M3 Text Field spec (radius, height, border, motion)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-select--default"));
    const field = page.locator("[data-select-field]").first();
    const styles = await field.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        height: cs.height,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        borderWidth: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });

    // M3 default Text Field height = 56dp.
    expect(styles.height).toBe("56px");
    // Outlined variant uses shape-xs (4dp).
    expect(parseFloat(styles.radius)).toBeCloseTo(4, 0);
    // Outlined fill is transparent.
    expect(styles.bg).toBe(TRANSPARENT);
    // Outlined border = outline role at 1dp resting.
    expect(parseFloat(styles.borderWidth)).toBeGreaterThan(0);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    // M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1).
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
  });

  test("filled variant uses surface-container-highest fill", async ({ page }) => {
    await page.goto(storyUrl("inputs-select--variants"));
    // Variants: 0 outlined, 1 filled.
    const field = page.locator("[data-select-field]").nth(1);
    const styles = await field.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderBottomWidth: cs.borderBottomWidth,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(parseFloat(styles.borderBottomWidth)).toBeGreaterThan(0);
  });

  test("size scale matches M3 density (sm=40, md=56, lg=72)", async ({ page }) => {
    await page.goto(storyUrl("inputs-select--sizes"));
    const fields = page.locator("[data-select-field]");
    const heights: string[] = [];
    for (let i = 0; i < 3; i++) {
      heights.push(
        await fields.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["40px", "56px", "72px"]);
  });

  test("disabled state suppresses interactions and dims the field", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-select--states"));
    // States: 0 resting, 1 with-selection, 2 error, 3 disabled.
    const field = page.locator("[data-select-field]").nth(3);
    const trigger = field.locator('[role="combobox"]');
    await expect(trigger).toBeDisabled();

    const opacity = await field.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("error state swaps the border color to the error role", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-select--states"));
    const field = page.locator("[data-select-field]").nth(2);
    const borderColor = await field.evaluate(
      (el) => window.getComputedStyle(el).borderTopColor,
    );
    // Light error role = #B3261E → rgb(179, 38, 30).
    expect(borderColor).toBe("rgb(179, 38, 30)");
  });

  test("hover paints the field state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-select--variants", "light", "no-preference"),
    );
    // Pick the filled variant — its state-layer paints over the on-surface
    // role and is unambiguously visible.
    const field = page.locator("[data-select-field]").nth(1);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await field.hover();
    await page.waitForTimeout(260);
    const opacity = await field
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("clicking the trigger opens the listbox and floats the label", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-select--default", "light", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("listbox")).toBeVisible();

    // Label transitions over medium2 (300ms); wait then assert it shrank.
    await page.waitForTimeout(360);
    const label = page.locator("label").first();
    const fontSize = await label.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    // Floating label uses label-m (12px) for md size.
    expect(parseFloat(fontSize)).toBeLessThanOrEqual(12);
  });

  test("popup matches M3 Menu spec (surface-container fill, elevation 2, shape-xs)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-select--default", "light", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await page.waitForTimeout(260);
    const popup = page.locator("[data-select-popup]");
    await expect(popup).toBeVisible();

    const styles = await popup.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
    expect(parseFloat(styles.radius)).toBeCloseTo(4, 0);
    expect(styles.boxShadow).not.toBe("none");
    expect(styles.boxShadow).toMatch(/rgba?\(/);
  });

  test("keyboard navigation: ArrowDown highlights option, Enter commits", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-select--default", "light", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.focus();
    // Open via Enter (combobox + listbox keyboard pattern).
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Trigger now displays the committed selection.
    const txt = (await trigger.textContent()) ?? "";
    expect(txt.trim().length).toBeGreaterThan(0);
  });

  test("Escape closes the popup without committing", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-select--default", "light", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });

  test("active option paints state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-select--default", "light", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.click();
    // The first option becomes active automatically (no current selection).
    await page.waitForTimeout(260);
    const layer = page
      .locator('[role="option"]')
      .first()
      .locator("[data-option-state-layer]");
    const opacity = await layer.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("resting label color comes from on-surface-variant", async ({ page }) => {
    await page.goto(storyUrl("inputs-select--default"));
    const label = page.locator("label").first();
    const labelColor = await label.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(labelColor).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("open trigger draws a 2dp primary outline on the field", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-select--default", "light", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await page.waitForTimeout(260);
    const field = page.locator("[data-select-field]").first();
    const styles = await field.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderWidth: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
      };
    });
    // Open-state bumps the outlined border to 2dp + primary color.
    expect(parseFloat(styles.borderWidth)).toBeGreaterThanOrEqual(2);
    expect(styles.borderColor).toBe(LIGHT_PRIMARY);
  });

  test("aria-describedby resolves to helper text when present", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-select--playground"));
    const trigger = page.getByRole("combobox");
    const describedBy = await trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helper = page.locator(`[id="${describedBy}"]`);
      await expect(helper).toContainText("Use the controls panel");
    }
  });

  test("hidden native select mirrors selection for form submission", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-select--default"));
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Native <select> (sr-only) carries the value alongside the trigger.
    const nativeValue = await page
      .locator("select")
      .first()
      .evaluate((el) => (el as HTMLSelectElement).value);
    expect(nativeValue).not.toBe("");
  });

  test("dark theme swaps role colors on the popup", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-select--default", "dark", "no-preference"),
    );
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await page.waitForTimeout(260);
    const popup = page.locator("[data-select-popup]");
    const bg = await popup.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe(LIGHT_SURFACE_CONTAINER);
  });
});
