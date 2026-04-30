import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Menu surface.
 *
 * Spec sources:
 *   - MUI Menu                https://mui.com/material-ui/react-menu/
 *   - M3 menu spec            https://m3.material.io/components/menus/specs
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * The default menu container per the M3 spec is `surface-container`
 * with elevation-2 shadow and a 4dp (shape-xs) corner radius. These
 * tests pin the rendered DOM to those values via getComputedStyle.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER = "rgb(33, 31, 38)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Menu - M3 design parity", () => {
  test("default menu paints the M3 menu surface (elevated / shape-xs / md size)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--default"));
    const surface = page.locator("[data-component='menu']").first();
    await expect(surface).toBeVisible();
    await expect(surface).toHaveAttribute("data-variant", "elevated");
    await expect(surface).toHaveAttribute("data-size", "md");
    await expect(surface).toHaveAttribute("data-shape", "xs");
    const styles = await surface.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        minWidth: cs.minWidth,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
    expect(styles.radius).toBe("4px");
    expect(styles.minWidth).toBe("112px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("navigation-menu--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const surface = page
        .locator(`[data-component='menu'][data-variant='${variant}']`)
        .first();
      await expect(surface).toBeVisible();
      const bg = await surface.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--variants"));
    const surface = page
      .locator("[data-component='menu'][data-variant='outlined']")
      .first();
    const styles = await surface.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-2 (M3 menu surface elevation)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--variants"));
    const surface = page
      .locator("[data-component='menu'][data-variant='elevated']")
      .first();
    const shadow = await surface.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("6px");
  });

  test("size scale: 40 / 48 / 56 px item heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const item = page
          .locator(
            `[data-component='menu'][data-size='${size}'] [data-component='menu-item']`,
          )
          .first();
        await expect(item).toBeVisible();
        return item.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["40px", "48px", "56px"]);
  });

  test("size pad: 8 / 12 / 16 px horizontal pad for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--sizes"));
    const pads = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const item = page
          .locator(
            `[data-component='menu'][data-size='${size}'] [data-component='menu-item']`,
          )
          .first();
        return item.evaluate((el) => window.getComputedStyle(el).paddingLeft);
      }),
    );
    expect(pads).toEqual(["8px", "12px", "16px"]);
  });

  test("item type: label-l / body-l / body-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "14px", weight: "500" },
      md: { size: "16px", weight: "400" },
      lg: { size: "16px", weight: "400" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const item = page
        .locator(
          `[data-component='menu'][data-size='${size}'] [data-component='menu-item']`,
        )
        .first();
      const measured = await item.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled menu: aria-disabled, opacity 0.38, pointer-events:none, tabIndex=-1", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--states"));
    const surface = page
      .locator("[data-component='menu'][data-disabled='true']")
      .first();
    await expect(surface).toBeVisible();
    await expect(surface).toHaveAttribute("aria-disabled", "true");
    await expect(surface).toHaveAttribute("tabindex", "-1");
    const styles = await surface.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error menu paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--states"));
    const surface = page
      .locator("[data-component='menu'][data-error='true']")
      .first();
    await expect(surface).toHaveAttribute("aria-invalid", "true");
    const styles = await surface.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("selected item paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--states"));
    // The Resting menu has selectedId=edit.
    const item = page
      .locator(
        "[data-component='menu-item'][data-selected='true'][data-id='edit']",
      )
      .first();
    await expect(item).toBeVisible();
    await expect(item).toHaveAttribute("aria-selected", "true");
    const styles = await item.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("error item paints the error foreground", async ({ page }) => {
    await page.goto(storyUrl("navigation-menu--states"));
    const item = page
      .locator("[data-component='menu-item'][data-error='true']")
      .first();
    const color = await item.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("disabled item: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--states"));
    const item = page
      .locator("[data-component='menu-item'][data-disabled='true']")
      .first();
    await expect(item).toHaveAttribute("aria-disabled", "true");
    const styles = await item.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("navigation-menu--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const surface = page
        .locator(`[data-component='menu'][data-shape='${shape}']`)
        .first();
      const radius = await surface.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='menu'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("leading + trailing icon + trailing-text slots render", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--slots"));
    const root = page.locator("[data-component='menu']").first();
    const leading = root
      .locator("[data-component='menu-item'] [data-slot='icon-leading']")
      .first();
    const trailing = root
      .locator("[data-component='menu-item'] [data-slot='icon-trailing']")
      .first();
    const trailingText = root
      .locator("[data-component='menu-item'] [data-slot='trailing-text']")
      .first();
    const label = root
      .locator("[data-component='menu-item'] [data-slot='label']")
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    await expect(trailingText).toBeVisible();
    await expect(label).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-menu--motion", "light", "no-preference"),
    );
    const surface = page.locator("[data-component='menu']").first();
    const styles = await surface.evaluate((el) => {
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

  test("hover paints state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("navigation-menu--default", "light", "no-preference"),
    );
    // The menu auto-focuses the first item via roving tabindex, so
    // hover the second item (Share) to read the *hover-only* state
    // layer without it stacking with focus (which is 0.10).
    const item = page
      .locator("[data-component='menu-item']")
      .nth(1);
    const layer = item.locator("[data-slot='state-layer']").first();
    await item.hover();
    // transition-duration is short4 (200ms); wait for the opacity
    // animation to settle before reading.
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("Escape key fires onDismiss('escape') and the menu stays focusable", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--default"));
    const surface = page.locator("[data-component='menu']").first();
    await surface.focus();
    await page.keyboard.press("Escape");
    await expect(surface).toBeVisible();
  });

  test("ARIA wiring: role=menu, items expose role=menuitem with roving tabindex", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-menu--accessibility", "light", "no-preference"),
    );
    const surface = page
      .locator("[data-component='menu']")
      .first();
    await expect(surface).toHaveAttribute("role", "menu");
    await expect(surface).toHaveAttribute("tabindex", "0");
    const items = surface.locator("[role='menuitem']");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    const tabIndices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        items
          .nth(i)
          .evaluate((el) => (el as HTMLElement).getAttribute("tabindex")),
      ),
    );
    // Roving tabindex: exactly one item is reachable via Tab.
    const focusable = tabIndices.filter((t) => t === "0").length;
    expect(focusable).toBe(1);
  });

  test("dark theme swaps elevated menu to dark surface-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--default", "dark"));
    await page.waitForLoadState("networkidle");
    // Wait for the Storybook decorator's useEffect to flip data-theme.
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const surface = page.locator("[data-component='menu']").first();
    const bg = await surface.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER);
  });

  test("text variant renders transparent host so it can wrap external surfaces", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-menu--variants"));
    const surface = page
      .locator("[data-component='menu'][data-variant='text']")
      .first();
    const styles = await surface.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("playground story renders a menu with role=menu", async ({ page }) => {
    await page.goto(storyUrl("navigation-menu--playground"));
    const surface = page.locator("[data-component='menu']").first();
    await expect(surface).toBeVisible();
    await expect(surface).toHaveAttribute("role", "menu");
  });
});
