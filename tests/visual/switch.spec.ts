import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Switch. Specs from
 * https://m3.material.io/components/switch/specs. Every assertion
 * reads computed styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Switch - M3 design parity", () => {
  test("renders role=switch with type=checkbox + aria-checked", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const sw = page.getByRole("switch");
    await expect(sw).toBeVisible();
    await expect(sw).toHaveAttribute("type", "checkbox");
    await expect(sw).toHaveAttribute("aria-checked", "false");
  });

  test("unselected track paints surface-container-highest with outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const control = page.locator("[data-switch-control]").first();
    const styles = await control.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    // M3 Switch outline is 2dp.
    expect(parseFloat(styles.borderWidth)).toBe(2);
  });

  test("selected track paints primary, handle paints on-primary", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--variants"));
    // Variants story: 0 filled-off, 1 filled-on, 2 outlined-off, 3 outlined-on.
    const control = page.locator("[data-switch-control][data-checked]").first();
    const trackBg = await control.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(trackBg).toBe(LIGHT_PRIMARY);

    const handle = control.locator("[data-switch-handle]").first();
    const handleBg = await handle.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(handleBg).toBe(LIGHT_ON_PRIMARY);
  });

  test("unselected handle paints the outline role", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const handle = page.locator("[data-switch-handle]").first();
    const bg = await handle.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_OUTLINE);
  });

  test("size scale matches M3 (sm 24, md 32, lg 40)", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--sizes"));
    const controls = page.locator("[data-switch-control]");
    const heights: string[] = [];
    for (let i = 0; i < 3; i++) {
      heights.push(
        await controls.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["24px", "32px", "40px"]);
  });

  test("size scale: track widths follow M3 (40 / 52 / 64)", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--sizes"));
    const controls = page.locator("[data-switch-control]");
    const widths: string[] = [];
    for (let i = 0; i < 3; i++) {
      widths.push(
        await controls.nth(i).evaluate((el) => window.getComputedStyle(el).width),
      );
    }
    expect(widths).toEqual(["40px", "52px", "64px"]);
  });

  test("track radius is shape-full (pill)", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const control = page.locator("[data-switch-control]").first();
    const radius = await control.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    // shape-full = 9999px, may render as a large pixel value.
    expect(parseFloat(radius)).toBeGreaterThan(50);
  });

  test("handle morphs larger when selected (16dp -> 24dp at md)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--variants"));
    const offHandle = page
      .locator("[data-switch-control]:not([data-checked]) [data-switch-handle]")
      .first();
    const onHandle = page
      .locator("[data-switch-control][data-checked] [data-switch-handle]")
      .first();
    // Wait for the spring to settle.
    await page.waitForTimeout(400);
    const offSize = await offHandle.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    const onSize = await onHandle.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    expect(parseFloat(offSize)).toBeCloseTo(16, 0);
    expect(parseFloat(onSize)).toBeCloseTo(24, 0);
  });

  test("disabled state suppresses the state-layer + disables the input", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--states"));
    // States: 0 off, 1 on, 2 disabled-off, 3 disabled-on, 4 error.
    const control = page.locator("[data-switch-control][data-disabled]").first();
    const layerOpacity = await control
      .locator("[data-switch-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(layerOpacity).toBe(0);
    const input = control.locator("input[type='checkbox']");
    await expect(input).toBeDisabled();
  });

  test("error state swaps the track to the error role", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--states"));
    // index 4 = error (defaultChecked=true, error=true).
    const control = page.locator("[data-switch-control][data-error]").first();
    const trackBg = await control.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(trackBg).toBe(LIGHT_ERROR);
  });

  test("hover paints state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-switch--default", "light", "no-preference"),
    );
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const control = page.locator("[data-switch-control]").first();
    await control.hover();
    await page.waitForTimeout(260);
    const opacity = await control
      .locator("[data-switch-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-switch--default", "light", "no-preference"),
    );
    const sw = page.getByRole("switch");
    await sw.focus();
    await page.waitForTimeout(260);
    const layer = page.locator("[data-switch-state-layer]").first();
    const opacity = await layer.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("clicking toggles aria-checked + flips the checked data attr", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const sw = page.getByRole("switch");
    const control = page.locator("[data-switch-control]").first();
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await control.click();
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await expect(control).toHaveAttribute("data-checked", "true");
    await control.click();
    await expect(sw).toHaveAttribute("aria-checked", "false");
  });

  test("keyboard activation (Space) toggles aria-checked", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const sw = page.getByRole("switch");
    await sw.focus();
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Space");
    await expect(sw).toHaveAttribute("aria-checked", "true");
  });

  test("track motion uses M3 emphasized easing + medium2 (300ms)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const control = page.locator("[data-switch-control]").first();
    const styles = await control.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        duration: cs.transitionDuration,
        ease: cs.transitionTimingFunction,
      };
    });
    const firstDuration = styles.duration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.ease).toContain(EASE_EMPHASIZED);
  });

  test("native input is visually hidden + owns the form value via name", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const input = page.locator("[data-switch-input]");
    const opacity = await input.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBe(0);
    await expect(input).toHaveAttribute("name", "wifi");
  });

  test("aria-describedby resolves to helper text when present", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--playground"));
    const sw = page.getByRole("switch");
    const describedBy = await sw.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helper = page.locator(`[id="${describedBy}"]`);
      await expect(helper).toContainText("Toggle me");
    }
  });

  test("label uses M3 body-l type role at default size", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const labelText = page
      .locator("[data-switch-root] > span")
      .nth(1)
      .locator("> span")
      .first();
    const styles = await labelText.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("16px");
    expect(styles.lineHeight).toBe("24px");
  });

  test("helper text uses on-surface-variant role", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--playground"));
    const helper = page.locator("[data-switch-root]").first().locator("span#switch-r0-helper, span[id*='helper']").first();
    const color = await helper.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("handle slides toward the right edge when checked", async ({ page }) => {
    await page.goto(storyUrl("inputs-switch--default"));
    const control = page.locator("[data-switch-control]").first();
    const handle = control.locator("[data-switch-handle]");

    // Off-state: handle near left edge (left ~= 4px at md).
    await page.waitForTimeout(100);
    const offBox = await handle.boundingBox();
    const controlBox = await control.boundingBox();
    if (!offBox || !controlBox) throw new Error("bounding boxes missing");
    const offCenter = offBox.x + offBox.width / 2 - controlBox.x;
    expect(offCenter).toBeLessThan(controlBox.width / 2);

    // Toggle to on.
    await control.click();
    await page.waitForTimeout(450);
    const onBox = await handle.boundingBox();
    if (!onBox) throw new Error("on bounding box missing");
    const onCenter = onBox.x + onBox.width / 2 - controlBox.x;
    expect(onCenter).toBeGreaterThan(controlBox.width / 2);
  });

  test("dark theme swaps role colors on the selected track", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-switch--variants", "dark"));
    const onTrack = page
      .locator("[data-switch-control][data-checked]")
      .first();
    const bg = await onTrack.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark primary = #D0BCFF = rgb(208, 188, 255).
    expect(bg).not.toBe(LIGHT_PRIMARY);
    expect(bg).toBe("rgb(208, 188, 255)");
  });
});
