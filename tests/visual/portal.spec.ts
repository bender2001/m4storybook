import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Portal.
 *
 * Portal is the structural MUI primitive
 * (https://mui.com/material-ui/react-portal/) that teleports its
 * children into a target container (defaults to `document.body`).
 * Re-skinned onto the M3 modal / surface tokens
 * (https://m3.material.io/styles/elevation/applying-elevation).
 *
 * Variants:
 *   - standard : surface-container-highest + elevation-1 + md radius (default)
 *   - tonal    : secondary-container + elevation-1 + md radius
 *   - outlined : transparent + 1dp outline-variant border + elevation-0
 *   - text     : transparent fill + no border + elevation-0
 *   - elevated : surface-container-low + elevation-3 + md radius
 *
 * Key tokens:
 *   - default shape : md (12dp, M3 portal/dialog surface radius)
 *   - default size  : md (240..480px wide, M3 modal band)
 *   - body type     : body-m (14px)
 *   - label type    : label-l (14px / 20px line-height / 500 weight)
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
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Portal - M3 design parity", () => {
  test("default renders standard / md / md with role=presentation and teleports into the host", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--default"));
    const portal = page.locator("[data-component='portal']").first();
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-variant", "standard");
    await expect(portal).toHaveAttribute("data-size", "md");
    await expect(portal).toHaveAttribute("data-shape", "md");
    await expect(portal).toHaveAttribute("data-portal", "teleport");
    await expect(portal).toHaveAttribute("role", "presentation");

    // The portal target is the in-canvas Surface host, so the portal
    // surface must be a descendant of that host.
    const inHost = await portal.evaluate((el) => {
      const host = el.closest("[data-host='portal-surface']");
      return Boolean(host);
    });
    expect(inHost).toBe(true);

    const styles = await portal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        minWidth: cs.minWidth,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
    expect(styles.minWidth).toBe("240px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-portal--variants"));
    const expected: Record<string, string> = {
      standard: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      text: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const portal = page
        .locator(`[data-component='portal'][data-variant='${variant}']`)
        .first();
      await expect(portal).toBeVisible();
      const bg = await portal.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--variants"));
    const portal = page
      .locator("[data-component='portal'][data-variant='outlined']")
      .first();
    const styles = await portal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.borderTopWidth,
        color: cs.borderTopColor,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
  });

  test("text variant: transparent fill + on-surface foreground", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--variants"));
    const portal = page
      .locator("[data-component='portal'][data-variant='text']")
      .first();
    const styles = await portal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
  });

  test("elevated variant lifts to elevation-3", async ({ page }) => {
    await page.goto(storyUrl("utils-portal--variants"));
    const portal = page
      .locator("[data-component='portal'][data-variant='elevated']")
      .first();
    const shadow = await portal.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("size scale enforces M3 width bands (sm 320 / md 480 / lg 640 px max)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--sizes"));
    const matrix: Record<string, string> = {
      sm: "320px",
      md: "480px",
      lg: "640px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const portal = page
        .locator(`[data-component='portal'][data-size='${size}']`)
        .first();
      await expect(portal).toBeVisible();
      const maxWidth = await portal.evaluate(
        (el) => window.getComputedStyle(el).maxWidth,
      );
      expect(maxWidth, `size=${size}`).toBe(expected);
    }
  });

  test("size scale enforces min-widths (sm 160 / md 240 / lg 320)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--sizes"));
    const matrix: Record<string, string> = {
      sm: "160px",
      md: "240px",
      lg: "320px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const portal = page
        .locator(`[data-component='portal'][data-size='${size}']`)
        .first();
      const minWidth = await portal.evaluate(
        (el) => window.getComputedStyle(el).minWidth,
      );
      expect(minWidth, `size=${size}`).toBe(expected);
    }
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-portal--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
      full: "9999px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const portal = page
        .locator(`[data-component='portal'][data-shape='${shape}']`)
        .first();
      await expect(portal).toBeVisible();
      const radius = await portal.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("disabled portal: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-portal--states", "light", "no-preference"),
    );
    const portal = page
      .locator("[data-component='portal'][data-disabled='true']")
      .first();
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("aria-disabled", "true");
    // Wait past the 300ms entrance tween so opacity settles.
    await page.waitForTimeout(450);
    const styles = await portal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error portal paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--states"));
    const portal = page
      .locator("[data-component='portal'][data-error='true']")
      .first();
    await expect(portal).toHaveAttribute("aria-invalid", "true");
    const styles = await portal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("selected portal paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--states"));
    const portal = page
      .locator("[data-component='portal'][data-selected='true']")
      .first();
    await expect(portal).toHaveAttribute("aria-selected", "true");
    const styles = await portal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("label slot uses label-l and aria-describedby points at the body content", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--slots"));
    const portal = page
      .locator("[data-component='portal']", {
        has: page.locator("[data-slot='label']"),
      })
      .first();
    const label = portal.locator("[data-slot='label']").first();
    await expect(label).toBeVisible();
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        weight: cs.fontWeight,
      };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.lineHeight).toBe("20px");
    expect(styles.weight).toBe("500");
    const describedBy = await portal.getAttribute("aria-describedby");
    const content = portal.locator("[data-slot='content']").first();
    const contentId = await content.getAttribute("id");
    expect(describedBy).toBe(contentId);
  });

  test("disablePortal renders inline (no createPortal teleport)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--inline-mode"));
    const portal = page
      .locator("[data-component='portal'][data-portal='inline']")
      .first();
    await expect(portal).toBeVisible();
    // Inline portals do NOT teleport — they should NOT be inside a
    // [data-host='portal-surface'] container (the story Surface
    // doesn't host inline portals).
    const inHost = await portal.evaluate((el) => {
      const host = el.closest("[data-host='portal-surface']");
      return Boolean(host);
    });
    expect(inHost).toBe(false);
  });

  test("surface=false skips the M3 wrapper and teleports raw children", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--raw-teleport"));
    const raw = page.locator("[data-component='portal-raw']").first();
    await expect(raw).toBeVisible();
    // No M3 surface should render in this story.
    const surfaceCount = await page
      .locator("[data-component='portal']")
      .count();
    expect(surfaceCount).toBe(0);
    // Raw children should still teleport into the host.
    const inHost = await raw.evaluate((el) => {
      const host = el.closest("[data-host='portal-surface']");
      return Boolean(host);
    });
    expect(inHost).toBe(true);
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-portal--motion", "light", "no-preference"),
    );
    const portal = page.locator("[data-component='portal']").first();
    await expect(portal).toBeVisible();
    const styles = await portal.evaluate((el) => {
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

  test("Escape key fires onDismiss('escape') + onClose", async ({ page }) => {
    await page.goto(storyUrl("utils-portal--motion"));
    const portal = page.locator("[data-component='portal']").first();
    await expect(portal).toBeVisible();
    await portal.click();
    await page.keyboard.press("Escape");
    await expect(portal).toHaveCount(0, { timeout: 1000 });
  });

  test("ARIA wiring: role=presentation, focusable surface (tabindex=-1)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--accessibility"));
    const portal = page.locator("[data-component='portal']").first();
    await expect(portal).toHaveAttribute("role", "presentation");
    await expect(portal).toHaveAttribute("tabindex", "-1");
  });

  test("dark theme swaps standard portal to dark surface-container-highest", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--default", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const portal = page.locator("[data-component='portal']").first();
    const bg = await portal.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("playground story renders a portal with role=presentation", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-portal--playground"));
    const portal = page.locator("[data-component='portal']").first();
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("role", "presentation");
    await expect(portal).toHaveAttribute("data-portal", "teleport");
  });

  test("body slot renders body-m typography", async ({ page }) => {
    await page.goto(storyUrl("utils-portal--default"));
    const content = page
      .locator("[data-component='portal'] [data-slot='content']")
      .first();
    await expect(content).toBeVisible();
    const styles = await content.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.lineHeight).toBe("20px");
  });
});
