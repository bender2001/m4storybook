import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Slider. Specs from
 * https://m3.material.io/components/sliders/specs. Every assertion
 * reads computed styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Slider - M3 design parity", () => {
  test("renders role=slider with native input semantics", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const slider = page.getByRole("slider");
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute("type", "range");
    await expect(slider).toHaveAttribute("aria-valuetext", "40");
  });

  test("active track paints primary, inactive paints secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const active = page.locator("[data-slider-track-active]").first();
    const inactive = page.locator("[data-slider-track-inactive]").first();

    const activeColor = await active.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const inactiveColor = await inactive.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(activeColor).toBe(LIGHT_PRIMARY);
    expect(inactiveColor).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("handle paints the primary role", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const handle = page.locator("[data-slider-handle]").first();
    const bg = await handle.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_PRIMARY);
  });

  test("active track width matches the value percent", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const active = page.locator("[data-slider-track-active]").first();
    const inline = await active.evaluate((el) => (el as HTMLElement).style.width);
    expect(inline).toBe("40%");
  });

  test("size scale matches M3 density (sm=32, md=44, lg=56)", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--sizes"));
    const fields = page.locator("[data-slider-field]");
    const heights: string[] = [];
    for (let i = 0; i < 3; i++) {
      heights.push(
        await fields.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["32px", "44px", "56px"]);
  });

  test("track height follows M3 Expressive tokens (12 / 16 / 20 dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--sizes"));
    const tracks = page.locator("[data-slider-track-inactive]");
    const heights: string[] = [];
    for (let i = 0; i < 3; i++) {
      heights.push(
        await tracks.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["12px", "16px", "20px"]);
  });

  test("discrete variant renders one stop indicator per step", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--variants"));
    // Variants: 0 continuous, 1 discrete (step 10 across 0-100 = 11 stops).
    const discrete = page.locator("[data-slider-root][data-variant='discrete']");
    const stops = discrete.locator("[data-slider-stop]");
    await expect(stops).toHaveCount(11);
  });

  test("disabled state dims the field to 0.38 and disables the input", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--states"));
    // States: 0 resting, 1 with-selection, 2 error, 3 disabled.
    const root = page.locator("[data-slider-root]").nth(3);
    const field = root.locator("[data-slider-field]");
    const input = root.locator("[data-slider-input]");

    const opacity = await field.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
    await expect(input).toBeDisabled();
  });

  test("error state swaps the active track + handle to the error role", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--states"));
    const root = page.locator("[data-slider-root]").nth(2);
    const active = root.locator("[data-slider-track-active]");
    const handle = root.locator("[data-slider-handle]");

    const activeColor = await active.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const handleColor = await handle.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(activeColor).toBe(LIGHT_ERROR);
    expect(handleColor).toBe(LIGHT_ERROR);
  });

  test("hover paints the handle state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const track = page.locator("[data-slider-track]").first();
    await track.hover();
    await page.waitForTimeout(260);
    const layer = page.locator("[data-slider-handle-state-layer]").first();
    const opacity = await layer.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints the handle state-layer at 0.10 opacity + reveals value bubble", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    const slider = page.getByRole("slider");
    await slider.focus();
    await page.waitForTimeout(260);
    const layer = page.locator("[data-slider-handle-state-layer]").first();
    const opacity = await layer.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.1, 2);

    const bubble = page.locator("[data-slider-value-bubble]").first();
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("40");
  });

  test("ArrowRight increments the value by step + updates active track", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    const slider = page.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuetext", "41");

    const active = page.locator("[data-slider-track-active]").first();
    const width = await active.evaluate(
      (el) => (el as HTMLElement).style.width,
    );
    expect(width).toBe("41%");
  });

  test("End jumps to the maximum and commits", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    const slider = page.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuetext", "100");
    const active = page.locator("[data-slider-track-active]").first();
    const width = await active.evaluate(
      (el) => (el as HTMLElement).style.width,
    );
    expect(width).toBe("100%");
  });

  test("track radius is shape-full (pill)", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const inactive = page.locator("[data-slider-track-inactive]").first();
    const radius = await inactive.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    // shape-full = 9999px, may render as a large pixel value.
    expect(parseFloat(radius)).toBeGreaterThan(50);
  });

  test("handle morphs to a wider pill when pressed", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    const handle = page.locator("[data-slider-handle]").first();
    const restingWidth = await handle.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    // Resting handle width = 4dp at md size.
    expect(parseFloat(restingWidth)).toBeCloseTo(4, 0);

    // Drive a pointerdown on the track to morph the handle.
    const track = page.locator("[data-slider-track]").first();
    const box = await track.boundingBox();
    if (!box) throw new Error("track bounding box missing");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(260);
    const pressedWidth = await handle.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    expect(parseFloat(pressedWidth)).toBeGreaterThan(parseFloat(restingWidth));
    await page.mouse.up();
  });

  test("handle motion uses the M3 emphasized easing token", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const handle = page.locator("[data-slider-handle]").first();
    const styles = await handle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        duration: cs.transitionDuration,
        ease: cs.transitionTimingFunction,
      };
    });
    // short4 = 200ms.
    expect(styles.duration.split(",")[0].trim()).toBe("0.2s");
    expect(styles.ease).toContain(EASE_EMPHASIZED);
  });

  test("aria-describedby resolves to helper text when present", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--playground"));
    const slider = page.getByRole("slider");
    const describedBy = await slider.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helper = page.locator(`[id="${describedBy}"]`);
      await expect(helper).toContainText("Use the controls panel");
    }
  });

  test("native input owns name, value, min, max, step for form submission", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("name", "volume");
    await expect(slider).toHaveAttribute("min", "0");
    await expect(slider).toHaveAttribute("max", "100");
    await expect(slider).toHaveAttribute("step", "1");
    const value = await slider.evaluate(
      (el) => (el as HTMLInputElement).value,
    );
    expect(value).toBe("40");
  });

  test("resting label uses the on-surface-variant role", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const label = page.locator("label").first();
    const color = await label.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("dark theme swaps role colors on the active track", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "dark", "no-preference"),
    );
    const active = page.locator("[data-slider-track-active]").first();
    const color = await active.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(color).not.toBe(LIGHT_PRIMARY);
  });
});
