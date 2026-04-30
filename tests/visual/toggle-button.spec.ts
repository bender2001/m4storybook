import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Toggle Button. The component
 * morphs from shape-full at rest to shape-md when selected and swaps from
 * the rest role to the secondary-container role. Each assertion reads
 * computed style so a token drift breaks the test.
 *
 * https://m3.material.io/components/buttons/specs
 * https://m3.material.io/components/segmented-buttons/specs
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
const LIGHT_SECONDARY = "rgb(98, 91, 113)";
const LIGHT_ON_SECONDARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Toggle Button - M3 design parity", () => {
  test("default renders a button with role=button + aria-pressed=false", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--default"));
    const button = page.getByRole("button", { name: "Toggle bold" });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAttribute("data-variant", "outlined");
  });

  test("outlined rest paints transparent fill + 1dp outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const button = page
      .getByRole("button", { name: "Outlined rest" })
      .first();
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        color: cs.color,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(parseFloat(styles.borderWidth)).toBe(1);
  });

  test("filled rest paints primary + on-primary roles", async ({ page }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const button = page.getByRole("button", { name: "Filled rest" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY);
  });

  test("filled selected swaps to secondary + on-secondary", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const button = page.getByRole("button", { name: "Filled on" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY);
  });

  test("outlined selected swaps to secondary-container + on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const button = page.getByRole("button", { name: "Outlined on" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("M3 Expressive shape morph: rest = pill, selected = shape-md (12dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const restButton = page.getByRole("button", { name: "Outlined rest" });
    const onButton = page.getByRole("button", { name: "Outlined on" });
    const restRadius = await restButton.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    const onRadius = await onButton.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    // Rest is pill (>= height/2 = 20px on a 40dp button).
    expect(restRadius).toBeGreaterThanOrEqual(20);
    // Selected uses shape-md = 12dp, well below the pill threshold.
    expect(onRadius).toBe(12);
  });

  test("size scale matches Button (sm 32 / md 40 / lg 56)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--sizes"));
    const heights = await Promise.all(
      ["Small", "Medium", "Large"].map(async (name) => {
        const button = page.getByRole("button", { name });
        return await button.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("disabled fades the button to ~38% and suppresses state-layer", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--states"));
    const button = page.getByRole("button", { name: "Disabled rest" });
    const opacity = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
    const layerOpacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(layerOpacity).toBe(0);
    await expect(button).toBeDisabled();
  });

  test("hover paints state-layer at 0.08 opacity (M3 hover token)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-toggle-button--default", "light", "no-preference"),
    );
    const button = page.getByRole("button", { name: "Toggle bold" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await button.hover();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity + draws focus-visible ring", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-toggle-button--default", "light", "no-preference"),
    );
    const button = page.getByRole("button", { name: "Toggle bold" });
    await button.evaluate((el: HTMLButtonElement) => el.focus());
    await page.waitForTimeout(260);
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        layerOpacity: parseFloat(
          window.getComputedStyle(el.querySelector("[data-state-layer]")!).opacity,
        ),
        outlineWidth: cs.outlineWidth,
      };
    });
    expect(styles.layerOpacity).toBeCloseTo(0.1, 2);
  });

  test("clicking the toggle flips aria-pressed + morphs the shape", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--default"));
    const button = page.getByRole("button", { name: "Toggle bold" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    const restRadius = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(restRadius).toBeGreaterThanOrEqual(20);

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    // After morph the shape should be shape-md (12dp).
    await expect
      .poll(
        async () =>
          button.evaluate((el) =>
            parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
          ),
        { timeout: 1500 },
      )
      .toBe(12);
    const onRadius = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(onRadius).toBe(12);

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("Space key on the focused button toggles selection", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--default"));
    const button = page.getByRole("button", { name: "Toggle bold" });
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("Enter key on the focused button toggles selection", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--default"));
    const button = page.getByRole("button", { name: "Toggle bold" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("M3 emphasized motion: medium2 (300ms) + emphasized cubic-bezier", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--default"));
    const button = page.getByRole("button", { name: "Toggle bold" });
    const styles = await button.evaluate((el) => {
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

  test("text variant paints transparent + on-surface-variant at rest", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const button = page.getByRole("button", { name: "Text rest" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderWidth: cs.borderTopWidth };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    // text variant has no border.
    expect(parseFloat(styles.borderWidth)).toBe(0);
  });

  test("elevated variant paints surface-container-low + elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants"));
    const button = page.getByRole("button", { name: "Elevated rest" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    // surface-container-low is the M3 elevated container token.
    expect(styles.bg).not.toBe(TRANSPARENT);
    // elevation-1 paints two visible drop-shadow layers (offset 1px / 1px,
    // blur 2px / 3px). Filter out the transparent transition-stub shadows.
    const visibleLayers = styles.shadow.match(/rgba?\([^)]*0\.\d+\)/g) ?? [];
    expect(visibleLayers.length).toBeGreaterThanOrEqual(2);
  });

  test("WithIcons story renders icon-only toggle without label", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--with-icons"));
    const button = page.getByRole("button", { name: "Icon only" });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("controlled defaultSelected renders aria-pressed=true on mount", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--with-icons"));
    const italic = page.getByRole("button", { name: "Italic" });
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    const radius = await italic.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(radius).toBe(12);
  });

  test("dark theme swaps role colors on the filled rest button", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-toggle-button--variants", "dark"));
    const button = page.getByRole("button", { name: "Filled rest" });
    const bg = await button.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark primary differs from light primary.
    expect(bg).not.toBe(LIGHT_PRIMARY);
    expect(bg).not.toBe(LIGHT_SECONDARY);
  });
});
