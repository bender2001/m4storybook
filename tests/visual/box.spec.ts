import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Box.
 *
 * Box is a token-aware layout primitive (M3 Expressive does not
 * specify a Box component — this re-skins MUI's Box with M3 surface,
 * shape, elevation, and motion tokens). These specs assert that:
 *
 *   - the variant matrix paints the right M3 surface roles
 *   - the size matrix sets the documented padding + min-height
 *   - the shape token scale renders the canonical radii
 *   - the interactive mode exposes the M3 state-layer + ARIA wiring
 *   - the elevated variant lifts to the elevation-1 shadow
 *   - the polymorphic `as` prop renders the requested element
 *   - dark theme swaps the surface roles to the dark token set
 *   - the M3 emphasized easing + medium2 duration drive the
 *     container transition
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
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Box - M3 design parity", () => {
  test("default renders a filled box at shape-md / md size with title-m header", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--default"));
    const box = page.locator("[data-component='box']").first();
    await expect(box).toBeVisible();
    await expect(box).toHaveAttribute("data-variant", "filled");
    await expect(box).toHaveAttribute("data-size", "md");
    await expect(box).toHaveAttribute("data-shape", "md");
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        padding: cs.paddingTop,
        minHeight: cs.minHeight,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.padding).toBe("16px");
    expect(styles.minHeight).toBe("48px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("layout-box--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const box = page
        .locator(`[data-component='box'][data-variant='${variant}']`)
        .first();
      await expect(box).toBeVisible();
      const bg = await box.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--variants"));
    const box = page
      .locator("[data-component='box'][data-variant='outlined']")
      .first();
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.borderTopWidth,
        color: cs.borderTopColor,
      };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to the elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--variants"));
    const box = page
      .locator("[data-component='box'][data-variant='elevated']")
      .first();
    const shadow = await box.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale matches density: 32 / 48 / 64 px shell heights", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const box = page
          .locator(`[data-component='box'][data-size='${size}']`)
          .first();
        await expect(box).toBeVisible();
        return box.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["32px", "48px", "64px"]);
  });

  test("size scale steps interior padding 8 / 16 / 24 px", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--sizes"));
    const expected: Record<string, string> = {
      sm: "8px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, pad] of Object.entries(expected)) {
      const box = page
        .locator(`[data-component='box'][data-size='${size}']`)
        .first();
      const measured = await box.evaluate(
        (el) => window.getComputedStyle(el).paddingTop,
      );
      expect(measured, `size=${size}`).toBe(pad);
    }
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const box = page
        .locator(`[data-component='box'][data-shape='${shape}']`)
        .first();
      const radius = await box.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("disabled box dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--states"));
    const box = page
      .locator("[data-component='box'][data-disabled='true']")
      .first();
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error box paints error-container + on-error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--states"));
    const box = page
      .locator("[data-component='box'][data-error='true']")
      .first();
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
    await expect(box).toHaveAttribute("aria-invalid", "true");
  });

  test("selected interactive box paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--states"));
    const box = page
      .locator("[data-component='box'][data-selected='true']")
      .first();
    const styles = await box.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
    await expect(box).toHaveAttribute("aria-selected", "true");
  });

  test("interactive box exposes role=button + tabindex=0 + state-layer slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--states"));
    const box = page
      .locator("[data-component='box'][data-interactive='true']")
      .first();
    await expect(box).toHaveAttribute("role", "button");
    await expect(box).toHaveAttribute("tabindex", "0");
    const stateLayer = box.locator("[data-slot='state-layer']");
    await expect(stateLayer).toHaveCount(1);
  });

  test("interactive box paints state-layer at hover 0.08 opacity", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--motion", "light", "no-preference"));
    const box = page
      .locator("[data-component='box'][data-interactive='true']")
      .first();
    await box.hover();
    await expect(box).toHaveAttribute("data-state-layer-opacity", "0.08");
  });

  test("interactive box morphs the corner shape one notch up on hover", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--motion", "light", "no-preference"));
    const box = page
      .locator("[data-component='box'][data-interactive='true']")
      .first();
    const radiusAtRest = await box.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    await box.hover();
    const radiusOnHover = await box.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radiusAtRest).toBe("12px");
    expect(radiusOnHover).toBe("16px");
  });

  test("focus-visible paints the M3 primary focus ring", async ({ page }) => {
    await page.goto(storyUrl("layout-box--motion", "light", "no-preference"));
    const box = page
      .locator("[data-component='box'][data-interactive='true']")
      .first();
    await box.focus();
    const ringColor = await box.evaluate((el) => {
      const raw = window
        .getComputedStyle(el)
        .getPropertyValue("--tw-ring-color")
        .trim();
      // The ring color resolves to either the M3 primary token's hex
      // value (#6750A4) or its rgb form depending on the browser's
      // computed-style serialization. Normalize both to a lowercase
      // hex string for the design-parity assertion.
      const m = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        const toHex = (n: string) =>
          Number(n).toString(16).padStart(2, "0");
        return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`.toLowerCase();
      }
      return raw.toLowerCase();
    });
    expect(ringColor).toBe("#6750a4");
  });

  test("leading + trailing icon slots render with on-surface-variant glyphs", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--slots"));
    const leading = page
      .locator("[data-component='box'] [data-slot='leading-icon']")
      .first();
    const trailing = page
      .locator("[data-component='box'] [data-slot='trailing-icon']")
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    const dims = await leading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.width, height: cs.height };
    });
    expect(dims.width).toBe("24px");
    expect(dims.height).toBe("24px");
  });

  test("polymorphic `as` prop renders the requested element", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--accessibility"));
    const sectionBox = page.locator("section[data-component='box']").first();
    await expect(sectionBox).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 duration on container", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--motion", "light", "no-preference"));
    const box = page.locator("[data-component='box']").first();
    const styles = await box.evaluate((el) => {
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

  test("dark theme swaps the filled host to the dark surface-container-highest", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--default", "dark"));
    const box = page.locator("[data-component='box']").first();
    const bg = await box.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("layout props apply flex/grid/justify Tailwind utilities", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--layout"));
    const flexRow = page
      .locator("[data-component='box'][data-display='flex'][data-direction='row']")
      .first();
    const flexCol = page
      .locator(
        "[data-component='box'][data-display='flex'][data-direction='column']",
      )
      .first();
    const grid = page
      .locator("[data-component='box'][data-display='grid']")
      .first();
    const flexRowDisplay = await flexRow.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    const flexColDisplay = await flexCol.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    const gridDisplay = await grid.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(flexRowDisplay).toBe("flex");
    expect(flexColDisplay).toBe("column");
    expect(gridDisplay).toBe("grid");
  });

  test("playground renders an interactive Box with controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-box--playground"));
    const box = page.locator("[data-component='box']").first();
    await expect(box).toBeVisible();
    await expect(box).toHaveAttribute("data-interactive", "true");
  });
});
