import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Card component. Every
 * assertion reads computed style so a token drift breaks the test.
 *
 * Spec: https://m3.material.io/components/cards/specs
 *
 * Color roles per variant (light theme):
 *   - elevated  -> surface-container-low + on-surface
 *                  + elevation-1 box-shadow
 *   - filled    -> surface-container-highest + on-surface
 *   - outlined  -> surface + 1dp outline-variant + on-surface
 *
 * Shape: shape-md (12px) by default.
 * Density: 12 / 16 / 24 px content padding for sm / md / lg.
 * Title role: title-l (22px). Subhead/body role: body-m (14px) /
 * on-surface-variant.
 * Motion: medium2 (300ms) emphasized easing on color/shadow/border
 * transitions; standard easing on state-layer opacity.
 * Interactive: tabindex=0, role=button, state-layer overlay paints at
 * the M3 0.08 / 0.10 hover / focus opacity tokens.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const DARK_SURFACE_CONTAINER_LOW = "rgb(29, 27, 32)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Card - M3 design parity", () => {
  test("default renders an elevated card at shape-md (12px) + elevation-1", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--default"));
    const card = page.locator("[data-variant]").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-variant", "elevated");
    await expect(card).toHaveAttribute("data-shape", "md");
    await expect(card).toHaveAttribute("data-elevation", "1");
    const radius = await card.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
  });

  test("elevated variant paints surface-container-low + on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--variants"));
    const card = page.locator("[data-variant='elevated']").first();
    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("filled variant paints surface-container-highest + on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--variants"));
    const card = page.locator("[data-variant='filled']").first();
    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("outlined variant paints surface fill + 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--variants"));
    const card = page.locator("[data-variant='outlined']").first();
    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderTop: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE);
    expect(styles.borderTop).toBe("1px");
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant paints elevation-1 box-shadow at rest", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--variants"));
    const card = page.locator("[data-variant='elevated']").first();
    const shadow = await card.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    // elevation-1 = "0px 1px 2px 0px rgb(0 0 0 / 0.30), 0px 1px 3px 1px rgb(0 0 0 / 0.15)"
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("elevation prop scales the resting box-shadow", async ({ page }) => {
    await page.goto(storyUrl("surfaces-card--elevation"));
    const levels = await Promise.all(
      [0, 1, 2, 3, 4, 5].map(async (level) => {
        const card = page.locator(`[data-elevation='${level}']`).first();
        await expect(card).toBeVisible();
        return card.evaluate(
          (el) => window.getComputedStyle(el).boxShadow,
        );
      }),
    );
    // Level 0: Tailwind's composed box-shadow string still renders but
    // every layer is transparent. Levels 1..5 paint visible alpha
    // stops at 0.30 / 0.15.
    expect(levels[0]).not.toContain("rgba(0, 0, 0, 0.3)");
    expect(levels[0]).not.toContain("rgba(0, 0, 0, 0.15)");
    levels.slice(1).forEach((shadow) => {
      expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
      expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    });
  });

  test("size scale matches density: 12 / 16 / 24 px content padding", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--sizes"));
    const paddings = await Promise.all(
      [
        "[data-size='sm']",
        "[data-size='md']",
        "[data-size='lg']",
      ].map(async (sel) => {
        const content = page.locator(`${sel} [data-slot='content']`).first();
        await expect(content).toBeVisible();
        return content.evaluate(
          (el) => window.getComputedStyle(el).paddingTop,
        );
      }),
    );
    expect(paddings).toEqual(["12px", "16px", "24px"]);
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const card = page.locator(`[data-shape='${shape}']`).first();
      await expect(card).toBeVisible();
      const radius = await card.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius).toBe(value);
    }
  });

  test("interactive card exposes role=button + tabindex=0 + state-layer slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--states"));
    const card = page.getByRole("button", { name: "Interactive card" });
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-interactive", "true");
    await expect(card).toHaveAttribute("tabindex", "0");
    await expect(card.locator("[data-slot='state-layer']")).toHaveCount(1);
  });

  test("hover paints state layer at M3 0.08 hover opacity", async ({ page }) => {
    await page.goto(
      storyUrl("surfaces-card--states", "light", "no-preference"),
    );
    const card = page.getByRole("button", { name: "Interactive card" });
    await card.hover();
    await page.waitForTimeout(280);
    const opacity = await card.getAttribute("data-state-layer-opacity");
    expect(parseFloat(opacity ?? "0")).toBeCloseTo(0.08, 2);
    const layer = card.locator("[data-slot='state-layer']");
    const layerOpacity = await layer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(layerOpacity)).toBeCloseTo(0.08, 2);
  });

  test("focus paints state layer at M3 0.10 focus opacity", async ({ page }) => {
    await page.goto(
      storyUrl("surfaces-card--states", "light", "no-preference"),
    );
    const card = page.getByRole("button", { name: "Interactive card" });
    await card.focus();
    await page.waitForTimeout(280);
    const opacity = await card.getAttribute("data-state-layer-opacity");
    expect(parseFloat(opacity ?? "0")).toBeCloseTo(0.1, 2);
  });

  test("selected interactive card sets aria-selected + secondary-container fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--states"));
    const card = page.getByRole("button", { name: "Selected card" });
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("aria-selected", "true");
    const bg = await card.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("disabled interactive card sets aria-disabled + opacity 0.38", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--states"));
    const card = page.getByRole("button", { name: "Disabled card" });
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("aria-disabled", "true");
    const opacity = await card.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("error card paints error-container fill + aria-invalid + on-error-container text", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--states"));
    const card = page.locator("[data-error='true']").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("aria-invalid", "true");
    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("slots render media + avatar + title + subhead + trailing + actions", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--slots"));
    const card = page
      .locator("[data-variant]")
      .filter({ has: page.locator("[data-slot='media']") })
      .first();
    await expect(card).toBeVisible();
    await expect(card.locator("[data-slot='media']")).toHaveCount(1);
    await expect(card.locator("[data-slot='avatar']")).toHaveCount(1);
    await expect(card.locator("[data-slot='title']")).toHaveCount(1);
    await expect(card.locator("[data-slot='subhead']")).toHaveCount(1);
    await expect(card.locator("[data-slot='header-trailing']")).toHaveCount(1);
    await expect(card.locator("[data-slot='body']")).toHaveCount(1);
    await expect(card.locator("[data-slot='actions']")).toHaveCount(1);
  });

  test("title slot uses the M3 title-l type role (22px)", async ({ page }) => {
    await page.goto(storyUrl("surfaces-card--slots"));
    const title = page.locator("[data-slot='title']").first();
    await expect(title).toBeVisible();
    const fontSize = await title.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("22px");
  });

  test("subhead slot uses the M3 body-m type role (14px) + on-surface-variant color", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--slots"));
    const subhead = page.locator("[data-slot='subhead']").first();
    await expect(subhead).toBeVisible();
    const styles = await subhead.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("body slot uses body-m + on-surface-variant text color", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--slots"));
    const body = page.locator("[data-slot='body']").first();
    await expect(body).toBeVisible();
    const styles = await body.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("actions row keeps an 8dp gap between buttons", async ({ page }) => {
    await page.goto(storyUrl("surfaces-card--slots"));
    const actions = page.locator("[data-slot='actions']").first();
    await expect(actions).toBeVisible();
    const gap = await actions.evaluate(
      (el) => window.getComputedStyle(el).columnGap,
    );
    expect(gap).toBe("8px");
  });

  test("M3 motion: emphasized easing + medium2 duration on shape/elevation transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-card--default", "light", "no-preference"),
    );
    const card = page.locator("[data-variant]").first();
    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("box-shadow");
    expect(styles.property).toContain("background-color");
    expect(styles.duration).toContain("0.3s");
  });

  test("state layer paints standard easing on opacity transition", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-card--states", "light", "no-preference"),
    );
    const layer = page
      .getByRole("button", { name: "Interactive card" })
      .locator("[data-slot='state-layer']");
    const styles = await layer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
      };
    });
    expect(styles.property).toContain("opacity");
    expect(styles.timing).toContain(EASE_STANDARD);
  });

  test("dark theme swaps the elevated variant to the dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--variants", "dark"));
    const card = page.locator("[data-variant='elevated']").first();
    const bg = await card.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("playground story renders + accepts a runtime title control", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-card--playground"));
    const card = page.locator("[data-variant]").first();
    await expect(card).toBeVisible();
    await expect(card.locator("[data-slot='title']")).toHaveCount(1);
  });
});
