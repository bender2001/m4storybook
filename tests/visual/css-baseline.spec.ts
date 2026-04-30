import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized CssBaseline.
 *
 * MUI's CssBaseline is a global reset that paints `<body>` with the
 * theme's surface + on-surface colors, zeroes the body margin, applies
 * antialiased font smoothing, and sets `* { box-sizing: border-box }`.
 * M3 has no equivalent component, so we re-skin it as a polymorphic
 * scoped reset shell that exposes:
 *
 *   - five surface variants (text / filled / tonal / outlined / elevated)
 *   - three densities driving padding, gap, min-height, and the body
 *     type role used as the baseline reset
 *   - full M3 7-token shape scale
 *   - `enableColorScheme` mirrors MUI's prop
 *   - reset transitions ride medium2 (300ms) on emphasized easing
 *
 * Spec sources:
 *   - MUI CssBaseline    https://mui.com/material-ui/react-css-baseline/
 *   - M3 surface roles   https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 type scale      https://m3.material.io/styles/typography/type-scale-tokens
 *   - M3 elevation       https://m3.material.io/styles/elevation/tokens
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE = "rgb(20, 18, 24)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("CssBaseline - M3 design parity", () => {
  test("default css-baseline renders the M3 reset shell (filled / shape-none / md size)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--default"));
    const root = page
      .locator("[data-component='css-baseline']")
      .first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "none");
    await expect(root).toHaveAttribute("data-scoped", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        margin: cs.margin,
        radius: cs.borderTopLeftRadius,
        minH: cs.minHeight,
        pad: cs.paddingTop,
        fontSize: cs.fontSize,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.margin).toBe("0px");
    expect(styles.radius).toBe("0px");
    expect(styles.minH).toBe("64px");
    expect(styles.pad).toBe("24px");
    expect(styles.fontSize).toBe("14px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-css-baseline--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='css-baseline'][data-variant='${variant}']`)
        .first();
      await expect(root).toBeVisible();
      const bg = await root.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--variants"));
    const root = page
      .locator("[data-component='css-baseline'][data-variant='outlined']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-1", async ({ page }) => {
    await page.goto(storyUrl("utils-css-baseline--variants"));
    const root = page
      .locator("[data-component='css-baseline'][data-variant='elevated']")
      .first();
    const shadow = await root.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("3px");
  });

  test("size scale: 48 / 64 / 80 px min-heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='css-baseline'][data-size='${size}']`)
          .first();
        await expect(root).toBeVisible();
        return root.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["48px", "64px", "80px"]);
  });

  test("size pad: 12 / 24 / 40 px for sm / md / lg", async ({ page }) => {
    await page.goto(storyUrl("utils-css-baseline--sizes"));
    const pads = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='css-baseline'][data-size='${size}']`)
          .first();
        return root.evaluate((el) => window.getComputedStyle(el).paddingTop);
      }),
    );
    expect(pads).toEqual(["12px", "24px", "40px"]);
  });

  test("body type role steps body-s / body-m / body-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--sizes"));
    const expected: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    for (const [size, fontSize] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='css-baseline'][data-size='${size}']`)
        .first();
      const measured = await root.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );
      expect(measured, `size=${size}`).toBe(fontSize);
    }
  });

  test("header typography steps title-s / title-m / title-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "14px", weight: "500" },
      md: { size: "16px", weight: "500" },
      lg: { size: "22px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const header = page
        .locator(
          `[data-component='css-baseline'][data-size='${size}'] [data-slot='header']`,
        )
        .first();
      const measured = await header.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled baseline: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--states"));
    const root = page
      .locator("[data-component='css-baseline'][data-disabled='true']")
      .first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("aria-disabled", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("selected baseline paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--states"));
    const root = page
      .locator("[data-component='css-baseline'][data-selected='true']")
      .first();
    await expect(root).toHaveAttribute("aria-selected", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("error baseline paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--states"));
    const root = page
      .locator("[data-component='css-baseline'][data-error='true']")
      .first();
    await expect(root).toHaveAttribute("aria-invalid", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-css-baseline--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='css-baseline'][data-shape='${shape}']`)
        .first();
      const radius = await root.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='css-baseline'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("box-sizing reset: descendant elements honour border-box", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--default"));
    const body = page
      .locator("[data-component='css-baseline'] [data-slot='body']")
      .first();
    const sizing = await body.evaluate(
      (el) => window.getComputedStyle(el).boxSizing,
    );
    expect(sizing).toBe("border-box");
  });

  test("enableColorScheme writes color-scheme: light dark on the host", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--color-scheme"));
    const root = page
      .locator(
        "[data-component='css-baseline'][data-enable-color-scheme='true']",
      )
      .first();
    const scheme = await root.evaluate(
      (el) => window.getComputedStyle(el).colorScheme,
    );
    expect(scheme).toContain("light");
    expect(scheme).toContain("dark");
  });

  test("scoped reset host zeroes the host margin", async ({ page }) => {
    await page.goto(storyUrl("utils-css-baseline--default"));
    const root = page
      .locator("[data-component='css-baseline']")
      .first();
    const margin = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return [cs.marginTop, cs.marginBottom, cs.marginLeft, cs.marginRight];
    });
    expect(margin).toEqual(["0px", "0px", "0px", "0px"]);
  });

  test("antialiased font smoothing is applied to the host", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--default"));
    const root = page
      .locator("[data-component='css-baseline']")
      .first();
    const smoothing = await root.evaluate(
      (el) =>
        window
          .getComputedStyle(el)
          .getPropertyValue("-webkit-font-smoothing"),
    );
    expect(smoothing).toBe("antialiased");
  });

  test("leading + trailing icon slots render alongside the label", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--slots"));
    const leading = page
      .locator("[data-component='css-baseline'] [data-slot='icon-leading']")
      .first();
    const trailing = page
      .locator("[data-component='css-baseline'] [data-slot='icon-trailing']")
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    const label = page
      .locator("[data-component='css-baseline'] [data-slot='label']")
      .first();
    await expect(label).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on baseline transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-css-baseline--motion", "light", "no-preference"),
    );
    const root = page.locator("[data-component='css-baseline']").first();
    const styles = await root.evaluate((el) => {
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

  test("polymorphic `as=section` mounts as a labelled region landmark", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-css-baseline--accessibility", "light", "no-preference"),
    );
    const region = page
      .locator(
        "[data-component='css-baseline'][aria-label='Polymorphic section']",
      )
      .first();
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("aria-label", "Polymorphic section");
    const tag = await region.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("section");
  });

  test("override `as=div` drops the region role", async ({ page }) => {
    await page.goto(
      storyUrl("utils-css-baseline--accessibility", "light", "no-preference"),
    );
    const div = page
      .locator("[data-component='css-baseline']")
      .nth(1);
    const tag = await div.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("div");
    const role = await div.getAttribute("role");
    expect(role).toBeNull();
  });

  test("dark theme swaps filled baseline to dark surface", async ({ page }) => {
    await page.goto(storyUrl("utils-css-baseline--variants", "dark"));
    const root = page
      .locator("[data-component='css-baseline'][data-variant='filled']")
      .first();
    const bg = await root.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE);
  });

  test("text variant renders transparent host so it can wrap external surfaces", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--variants"));
    const root = page
      .locator("[data-component='css-baseline'][data-variant='text']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("playground story renders a CssBaseline with role=region and label", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-css-baseline--playground"));
    const root = page.locator("[data-component='css-baseline']").first();
    await expect(root).toBeVisible();
    const tag = await root.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("section");
    const label = root.locator("[data-slot='label']").first();
    await expect(label).toBeVisible();
  });
});
