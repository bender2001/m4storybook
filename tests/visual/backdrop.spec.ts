import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Backdrop.
 *
 * Spec (closest M3 analog): the scrim used by dialogs / modal sheets
 * (https://m3.material.io/components/dialogs/specs).
 *
 * Variants:
 *   - filled    : scrim color (#000) at the size opacity
 *   - tonal     : surface-container-highest at the size opacity
 *   - outlined  : transparent + 1dp outline border, no veil
 *   - invisible : transparent, no border, opacity 1 (still blocks clicks)
 *
 * Sizes drive the resting opacity per M3 dialog scrim guidance:
 *   sm 0.16 / md 0.32 (default) / lg 0.56
 *
 * Shape default: shape-none (full-viewport rect).
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const SCRIM = "rgb(0, 0, 0)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Backdrop - M3 design parity", () => {
  test("default renders a filled / md backdrop with role=presentation + scrim opacity 0.32", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--default"));
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toBeVisible();
    await expect(backdrop).toHaveAttribute("data-variant", "filled");
    await expect(backdrop).toHaveAttribute("data-size", "md");
    await expect(backdrop).toHaveAttribute("data-shape", "none");
    await expect(backdrop).toHaveAttribute("role", "presentation");
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        opacity: cs.opacity,
      };
    });
    expect(styles.radius).toBe("0px");
    expect(styles.bg).toBe(SCRIM);
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.32, 2);
  });

  test("filled variant paints the scrim token at the size opacity", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--variants"));
    const backdrop = page
      .locator("[data-component='backdrop'][data-variant='filled']")
      .first();
    await expect(backdrop).toBeVisible();
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, opacity: cs.opacity };
    });
    expect(styles.bg).toBe(SCRIM);
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.32, 2);
  });

  test("tonal variant paints surface-container-highest at the size opacity", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--variants"));
    const backdrop = page
      .locator("[data-component='backdrop'][data-variant='tonal']")
      .first();
    await expect(backdrop).toBeVisible();
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, opacity: cs.opacity };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.32, 2);
  });

  test("outlined variant: transparent fill + 1dp outline border + opacity 1", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--variants"));
    const backdrop = page
      .locator("[data-component='backdrop'][data-variant='outlined']")
      .first();
    await expect(backdrop).toBeVisible();
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        borderWidth: cs.borderTopWidth,
        opacity: cs.opacity,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(styles.borderWidth).toBe("1px");
    expect(parseFloat(styles.opacity)).toBeCloseTo(1, 2);
  });

  test("invisible variant: transparent fill + transparent border + opacity 1", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--variants"));
    const backdrop = page
      .locator("[data-component='backdrop'][data-variant='invisible']")
      .first();
    await expect(backdrop).toBeVisible();
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        opacity: cs.opacity,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(TRANSPARENT);
    expect(parseFloat(styles.opacity)).toBeCloseTo(1, 2);
  });

  test("size scale matches M3 dialog scrim opacities (sm 0.16 / md 0.32 / lg 0.56)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--sizes"));
    const matrix: Record<string, number> = {
      sm: 0.16,
      md: 0.32,
      lg: 0.56,
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const backdrop = page
        .locator(`[data-component='backdrop'][data-size='${size}']`)
        .first();
      await expect(backdrop).toBeVisible();
      const opacity = await backdrop.evaluate(
        (el) => window.getComputedStyle(el).opacity,
      );
      expect(parseFloat(opacity), `size=${size}`).toBeCloseTo(expected, 2);
    }
  });

  test("disabled state dims the backdrop to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--states"));
    const backdrop = page
      .locator("[data-component='backdrop'][data-disabled='true']")
      .first();
    await expect(backdrop).toBeVisible();
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--shapes"));
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
      const backdrop = page
        .locator(`[data-component='backdrop'][data-shape='${shape}']`)
        .first();
      await expect(backdrop).toBeVisible();
      const radius = await backdrop.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("contained variant uses absolute positioning instead of fixed", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--default"));
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toHaveAttribute("data-contained", "true");
    const position = await backdrop.evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(position).toBe("absolute");
  });

  test("centered content slot renders in the middle of the scrim", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--slots"));
    const slot = page.locator("[data-slot='content']").first();
    await expect(slot).toBeVisible();
    const styles = await slot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentDisplay = parent
        ? window.getComputedStyle(parent).display
        : "";
      const parentJustify = parent
        ? window.getComputedStyle(parent).justifyContent
        : "";
      const parentItems = parent
        ? window.getComputedStyle(parent).alignItems
        : "";
      return {
        textAlign: cs.textAlign,
        parentDisplay,
        parentJustify,
        parentItems,
      };
    });
    expect(styles.textAlign).toBe("center");
    expect(styles.parentDisplay).toBe("flex");
    expect(styles.parentJustify).toBe("center");
    expect(styles.parentItems).toBe("center");
  });

  test("click on the scrim fires onClose and unmounts via AnimatePresence", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-backdrop--motion", "light", "no-preference"),
    );
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toBeVisible();
    const surface = page.locator("[data-host='backdrop-surface']").first();
    const box = await surface.boundingBox();
    if (!box) throw new Error("surface bounding box missing");
    // Click in a corner of the surface — guaranteed to land on the
    // scrim itself, not the centered content slot.
    await page.mouse.click(box.x + 8, box.y + 8);
    await expect(page.locator("[data-component='backdrop']")).toHaveCount(0);
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-backdrop--default", "light", "no-preference"),
    );
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toBeVisible();
    const styles = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.property).toContain("opacity");
    expect(styles.duration).toContain("0.3s");
  });

  test("ARIA: backdrop renders with role=presentation by default", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--accessibility"));
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toBeVisible();
    await expect(backdrop).toHaveAttribute("role", "presentation");
    const tabIndex = await backdrop.evaluate((el) =>
      el.getAttribute("tabindex"),
    );
    expect(tabIndex).toBe("-1");
  });

  test("invisible flag forces the invisible variant regardless of variant prop", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--states"));
    const invisible = page
      .locator("[data-component='backdrop'][data-invisible='true']")
      .first();
    await expect(invisible).toBeVisible();
    const styles = await invisible.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderColor };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(TRANSPARENT);
  });

  test("dark theme swaps the tonal backdrop to dark surface-container-highest", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--variants", "dark"));
    const backdrop = page
      .locator("[data-component='backdrop'][data-variant='tonal']")
      .first();
    await expect(backdrop).toBeVisible();
    const bg = await backdrop.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("playground story renders + accepts a runtime variant control", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--playground"));
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toBeVisible();
    await expect(backdrop.locator("[data-slot='content']")).toHaveCount(1);
  });

  test("z-index: scrim layer sits above neighboring content", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-backdrop--default"));
    const backdrop = page.locator("[data-component='backdrop']").first();
    const z = await backdrop.evaluate(
      (el) => window.getComputedStyle(el).zIndex,
    );
    expect(z).toBe("50");
  });

  test("Escape key with focus inside the backdrop fires onClose", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-backdrop--motion", "light", "no-preference"),
    );
    const backdrop = page.locator("[data-component='backdrop']").first();
    await expect(backdrop).toBeVisible();
    await backdrop.focus();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-component='backdrop']")).toHaveCount(0);
  });
});
