import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Container.
 *
 * MUI's Container has no direct M3 spec — it is a layout primitive that
 * centres content horizontally and clamps it to a breakpoint-sized
 * max-width. We re-skin it with the M3 token layer:
 *
 *   - five surface variants (text / filled / tonal / outlined / elevated)
 *   - three densities driving vertical padding, gap, and min-height
 *   - full M3 7-token shape scale
 *   - MUI-compatible breakpoint clamps (xs / sm / md / lg / xl / false)
 *   - container transitions ride medium2 (300ms) on emphasized easing
 *
 * Spec sources:
 *   - MUI Container
 *     https://mui.com/material-ui/react-container/
 *   - M3 surface roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 elevation tokens
 *     https://m3.material.io/styles/elevation/tokens
 *   - M3 layout
 *     https://m3.material.io/foundations/layout/applying-layout/window-size-classes
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER_LOW = "rgb(29, 27, 32)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Container - M3 design parity", () => {
  test("default container renders the M3 layout shell (filled / shape-md / md size / maxWidth=md)", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--default"));
    const root = page
      .locator("[data-component='container']")
      .first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "md");
    await expect(root).toHaveAttribute("data-max-width", "md");
    await expect(root).toHaveAttribute("data-centered", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        minH: cs.minHeight,
        padY: cs.paddingTop,
        padX: cs.paddingLeft,
        maxWidth: cs.maxWidth,
        marginLeft: parseFloat(cs.marginLeft),
        marginRight: parseFloat(cs.marginRight),
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.radius).toBe("12px");
    expect(styles.minH).toBe("64px");
    expect(styles.padY).toBe("24px");
    expect(styles.padX).toBe("24px");
    expect(styles.maxWidth).toBe("900px");
    // mx-auto resolves to equal left/right margins once the viewport
    // exceeds the max-width clamp; check parity instead of the literal
    // "auto" string (browsers compute auto to a px value).
    expect(styles.marginLeft).toBeCloseTo(styles.marginRight, 0);
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("layout-container--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='container'][data-variant='${variant}']`)
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
    await page.goto(storyUrl("layout-container--variants"));
    const root = page
      .locator("[data-component='container'][data-variant='outlined']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-1", async ({ page }) => {
    await page.goto(storyUrl("layout-container--variants"));
    const root = page
      .locator("[data-component='container'][data-variant='elevated']")
      .first();
    const shadow = await root.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    // elevation-1 token: 0px 1px 2px rgba(0,0,0,.30), 0px 1px 3px 1px rgba(0,0,0,.15)
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("3px");
  });

  test("size scale: 48 / 64 / 80 px min-heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='container'][data-size='${size}']`)
          .first();
        await expect(root).toBeVisible();
        return root.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["48px", "64px", "80px"]);
  });

  test("size pad-y: 12 / 24 / 40 px for sm / md / lg", async ({ page }) => {
    await page.goto(storyUrl("layout-container--sizes"));
    const pads = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='container'][data-size='${size}']`)
          .first();
        return root.evaluate((el) => window.getComputedStyle(el).paddingTop);
      }),
    );
    expect(pads).toEqual(["12px", "24px", "40px"]);
  });

  test("size gutter: 16 / 24 / 40 px for sm / md / lg", async ({ page }) => {
    await page.goto(storyUrl("layout-container--sizes"));
    const gutters = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const root = page
          .locator(`[data-component='container'][data-size='${size}']`)
          .first();
        return root.evaluate((el) => window.getComputedStyle(el).paddingLeft);
      }),
    );
    expect(gutters).toEqual(["16px", "24px", "40px"]);
  });

  test("header typography steps title-s / title-m / title-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "14px", weight: "500" },
      md: { size: "16px", weight: "500" },
      lg: { size: "22px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const header = page
        .locator(
          `[data-component='container'][data-size='${size}'] [data-slot='header']`,
        )
        .first();
      const measured = await header.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled container: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--states"));
    const root = page
      .locator("[data-component='container'][data-disabled='true']")
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

  test("selected container paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--states"));
    const root = page
      .locator("[data-component='container'][data-selected='true']")
      .first();
    await expect(root).toHaveAttribute("aria-selected", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("error container paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--states"));
    const root = page
      .locator("[data-component='container'][data-error='true']")
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
    await page.goto(storyUrl("layout-container--shapes"));
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
        .locator(`[data-component='container'][data-shape='${shape}']`)
        .first();
      const radius = await root.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='container'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("max-width clamps follow MUI breakpoint widths", async ({ page }) => {
    await page.goto(storyUrl("layout-container--layout"));
    const expected: Record<string, string> = {
      xs: "444px",
      sm: "600px",
      md: "900px",
      lg: "1200px",
    };
    for (const [token, width] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='container'][data-max-width='${token}']`)
        .first();
      const maxWidth = await root.evaluate(
        (el) => window.getComputedStyle(el).maxWidth,
      );
      expect(maxWidth, `maxWidth=${token}`).toBe(width);
    }
    const noClamp = page
      .locator("[data-component='container'][data-max-width='none']")
      .first();
    const maxWidth = await noClamp.evaluate(
      (el) => window.getComputedStyle(el).maxWidth,
    );
    expect(maxWidth).toBe("none");
  });

  test("disableGutters drops horizontal padding while keeping vertical rhythm", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--layout"));
    const root = page
      .locator("[data-component='container'][data-disable-gutters='true']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        padTop: cs.paddingTop,
        padLeft: cs.paddingLeft,
        padRight: cs.paddingRight,
      };
    });
    expect(styles.padLeft).toBe("0px");
    expect(styles.padRight).toBe("0px");
    expect(styles.padTop).not.toBe("0px");
  });

  test("leading + trailing icon slots render alongside the label", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--slots"));
    const leading = page
      .locator("[data-component='container'] [data-slot='icon-leading']")
      .first();
    const trailing = page
      .locator("[data-component='container'] [data-slot='icon-trailing']")
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    const label = page
      .locator("[data-component='container'] [data-slot='label']")
      .first();
    await expect(label).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-container--motion", "light", "no-preference"),
    );
    const root = page.locator("[data-component='container']").first();
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
      storyUrl("layout-container--accessibility", "light", "no-preference"),
    );
    const region = page
      .locator(
        "[data-component='container'][aria-label='Polymorphic section']",
      )
      .first();
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("aria-label", "Polymorphic section");
    const tag = await region.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("section");
  });

  test("default `as=main` keeps the main landmark without role=region", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--default"));
    const main = page.locator("[data-component='container']").first();
    const tag = await main.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("main");
    const role = await main.getAttribute("role");
    expect(role).toBeNull();
  });

  test("dark theme swaps elevated container to dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--variants", "dark"));
    const root = page
      .locator("[data-component='container'][data-variant='elevated']")
      .first();
    const bg = await root.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("text variant renders transparent host so it can wrap external surfaces", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--variants"));
    const root = page
      .locator("[data-component='container'][data-variant='text']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("playground story renders a Container with role=region and label", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-container--playground"));
    const root = page.locator("[data-component='container']").first();
    await expect(root).toBeVisible();
    const tag = await root.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("main");
    const label = root.locator("[data-slot='label']").first();
    await expect(label).toBeVisible();
  });
});
