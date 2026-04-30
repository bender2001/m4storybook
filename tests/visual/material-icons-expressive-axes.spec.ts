import { expect, test } from "@playwright/test";

/**
 * M3 Expressive variable-icon axis design parity. The expressive icon
 * system (https://m3.material.io/styles/icons/overview) calls for the
 * glyph's FILL axis to ramp 0 → 1 on hover and the wght axis to ramp
 * 400 → 700 on selection. CSS cannot reliably tween variable font axes
 * across Safari + Firefox, so the tween is driven via motion/react
 * motion values + `useMotionTemplate`. This spec asserts the rest
 * values, the hover-driven FILL ramp, and the selected-driven wght
 * ramp.
 *
 * Reference story:
 *   /iframe.html?id=data-display-material-symbols--expressive-axes
 */

const storyUrl = (
  id: string,
  reducedMotion: "reduce" | "no-preference" = "no-preference",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:light;reducedMotion:${reducedMotion}`;

const FILL_AXIS = /"FILL"\s+([0-9.]+)/;
const WGHT_AXIS = /"wght"\s+([0-9.]+)/;

function parseAxis(variation: string, axis: RegExp): number {
  const match = variation.match(axis);
  if (!match) {
    throw new Error(`No match for ${axis} in "${variation}"`);
  }
  return Number.parseFloat(match[1]);
}

test.describe("Material Symbols - M3 Expressive variable axes", () => {
  test("rest swatch starts at FILL 0 / wght 400", async ({ page }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const symbol = page.getByTestId("hover-glyph-favorite");
    await expect(symbol).toHaveAttribute("data-axis-driven", "true");
    await expect(symbol).toHaveAttribute("data-fill", "0");
    await expect(symbol).toHaveAttribute("data-weight", "400");

    const variation = await symbol
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(parseAxis(variation, FILL_AXIS)).toBeCloseTo(0, 1);
    expect(parseAxis(variation, WGHT_AXIS)).toBeCloseTo(400, 0);
  });

  test("hover ramps the FILL axis 0 → 1 via motion/react", async ({ page }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const swatch = page.getByTestId("hover-favorite");
    const symbol = page.getByTestId("hover-glyph-favorite");

    // Hover the parent swatch and wait for the FILL tween to settle.
    await swatch.hover();
    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, FILL_AXIS);
        },
        { timeout: 1500 },
      )
      .toBeGreaterThan(0.9);

    // Move away and wait for the FILL tween to return to ~0.
    await page.mouse.move(0, 0);
    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, FILL_AXIS);
        },
        { timeout: 1500 },
      )
      .toBeLessThan(0.1);
  });

  test("selected swatch holds wght 700 and FILL 1", async ({ page }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const symbol = page.getByTestId("selected-glyph-selected");
    await expect(symbol).toHaveAttribute("data-axis-driven", "true");
    await expect(symbol).toHaveAttribute("data-weight", "700");
    await expect(symbol).toHaveAttribute("data-fill", "1");

    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, WGHT_AXIS);
        },
        { timeout: 1500 },
      )
      .toBeGreaterThan(690);

    const variation = await symbol
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(parseAxis(variation, FILL_AXIS)).toBeCloseTo(1, 1);
  });

  test("rest selected swatch holds wght 400 and FILL 0", async ({ page }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const symbol = page.getByTestId("selected-glyph-rest");
    await expect(symbol).toHaveAttribute("data-axis-driven", "true");
    await expect(symbol).toHaveAttribute("data-weight", "400");
    await expect(symbol).toHaveAttribute("data-fill", "0");

    const variation = await symbol
      .locator('[data-slot="glyph"]')
      .evaluate((el) => window.getComputedStyle(el).fontVariationSettings);
    expect(parseAxis(variation, FILL_AXIS)).toBeCloseTo(0, 1);
    expect(parseAxis(variation, WGHT_AXIS)).toBeCloseTo(400, 0);
  });

  test("hover + selected both drive FILL to 1 and wght to 700", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const symbol = page.getByTestId("selected-glyph-hover+selected");
    await expect(symbol).toHaveAttribute("data-fill", "1");
    await expect(symbol).toHaveAttribute("data-weight", "700");
  });

  test("reduced-motion preference snaps axes to target without tween", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const swatch = page.getByTestId("hover-favorite");
    const symbol = page.getByTestId("hover-glyph-favorite");

    await swatch.hover();
    // Under reduced motion the axis should snap to 1 essentially
    // immediately — well under the 180ms tween duration.
    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, FILL_AXIS);
        },
        { timeout: 200 },
      )
      .toBeGreaterThan(0.99);
  });

  test("Button publishes axis hints to a child MaterialIcon on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const button = page.getByTestId("parent-button");
    const symbol = page.getByTestId("parent-button-icon");
    await expect(symbol).toHaveAttribute("data-axis-driven", "true");
    await expect(symbol).toHaveAttribute("data-fill", "0");
    await expect(symbol).toHaveAttribute("data-weight", "400");

    await button.hover();
    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, FILL_AXIS);
        },
        { timeout: 1500 },
      )
      .toBeGreaterThan(0.9);
    await expect(symbol).toHaveAttribute("data-fill", "1");
  });

  test("IconButton publishes axis hints to its icon on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const iconButton = page.getByTestId("parent-icon-button");
    const symbol = page.getByTestId("parent-icon-button-icon");
    await expect(symbol).toHaveAttribute("data-axis-driven", "true");
    await iconButton.hover();
    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, FILL_AXIS);
        },
        { timeout: 1500 },
      )
      .toBeGreaterThan(0.9);
  });

  test("selected Chip drives wght 700 on its leading icon", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-material-symbols--expressive-axes"),
    );
    const symbol = page.getByTestId("parent-chip-icon");
    await expect(symbol).toHaveAttribute("data-axis-driven", "true");
    await expect(symbol).toHaveAttribute("data-weight", "700");
    await expect(symbol).toHaveAttribute("data-fill", "1");

    await expect
      .poll(
        async () => {
          const variation = await symbol
            .locator('[data-slot="glyph"]')
            .evaluate(
              (el) => window.getComputedStyle(el).fontVariationSettings,
            );
          return parseAxis(variation, WGHT_AXIS);
        },
        { timeout: 1500 },
      )
      .toBeGreaterThan(690);
  });
});
