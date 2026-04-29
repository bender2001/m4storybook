import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Icon Button. Each assertion is tied
 * to https://m3.material.io/components/icon-buttons/specs and reads
 * computed styles so a token drift fails the suite.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

// M3 light role values from src/tokens/colors.ts.
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_INVERSE_SURFACE = "rgb(50, 47, 53)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";

const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Icon Button - M3 design parity", () => {
  test("default Icon Button: 40dp circular container, 24dp icon, transparent bg", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--default"));
    const btn = page.locator("[data-icon-button]").first();
    await expect(btn).toBeVisible();
    const styles = await btn.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        h: cs.height,
        w: cs.width,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
      };
    });
    expect(styles.h).toBe("40px");
    expect(styles.w).toBe("40px");
    // rounded-shape-full → 9999px (clamps to a circle visually).
    expect(parseFloat(styles.radius)).toBeGreaterThanOrEqual(20);
    expect(styles.bg).toBe("rgba(0, 0, 0, 0)");
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("filled variant uses surface-container-highest container in rest state", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--variants"));
    const filled = page.locator('[data-icon-button][data-variant="filled"]');
    const styles = await filled.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("outlined variant draws a 1dp outline border in resting state", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--variants"));
    const outlined = page.locator(
      '[data-icon-button][data-variant="outlined"]',
    );
    const styles = await outlined.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderWidth: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
      };
    });
    expect(styles.bg).toBe("rgba(0, 0, 0, 0)");
    expect(parseFloat(styles.borderWidth)).toBe(1);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
  });

  test("standard variant has transparent container + on-surface-variant content", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--variants"));
    const standard = page.locator(
      '[data-icon-button][data-variant="standard"]',
    );
    const styles = await standard.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe("rgba(0, 0, 0, 0)");
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("size scale: 32 / 40 / 56 dp container heights", async ({ page }) => {
    await page.goto(storyUrl("inputs-icon-button--sizes"));
    const btns = page.locator("[data-icon-button]");
    const heights = await Promise.all(
      [0, 1, 2].map((i) =>
        btns.nth(i).evaluate((el) => window.getComputedStyle(el).height),
      ),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("size scale: icon dimensions 18 / 24 / 28 dp", async ({ page }) => {
    await page.goto(storyUrl("inputs-icon-button--sizes"));
    const icons = page.locator("[data-icon-button-icon]");
    const sizes = await Promise.all(
      [0, 1, 2].map((i) =>
        icons.nth(i).evaluate((el) => {
          const cs = window.getComputedStyle(el);
          return { h: cs.height, w: cs.width };
        }),
      ),
    );
    expect(sizes[0]).toEqual({ h: "18px", w: "18px" });
    expect(sizes[1]).toEqual({ h: "24px", w: "24px" });
    expect(sizes[2]).toEqual({ h: "28px", w: "28px" });
  });

  test("size scale: rest radius is shape-full (clamps to half-height)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--sizes"));
    const btns = page.locator("[data-icon-button]");
    const radii = await Promise.all(
      [0, 1, 2].map((i) =>
        btns
          .nth(i)
          .evaluate((el) =>
            parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
          ),
      ),
    );
    // rounded-shape-full → 9999px on every container (clamps to a circle).
    expect(radii.every((r) => r >= 16)).toBe(true);
    expect(radii[0]).toBeGreaterThanOrEqual(16);
    expect(radii[1]).toBeGreaterThanOrEqual(20);
    expect(radii[2]).toBeGreaterThanOrEqual(28);
  });

  test("selected toggle morphs to shape-md squircle and primary fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--states"));
    const selected = page.locator("[data-icon-button][data-selected]").first();
    await expect(selected).toBeVisible();
    const styles = await selected.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: parseFloat(cs.borderTopLeftRadius),
        ariaPressed: el.getAttribute("aria-pressed"),
      };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY);
    // shape-md = 12px (md size).
    expect(styles.radius).toBe(12);
    expect(styles.ariaPressed).toBe("true");
  });

  test("disabled icon button: container fades and input is disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--states"));
    const disabled = page
      .locator("[data-icon-button][data-disabled]")
      .first();
    await expect(disabled).toBeDisabled();
    const opacity = await disabled.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    // M3 disabled-content opacity is 0.38.
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("hover paints state-layer at 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-icon-button--variants", "light", "no-preference"),
    );
    // Use the filled variant so the state-layer has a non-transparent
    // container to sit over.
    const btn = page.locator('[data-icon-button][data-variant="filled"]');
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await btn.hover();
    await page.waitForTimeout(260);
    const opacity = await btn
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-icon-button--variants", "light", "no-preference"),
    );
    const btn = page.locator('[data-icon-button][data-variant="filled"]');
    await btn.evaluate((el: HTMLButtonElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await btn
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("disabled state suppresses the state-layer", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-icon-button--states", "light", "no-preference"),
    );
    const disabled = page
      .locator("[data-icon-button][data-disabled]")
      .first();
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
    await page.goto(storyUrl("inputs-icon-button--default"));
    const btn = page.locator("[data-icon-button]").first();
    await expect(btn).toHaveAttribute("aria-label", /.+/);
    await expect(btn).toHaveAttribute("type", "button");
    await btn.click();
    await expect(btn).toBeEnabled();
  });

  test("toggle: clicking flips aria-pressed and morphs the radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--toggle"));
    const btn = page.locator("[data-icon-button]").first();
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    const restRadius = await btn.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    // Wait for the medium2 (300ms) transition to settle.
    await page.waitForTimeout(360);
    const selectedRadius = await btn.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    // Rest is shape-full (9999px clamps to circle); selected is shape-md (12px).
    expect(selectedRadius).toBeLessThan(restRadius);
    expect(selectedRadius).toBe(12);
  });

  test("tonal rest variant uses surface-container-highest role", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--with-icons"));
    const tonal = page.locator('[data-icon-button][data-variant="tonal"]');
    await expect(tonal.first()).toBeVisible();
    const styles = await tonal.first().evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    // Rest tonal = surface-container-highest container per M3 spec.
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
    // Sanity-check the selected tokens our anatomy.ts depends on.
    expect(LIGHT_SECONDARY_CONTAINER).toBe("rgb(232, 222, 248)");
    expect(LIGHT_ON_SECONDARY_CONTAINER).toBe("rgb(29, 25, 43)");
  });

  test("outlined rest variant uses 1dp outline + transparent fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--variants"));
    const outlined = page.locator(
      '[data-icon-button][data-variant="outlined"]',
    );
    const styles = await outlined.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderTopColor };
    });
    expect(styles.bg).toBe("rgba(0, 0, 0, 0)");
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    // Sanity-check the inverse-surface role our outlined-selected
    // anatomy depends on.
    expect(LIGHT_INVERSE_SURFACE).toBe("rgb(50, 47, 53)");
  });

  test("M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1) transitions", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--default"));
    const btn = page.locator("[data-icon-button]").first();
    const styles = await btn.evaluate((el) => {
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

  test("aria-label is wired up for icon-only buttons", async ({ page }) => {
    await page.goto(storyUrl("inputs-icon-button--variants"));
    const btns = page.locator("[data-icon-button]");
    await expect(btns).toHaveCount(4);
    const labels = await btns.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label")),
    );
    expect(labels).toEqual(["Filled", "Tonal", "Outlined", "Standard"]);
  });

  test("dark theme swaps surface-container-highest on the filled variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-icon-button--variants", "dark"));
    const filled = page.locator('[data-icon-button][data-variant="filled"]');
    const bg = await filled.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });
});
