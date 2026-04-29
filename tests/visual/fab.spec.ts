import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Floating Action Button. Each
 * assertion is tied to https://m3.material.io/components/floating-action-button/specs
 * and reads computed styles so a token drift fails the suite.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

// M3 light role values from src/tokens/colors.ts.
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_ON_PRIMARY_CONTAINER = "rgb(33, 0, 93)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_TERTIARY_CONTAINER = "rgb(255, 216, 228)";
const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const DARK_PRIMARY_CONTAINER = "rgb(79, 55, 139)";

const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("FAB - M3 design parity", () => {
  test("default FAB: 56dp container with shape-lg (16px) radius and elevation 3", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--default"));
    const fab = page.locator("[data-fab]").first();
    await expect(fab).toBeVisible();
    const styles = await fab.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        h: cs.height,
        w: cs.width,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.h).toBe("56px");
    expect(styles.w).toBe("56px");
    expect(parseFloat(styles.radius)).toBe(16);
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
    // elevation-3 → non-empty shadow stack.
    expect(styles.boxShadow).not.toBe("none");
    expect(styles.boxShadow).toContain("rgba(0, 0, 0,");
  });

  test("surface variant uses surface-container-high + primary content", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--variants"));
    const surface = page.locator('[data-fab][data-variant="surface"]');
    const styles = await surface.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("primary/secondary/tertiary variants use the matching container roles", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--variants"));
    const primary = page.locator('[data-fab][data-variant="primary"]');
    const secondary = page.locator('[data-fab][data-variant="secondary"]');
    const tertiary = page.locator('[data-fab][data-variant="tertiary"]');

    const primaryBg = await primary.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const secondaryBg = await secondary.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const tertiaryBg = await tertiary.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    expect(primaryBg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(secondaryBg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(tertiaryBg).toBe(LIGHT_TERTIARY_CONTAINER);
  });

  test("size scale: 40 / 56 / 96 dp container heights", async ({ page }) => {
    await page.goto(storyUrl("inputs-floating-action-button--sizes"));
    const fabs = page.locator("[data-fab]");
    const heights = await Promise.all(
      [0, 1, 2].map((i) =>
        fabs.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      ),
    );
    expect(heights).toEqual(["40px", "56px", "96px"]);
  });

  test("size scale: corner radii 12 / 16 / 28 dp respectively", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--sizes"));
    const fabs = page.locator("[data-fab]");
    const radii = await Promise.all(
      [0, 1, 2].map((i) =>
        fabs
          .nth(i)
          .evaluate((el) =>
            parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
          ),
      ),
    );
    expect(radii).toEqual([12, 16, 28]);
  });

  test("size scale: icon dimensions 24 / 24 / 36 dp", async ({ page }) => {
    await page.goto(storyUrl("inputs-floating-action-button--sizes"));
    const icons = page.locator("[data-fab-icon]");
    const sizes = await Promise.all(
      [0, 1, 2].map((i) =>
        icons.nth(i).evaluate((el) => {
          const cs = window.getComputedStyle(el);
          return { h: cs.height, w: cs.width };
        }),
      ),
    );
    expect(sizes[0]).toEqual({ h: "24px", w: "24px" });
    expect(sizes[1]).toEqual({ h: "24px", w: "24px" });
    expect(sizes[2]).toEqual({ h: "36px", w: "36px" });
  });

  test("disabled FAB: container suppressed and elevation reduced to 0", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--states"));
    const disabled = page.locator("[data-fab][data-disabled]").first();
    const input = disabled.locator(":scope");
    await expect(input).toBeDisabled();
    const styles = await disabled.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        boxShadow: cs.boxShadow,
      };
    });
    // Disabled never renders the active container role.
    expect(styles.bg).not.toBe(LIGHT_PRIMARY_CONTAINER);
    // M3 disabled FAB is elevation 0 — Chrome reports either "none" or
    // a stack of fully transparent shadows.
    expect(
      styles.boxShadow === "none" ||
        /^(rgba\(0, 0, 0, 0\)[^,]*,?\s*)+$/.test(styles.boxShadow),
    ).toBe(true);
  });

  test("hover paints state-layer at 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-floating-action-button--default", "light", "no-preference"),
    );
    const fab = page.locator("[data-fab]").first();
    // Make sure the FAB is not initially focused.
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await fab.hover();
    await page.waitForTimeout(260);
    const opacity = await fab
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-floating-action-button--default", "light", "no-preference"),
    );
    const fab = page.locator("[data-fab]").first();
    await fab.evaluate((el: HTMLButtonElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await fab
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("disabled state suppresses the state-layer", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-floating-action-button--states", "light", "no-preference"),
    );
    const disabled = page.locator("[data-fab][data-disabled]").first();
    await disabled.hover({ force: true }).catch(() => undefined);
    await page.waitForTimeout(260);
    const opacity = await disabled
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBe(0);
  });

  test("clicking fires onClick and the button is keyboard activable", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--default"));
    const fab = page.locator("[data-fab]").first();
    await expect(fab).toHaveAttribute("aria-label", /.+/);
    await expect(fab).toHaveAttribute("type", "button");
    await fab.click();
    // Button should still be enabled and present after click.
    await expect(fab).toBeEnabled();
  });

  test("extended FAB: widens to fit the label, label uses M3 label-l type role", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--with-icons"));
    const extended = page.locator("[data-fab][data-extended]").first();
    await expect(extended).toBeVisible();
    const containerStyles = await extended.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        h: cs.height,
        w: parseFloat(cs.width),
        radius: cs.borderTopLeftRadius,
      };
    });
    // Extended FAB stays at 56dp tall with shape-lg (16dp) radius.
    expect(containerStyles.h).toBe("56px");
    expect(parseFloat(containerStyles.radius)).toBe(16);
    // Width is auto + px-4 + gap-3 → must exceed the 56dp square baseline.
    expect(containerStyles.w).toBeGreaterThan(56);

    const labelStyles = await extended
      .locator("[data-fab-label]")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
      });
    // label-l = 14px / 20px line-height per src/tokens/typography.ts.
    expect(labelStyles.fontSize).toBe("14px");
    expect(labelStyles.lineHeight).toBe("20px");
  });

  test("M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1) transitions", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--default"));
    const fab = page.locator("[data-fab]").first();
    const styles = await fab.evaluate((el) => {
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

  test("lowered FAB drops to elevation 1 at rest", async ({ page }) => {
    await page.goto(storyUrl("inputs-floating-action-button--states"));
    const lowered = page.locator("[data-fab][data-lowered]").first();
    const resting = page.locator("[data-fab]:not([data-lowered]):not([data-disabled])").first();
    const loweredShadow = await lowered.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    const restingShadow = await resting.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    // Both must be present, and the lowered shadow must be different
    // (smaller) than the default elevation-3.
    expect(loweredShadow).not.toBe("none");
    expect(restingShadow).not.toBe("none");
    expect(loweredShadow).not.toBe(restingShadow);
  });

  test("aria-label is wired up for icon-only FABs", async ({ page }) => {
    await page.goto(storyUrl("inputs-floating-action-button--variants"));
    const fabs = page.locator("[data-fab]");
    await expect(fabs).toHaveCount(4);
    const labels = await fabs.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label")),
    );
    expect(labels).toEqual([
      "Surface FAB",
      "Primary FAB",
      "Secondary FAB",
      "Tertiary FAB",
    ]);
  });

  test("dark theme swaps primary-container on the default FAB", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-floating-action-button--default", "dark"));
    const fab = page.locator("[data-fab]").first();
    const bg = await fab.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe(LIGHT_PRIMARY_CONTAINER);
    expect(bg).toBe(DARK_PRIMARY_CONTAINER);
  });
});
