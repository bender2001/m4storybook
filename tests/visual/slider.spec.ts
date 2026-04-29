import { expect, test } from "@playwright/test";

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_INVERSE_SURFACE = "rgb(50, 47, 53)";
const LIGHT_INVERSE_ON_SURFACE = "rgb(245, 239, 247)";
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

    await expect(active).toHaveCSS("background-color", LIGHT_PRIMARY);
    await expect(inactive).toHaveCSS(
      "background-color",
      LIGHT_SECONDARY_CONTAINER,
    );
  });

  test("handle paints the primary role", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const handle = page.locator("[data-slider-handle]").first();
    await expect(handle).toHaveCSS("background-color", LIGHT_PRIMARY);
  });

  test("active and inactive tracks leave the M3 handle gap", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const track = page.locator("[data-slider-track]").first();
    const active = page.locator("[data-slider-track-active]").first();
    const inactive = page.locator("[data-slider-track-inactive]").first();

    const [trackBox, activeBox, inactiveBox] = await Promise.all([
      track.boundingBox(),
      active.boundingBox(),
      inactive.boundingBox(),
    ]);
    if (!trackBox || !activeBox || !inactiveBox) {
      throw new Error("slider geometry missing");
    }

    expect(activeBox.width).toBeCloseTo(trackBox.width * 0.4 - 6, 0);
    expect(inactiveBox.x - (trackBox.x + trackBox.width * 0.4)).toBeCloseTo(
      6,
      0,
    );
  });

  test("size scale matches M3 XS/S/M/L/XL handle heights", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--sizes"));
    const fields = page.locator("[data-slider-field]");
    const heights: string[] = [];
    for (let i = 0; i < 5; i++) {
      heights.push(
        await fields.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["44px", "44px", "52px", "68px", "108px"]);
  });

  test("track height follows current M3 size tokens", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--sizes"));
    const tracks = page.locator("[data-slider-track-inactive]");
    const heights: string[] = [];
    for (let i = 0; i < 5; i++) {
      heights.push(
        await tracks.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      );
    }
    expect(heights).toEqual(["16px", "24px", "40px", "56px", "96px"]);
  });

  test("track shape follows current M3 size tokens", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--sizes"));
    const tracks = page.locator("[data-slider-track-inactive]");
    const radii: string[] = [];
    for (let i = 0; i < 5; i++) {
      radii.push(
        await tracks
          .nth(i)
          .evaluate((el) => window.getComputedStyle(el).borderTopLeftRadius),
      );
    }
    expect(radii).toEqual(["8px", "8px", "12px", "16px", "28px"]);
  });

  test("standard slider renders an inactive end stop", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--default"));
    const root = page.locator("[data-slider-root]").first();
    const stops = root.locator("[data-slider-stop]");
    await expect(stops).toHaveCount(1);
    await expect(stops.first()).toHaveCSS("left", "420px");
  });

  test("ticks render one stop indicator per step", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--variants"));
    const ticks = page.locator("[data-slider-root][data-ticks='true']").first();
    const stops = ticks.locator("[data-slider-stop]");
    await expect(stops).toHaveCount(11);
  });

  test("ticks snap pointer input to the nearest step", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--variants"));
    const ticks = page.locator("[data-slider-root][data-ticks='true']").first();
    const slider = ticks.getByRole("slider");
    const track = ticks.locator("[data-slider-track]");
    const box = await track.boundingBox();
    if (!box) throw new Error("track bounding box missing");

    await page.mouse.click(box.x + box.width * 0.46, box.y + box.height / 2);
    await expect(slider).toHaveAttribute("aria-valuetext", "50");
  });

  test("disabled state uses M3 disabled opacities and disables the input", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--states"));
    const root = page.locator("[data-slider-root]").nth(3);
    const active = root.locator("[data-slider-track-active]");
    const inactive = root.locator("[data-slider-track-inactive]");
    const handle = root.locator("[data-slider-handle]");
    const input = root.locator("[data-slider-input]");

    await expect(active).toHaveCSS("background-color", LIGHT_ON_SURFACE);
    await expect(active).toHaveCSS("opacity", "0.38");
    await expect(inactive).toHaveCSS("background-color", LIGHT_ON_SURFACE);
    await expect(inactive).toHaveCSS("opacity", "0.12");
    await expect(handle).toHaveCSS("opacity", "0.38");
    await expect(input).toBeDisabled();
  });

  test("error state swaps the active track + handle to the error role", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--states"));
    const root = page.locator("[data-slider-root]").nth(2);
    const active = root.locator("[data-slider-track-active]");
    const handle = root.locator("[data-slider-handle]");

    await expect(active).toHaveCSS("background-color", LIGHT_ERROR);
    await expect(handle).toHaveCSS("background-color", LIGHT_ERROR);
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

  test("focus shrinks the handle, paints state-layer, and reveals value indicator", async ({
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

    const handle = page.locator("[data-slider-handle]").first();
    await expect(handle).toHaveCSS("width", "2px");

    const indicator = page.locator("[data-slider-value-indicator]").first();
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText("40");
    await expect(indicator).toHaveCSS("background-color", LIGHT_INVERSE_SURFACE);
    await expect(indicator).toHaveCSS("color", LIGHT_INVERSE_ON_SURFACE);
  });

  test("valueLabel formats aria-valuetext and the indicator", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--variants"));
    const root = page.locator("[data-slider-root]").nth(2);
    const slider = root.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuetext", "55%");
    await slider.focus();
    const indicator = root.locator("[data-slider-value-indicator]");
    await expect(indicator).toContainText("55%");
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
    await page.waitForTimeout(260);

    const track = page.locator("[data-slider-track]").first();
    const active = page.locator("[data-slider-track-active]").first();
    const [trackBox, activeBox] = await Promise.all([
      track.boundingBox(),
      active.boundingBox(),
    ]);
    if (!trackBox || !activeBox) throw new Error("slider geometry missing");
    expect(activeBox.width).toBeCloseTo(trackBox.width * 0.41 - 6, 0);
  });

  test("End jumps to the maximum", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    const slider = page.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuetext", "100");
  });

  test("handle shrinks when pressed", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-slider--default", "light", "no-preference"),
    );
    const handle = page.locator("[data-slider-handle]").first();
    await expect(handle).toHaveCSS("width", "4px");

    const track = page.locator("[data-slider-track]").first();
    const box = await track.boundingBox();
    if (!box) throw new Error("track bounding box missing");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(260);
    await expect(handle).toHaveCSS("width", "2px");
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
    expect(styles.duration.split(",")[0].trim()).toBe("0.2s");
    expect(styles.ease).toContain(EASE_EMPHASIZED);
  });

  test("aria-describedby resolves to helper text when present", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-slider--playground"));
    const slider = page.getByRole("slider");
    const describedBy = await slider.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helper = page.locator(`[id="${describedBy}"]`);
      await expect(helper).toContainText("Use the controls panel");
    }
  });

  test("external value field stays in sync with the slider", async ({ page }) => {
    await page.goto(storyUrl("inputs-slider--external-value"));
    const slider = page.getByRole("slider");
    const input = page.getByLabel("Value");

    await input.fill("72");
    await expect(slider).toHaveAttribute("aria-valuetext", "72");

    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(input).toHaveValue("73");
  });
});
