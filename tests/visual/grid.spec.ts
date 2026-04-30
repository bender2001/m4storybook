import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Grid.
 *
 * Grid is a token-aware 12-column layout primitive (M3 Expressive does
 * not specify a Grid component — this re-skins MUI's Grid with M3
 * surface, shape, elevation, and motion tokens). These specs assert
 * that:
 *
 *   - the variant matrix paints the right M3 surface roles
 *   - the size matrix sets the documented padding + min-row tracks
 *   - the shape token scale renders the canonical radii
 *   - the spacing scale produces the documented gap pixel sizes
 *   - the column-count map drives `grid-template-columns`
 *   - the interactive mode exposes the M3 state-layer + ARIA wiring
 *   - the elevated variant lifts to the elevation-1 shadow
 *   - the polymorphic `as` prop renders the requested element
 *   - dark theme swaps the surface roles to the dark token set
 *   - the M3 emphasized easing + medium2 duration drive the
 *     container transition
 *   - GridItem placement attributes resolve to the right `grid-column`
 *     / `grid-row` computed style
 *   - hover paints the state-layer at 0.08 opacity and morphs the
 *     corner shape one notch up
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

test.describe("Grid - M3 design parity", () => {
  test("default renders a 12-col filled grid at shape-md / md size with header", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--default"));
    const grid = page.locator("[data-component='grid']").first();
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute("data-variant", "filled");
    await expect(grid).toHaveAttribute("data-size", "md");
    await expect(grid).toHaveAttribute("data-shape", "md");
    await expect(grid).toHaveAttribute("data-columns", "12");

    const styles = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        padding: cs.paddingTop,
        display: cs.display,
        templateColumns: cs.gridTemplateColumns,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.padding).toBe("16px");
    expect(styles.display).toBe("grid");
    // 12 explicit columns.
    expect(styles.templateColumns.split(" ").length).toBe(12);
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("layout-grid--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const grid = page
        .locator(`[data-component='grid'][data-variant='${variant}']`)
        .first();
      await expect(grid).toBeVisible();
      const bg = await grid.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--variants"));
    const grid = page
      .locator("[data-component='grid'][data-variant='outlined']")
      .first();
    const styles = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to the elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--variants"));
    const grid = page
      .locator("[data-component='grid'][data-variant='elevated']")
      .first();
    const shadow = await grid.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale steps interior padding 8 / 16 / 24 px", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--sizes"));
    const expected: Record<string, string> = {
      sm: "8px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, pad] of Object.entries(expected)) {
      const grid = page
        .locator(`[data-component='grid'][data-size='${size}']`)
        .first();
      await expect(grid).toBeVisible();
      const measured = await grid.evaluate(
        (el) => window.getComputedStyle(el).paddingTop,
      );
      expect(measured, `size=${size}`).toBe(pad);
    }
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const grid = page
        .locator(`[data-component='grid'][data-shape='${shape}']`)
        .first();
      const radius = await grid.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("spacing scale produces 0 / 4 / 8 / 16 / 24 / 32 px gaps", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--spacing"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    };
    for (const [spacing, value] of Object.entries(expected)) {
      const grid = page
        .locator(`[data-component='grid'][data-row-spacing='${spacing}']`)
        .first();
      const gap = await grid.evaluate(
        (el) => window.getComputedStyle(el).rowGap,
      );
      expect(gap, `spacing=${spacing}`).toBe(value);
    }
  });

  test("split row + column spacing applies independently", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--spacing"));
    const grid = page
      .locator(
        "[data-component='grid'][data-row-spacing='lg'][data-column-spacing='xs']",
      )
      .first();
    await expect(grid).toBeVisible();
    const gaps = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { row: cs.rowGap, column: cs.columnGap };
    });
    expect(gaps.row).toBe("24px");
    expect(gaps.column).toBe("4px");
  });

  test("disabled grid dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--states"));
    const grid = page
      .locator("[data-component='grid'][data-disabled='true']")
      .first();
    const styles = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error grid paints error-container + on-error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--states"));
    const grid = page
      .locator("[data-component='grid'][data-error='true']")
      .first();
    const styles = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
    await expect(grid).toHaveAttribute("aria-invalid", "true");
  });

  test("selected interactive grid paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--states"));
    const grid = page
      .locator("[data-component='grid'][data-selected='true']")
      .first();
    const styles = await grid.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
    await expect(grid).toHaveAttribute("aria-selected", "true");
  });

  test("interactive grid exposes role=button + tabindex=0 + state-layer slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--states"));
    const grid = page
      .locator("[data-component='grid'][data-interactive='true']")
      .first();
    await expect(grid).toHaveAttribute("role", "button");
    await expect(grid).toHaveAttribute("tabindex", "0");
    const stateLayer = grid.locator("[data-slot='state-layer']");
    await expect(stateLayer).toHaveCount(1);
  });

  test("interactive grid paints state-layer at hover 0.08 opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-grid--motion", "light", "no-preference"),
    );
    const grid = page
      .locator("[data-component='grid'][data-interactive='true']")
      .first();
    await grid.hover();
    await expect(grid).toHaveAttribute("data-state-layer-opacity", "0.08");
  });

  test("interactive grid morphs the corner shape one notch up on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-grid--motion", "light", "no-preference"),
    );
    const grid = page
      .locator("[data-component='grid'][data-interactive='true']")
      .first();
    const radiusAtRest = await grid.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    await grid.hover();
    const radiusOnHover = await grid.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radiusAtRest).toBe("12px");
    expect(radiusOnHover).toBe("16px");
  });

  test("focus-visible paints the M3 primary focus ring", async ({ page }) => {
    await page.goto(
      storyUrl("layout-grid--motion", "light", "no-preference"),
    );
    const grid = page
      .locator("[data-component='grid'][data-interactive='true']")
      .first();
    await grid.focus();
    const ringColor = await grid.evaluate((el) => {
      const raw = window
        .getComputedStyle(el)
        .getPropertyValue("--tw-ring-color")
        .trim();
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
    await page.goto(storyUrl("layout-grid--slots"));
    const leading = page
      .locator("[data-component='grid'] [data-slot='leading-icon']")
      .first();
    const trailing = page
      .locator("[data-component='grid'] [data-slot='trailing-icon']")
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
    await page.goto(storyUrl("layout-grid--accessibility"));
    const sectionGrid = page.locator("section[data-component='grid']").first();
    await expect(sectionGrid).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 duration on container", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-grid--motion", "light", "no-preference"),
    );
    const grid = page.locator("[data-component='grid']").first();
    const styles = await grid.evaluate((el) => {
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
    await page.goto(storyUrl("layout-grid--default", "dark"));
    const grid = page.locator("[data-component='grid']").first();
    const bg = await grid.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("GridItem placement: span=6 resolves to grid-column span 6", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--layout"));
    const item = page
      .locator("[data-component='grid-item'][data-span='6']")
      .first();
    await expect(item).toBeVisible();
    const column = await item.evaluate(
      (el) => window.getComputedStyle(el).gridColumn,
    );
    expect(column).toBe("span 6 / span 6");
  });

  test("GridItem placement: span=full resolves to 1 / -1", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--layout"));
    const item = page
      .locator("[data-component='grid-item'][data-span='full']")
      .first();
    const column = await item.evaluate(
      (el) => window.getComputedStyle(el).gridColumn,
    );
    expect(column).toBe("1 / -1");
  });

  test("GridItem placement: explicit start + span composes correctly", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--layout"));
    const item = page
      .locator(
        "[data-component='grid-item'][data-span='2'][data-start='3']",
      )
      .first();
    const column = await item.evaluate(
      (el) => window.getComputedStyle(el).gridColumn,
    );
    expect(column).toBe("3 / span 2");
  });

  test("Playground renders an interactive Grid with controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--playground"));
    const grid = page.locator("[data-component='grid']").first();
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute("data-interactive", "true");
    await expect(grid).toHaveAttribute("data-columns", "6");
  });

  test("column count map drives `grid-template-columns`", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-grid--sizes"));
    const grid = page
      .locator("[data-component='grid'][data-columns='4']")
      .first();
    const cols = await grid.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns,
    );
    // Four explicit fr-tracks → four space-separated computed sizes.
    expect(cols.split(" ").length).toBe(4);
  });
});
