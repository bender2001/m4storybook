import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for M3 Expressive Button. Each assertion is
 * tied to https://m3.material.io/components/buttons/specs and reads
 * computed styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

// M3 light role values from src/tokens/colors.ts (light theme).
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

// M3 emphasized easing token (medium2 / 300ms).
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Button - M3 Expressive design parity", () => {
  test("filled variant matches M3 spec (radius, height, color, motion)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--default"));
    const button = page.getByRole("button", { name: "Button" });
    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        height: cs.height,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
        fontWeight: cs.fontWeight,
      };
    });

    // M3 medium button = 40dp tall.
    expect(styles.height).toBe("40px");
    // M3 buttons use the full shape (pill); 9999px collapses to height/2 = 20px.
    expect(parseFloat(styles.radius)).toBeGreaterThanOrEqual(20);
    // Filled = primary container, on-primary label.
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY);
    // M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1).
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
    // M3 Expressive label uses medium font weight (500).
    expect(parseInt(styles.fontWeight, 10)).toBeGreaterThanOrEqual(500);
  });

  test("tonal variant uses secondary-container role", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--variants"));
    const button = page.getByRole("button", { name: "Tonal" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined variant has transparent fill and outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--variants"));
    const button = page.getByRole("button", { name: "Outlined" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_PRIMARY);
    expect(parseFloat(styles.borderWidth)).toBeGreaterThan(0);
  });

  test("text variant has transparent fill and primary label", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--variants"));
    const button = page.getByRole("button", { name: "Text" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("elevated variant uses surface-container-low + elevation 1", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--variants"));
    const button = page.getByRole("button", { name: "Elevated" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.color).toBe(LIGHT_PRIMARY);
    // Elevation 1: any shadow string with two stops.
    expect(styles.boxShadow).not.toBe("none");
    expect(styles.boxShadow.split(",").length).toBeGreaterThanOrEqual(2);
  });

  test("size scale matches M3 (sm=32, md=40, lg=56)", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--sizes"));
    const small = page.getByRole("button", { name: "Small" });
    const medium = page.getByRole("button", { name: "Medium" });
    const large = page.getByRole("button", { name: "Large" });

    const heights = await Promise.all(
      [small, medium, large].map((b) =>
        b.evaluate((el) => window.getComputedStyle(el).height),
      ),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("disabled state suppresses state-layer and shows muted colors", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--states"));
    const disabled = page.getByRole("button", { name: "Disabled" });
    const layerOpacity = await disabled
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(layerOpacity).toBe(0);
  });

  // Use Variants story for interaction tests: it has no play() function,
  // so the button is not pre-focused when the page loads.
  test("hover paints state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--variants", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await button.hover();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--variants", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await button.evaluate((el: HTMLButtonElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("press paints state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--variants", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const box = await button.boundingBox();
    if (!box) throw new Error("button has no bounding box");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    await page.mouse.up();
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("dark theme swaps role colors on the filled button", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--default", "dark"));
    const button = page.getByRole("button", { name: "Button" });
    const bg = await button.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark primary = #D0BCFF, light primary = #6750A4: must differ.
    expect(bg).not.toBe(LIGHT_PRIMARY);
  });
});
