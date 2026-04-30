import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Snackbar.
 *
 * Spec: https://m3.material.io/components/snackbar/specs
 *
 * Container:
 *   - shape  : `xs` (4dp) by default
 *   - height : 40 / 48 / 56 px for sm / md / lg
 *   - fill   : `inverse-surface` (filled / default),
 *              `surface-container-highest` (tonal),
 *              `surface` + 1dp outline border (outlined),
 *              `surface-container-high` + elevation-3 (elevated)
 *
 * Label:
 *   - role   : body-s / body-m / body-l for sm / md / lg
 *   - color  : `inverse-on-surface` (filled), `on-surface` otherwise
 *
 * Action:
 *   - role   : label-m / label-l / label-l for sm / md / lg
 *   - color  : `inverse-primary` (filled), `primary` otherwise
 *
 * Motion:
 *   - container transitions emphasized / 300ms
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_INVERSE_SURFACE = "rgb(50, 47, 53)";
const LIGHT_INVERSE_ON_SURFACE = "rgb(245, 239, 247)";
const LIGHT_INVERSE_PRIMARY = "rgb(208, 188, 255)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const DARK_INVERSE_SURFACE = "rgb(230, 224, 233)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Snackbar - M3 design parity", () => {
  test("default renders a filled snackbar at shape-xs + 48dp + body-m", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--default"));
    const bar = page.locator("[data-component='snackbar']").first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("data-variant", "filled");
    await expect(bar).toHaveAttribute("data-size", "md");
    await expect(bar).toHaveAttribute("data-shape", "xs");
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        minHeight: cs.minHeight,
        bg: cs.backgroundColor,
        color: cs.color,
        minWidth: cs.minWidth,
        maxWidth: cs.maxWidth,
      };
    });
    expect(styles.radius).toBe("4px");
    expect(styles.minHeight).toBe("48px");
    expect(styles.bg).toBe(LIGHT_INVERSE_SURFACE);
    expect(styles.color).toBe(LIGHT_INVERSE_ON_SURFACE);
    expect(styles.minWidth).toBe("344px");
    expect(styles.maxWidth).toBe("672px");
    const message = bar.locator("[data-slot='message']").first();
    const fontSize = await message.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("14px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("feedback-snackbar--variants"));
    const expected: Record<string, string> = {
      filled: LIGHT_INVERSE_SURFACE,
      tonal: LIGHT_SURFACE_CONTAINER_HIGHEST,
      outlined: LIGHT_SURFACE,
      elevated: LIGHT_SURFACE_CONTAINER_HIGH,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const bar = page
        .locator(`[data-component='snackbar'][data-variant='${variant}']`)
        .first();
      await expect(bar).toBeVisible();
      const bg = await bar.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("filled label paints inverse-on-surface", async ({ page }) => {
    await page.goto(storyUrl("feedback-snackbar--variants"));
    const bar = page
      .locator("[data-component='snackbar'][data-variant='filled']")
      .first();
    const color = await bar.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_INVERSE_ON_SURFACE);
  });

  test("outlined variant paints a 1dp outline border", async ({ page }) => {
    await page.goto(storyUrl("feedback-snackbar--variants"));
    const bar = page
      .locator("[data-component='snackbar'][data-variant='outlined']")
      .first();
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.borderTopWidth,
        color: cs.borderTopColor,
      };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE);
  });

  test("elevated variant lifts to the elevation-3 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--variants"));
    const bar = page
      .locator("[data-component='snackbar'][data-variant='elevated']")
      .first();
    const shadow = await bar.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("size scale matches density: 40 / 48 / 56 px shell heights", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const bar = page
          .locator(`[data-component='snackbar'][data-size='${size}']`)
          .first();
        await expect(bar).toBeVisible();
        return bar.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(heights).toEqual(["40px", "48px", "56px"]);
  });

  test("size scale steps body type role: body-s / body-m / body-l", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--sizes"));
    const expected: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    for (const [size, fontSize] of Object.entries(expected)) {
      const message = page
        .locator(
          `[data-component='snackbar'][data-size='${size}'] [data-slot='message']`,
        )
        .first();
      const measured = await message.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );
      expect(measured, `size=${size}`).toBe(fontSize);
    }
  });

  test("disabled snackbar dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--states"));
    const bar = page
      .locator("[data-component='snackbar'][data-disabled='true']")
      .first();
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const bar = page
        .locator(`[data-component='snackbar'][data-shape='${shape}']`)
        .first();
      const radius = await bar.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("leading icon slot renders inside the bar with size token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--slots"));
    const icon = page
      .locator("[data-component='snackbar'] [data-slot='icon']")
      .first();
    await expect(icon).toBeVisible();
    const dims = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.width, height: cs.height };
    });
    expect(dims.width).toBe("20px");
    expect(dims.height).toBe("20px");
  });

  test("action slot is positioned at the trailing edge with inverse-primary text", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--slots"));
    const action = page
      .locator(
        "[data-component='snackbar'][data-variant='filled'] [data-slot='action']",
      )
      .first();
    await expect(action).toBeVisible();
    const color = await action.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_INVERSE_PRIMARY);
  });

  test("close affordance renders when showClose is true", async ({ page }) => {
    await page.goto(storyUrl("feedback-snackbar--slots"));
    const close = page
      .locator("[data-component='snackbar'] [data-slot='close']")
      .first();
    await expect(close).toBeVisible();
    await expect(close).toHaveAttribute("aria-label", "Close");
  });

  test("M3 motion: emphasized easing + medium2 duration on container", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-snackbar--motion", "light", "no-preference"),
    );
    const bar = page.locator("[data-component='snackbar']").first();
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.property).toContain("box-shadow");
    expect(styles.duration).toContain("0.3s");
  });

  test("snackbar exposes role=status + polite live region by default", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--default"));
    const bar = page.locator("[data-component='snackbar']").first();
    await expect(bar).toHaveAttribute("role", "status");
    await expect(bar).toHaveAttribute("aria-live", "polite");
    await expect(bar).toHaveAttribute("aria-atomic", "true");
  });

  test("Escape key with focus inside dismisses the snackbar", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--motion", "light", "reduce"));
    const close = page
      .locator("[data-component='snackbar'] [data-slot='close']")
      .first();
    await close.focus();
    await page.keyboard.press("Escape");
    await expect(
      page.locator("[data-component='snackbar']"),
    ).toHaveCount(0);
  });

  test("dark theme swaps the filled host to the dark inverse-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--default", "dark"));
    const bar = page.locator("[data-component='snackbar']").first();
    const bg = await bar.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_INVERSE_SURFACE);
  });

  test("tonal label paints on-surface (non-inverse swatch)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--variants"));
    const bar = page
      .locator("[data-component='snackbar'][data-variant='tonal']")
      .first();
    const color = await bar.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE);
  });

  test("playground story renders the bar + close affordance", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-snackbar--playground"));
    const bar = page.locator("[data-component='snackbar']").first();
    await expect(bar).toBeVisible();
    const close = bar.locator("[data-slot='close']");
    await expect(close).toHaveCount(1);
  });
});
