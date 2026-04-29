import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3 Material Symbols. Animations + reduced
 * motion are forced so the snapshots stay deterministic across runs.
 * The baselines wait for `document.fonts.ready` so the variable-font
 * ligature has loaded before the screenshot is captured.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

async function settle(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  // The Material Symbols fonts arrive via a CSS @import. Wait for the
  // document fonts to finish loading before screenshotting so the
  // baseline captures a glyph and not the unrendered ligature text.
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Material Symbols - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`default - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-material-symbols--default", theme));
      await settle(page);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `material-symbols-default-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(
        storyUrl("data-display-material-symbols--variants", theme),
      );
      await settle(page);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `material-symbols-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`styles - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-material-symbols--styles", theme));
      await settle(page);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `material-symbols-styles-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-material-symbols--sizes", theme));
      await settle(page);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `material-symbols-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-material-symbols--states", theme));
      await settle(page);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `material-symbols-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
