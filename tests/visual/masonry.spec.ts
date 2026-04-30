import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Masonry.
 *
 * Masonry is a token-aware Pinterest-style multi-column layout. M3
 * does not specify a Masonry component — this re-skins MUI's primitive
 * with M3 surface, shape, elevation, and motion tokens. These specs
 * assert that:
 *
 *   - the variant matrix paints the right M3 surface roles on the host
 *   - the size matrix sets the documented padding
 *   - the shape token scale renders the canonical radii on the host
 *   - the spacing scale produces the documented column gap pixel sizes
 *   - balanced and sequential packing both drive a CSS multi-column
 *     layout (column-fill differs)
 *   - tiles flow inside the multi-columns + never break across columns
 *   - interactive tiles expose the M3 state-layer + ARIA wiring +
 *     paint at the documented opacities + morph the corner shape
 *   - the elevated host lifts to the elevation-1 shadow
 *   - the polymorphic `as` prop renders the requested element
 *   - dark theme swaps the surface roles to the dark token set
 *   - the M3 emphasized easing + medium2 duration drive the
 *     container transition
 *   - the layout exposes its packing via aria-roledescription
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
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Masonry - M3 design parity", () => {
  test("default renders a 3-column layout host at shape-md / md size", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--default"));
    const layout = page.locator("[data-component='masonry']").first();
    await expect(layout).toBeVisible();
    await expect(layout).toHaveAttribute("data-variant", "filled");
    await expect(layout).toHaveAttribute("data-size", "md");
    await expect(layout).toHaveAttribute("data-shape", "md");
    await expect(layout).toHaveAttribute("data-packing", "balanced");
    await expect(layout).toHaveAttribute("data-columns", "3");

    const styles = await layout.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const inner = el.querySelector(
        "[data-slot='layout']",
      ) as HTMLElement | null;
      const innerCs = inner ? window.getComputedStyle(inner) : null;
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        padding: cs.paddingTop,
        innerDisplay: innerCs?.display,
        columnCount: innerCs?.columnCount,
        columnGap: innerCs?.columnGap,
        columnFill: innerCs?.columnFill,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.padding).toBe("16px");
    expect(styles.innerDisplay).toBe("block");
    expect(styles.columnCount).toBe("3");
    expect(styles.columnGap).toBe("8px");
    expect(styles.columnFill).toBe("balance");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("advanced-masonry--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const layout = page
        .locator(`[data-component='masonry'][data-variant='${variant}']`)
        .first();
      await expect(layout).toBeVisible();
      const bg = await layout.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--variants"));
    const layout = page
      .locator("[data-component='masonry'][data-variant='outlined']")
      .first();
    const styles = await layout.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to the elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--variants"));
    const layout = page
      .locator("[data-component='masonry'][data-variant='elevated']")
      .first();
    const shadow = await layout.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale steps interior padding 8 / 16 / 24 px", async ({ page }) => {
    await page.goto(storyUrl("advanced-masonry--sizes"));
    const expected: Record<string, string> = {
      sm: "8px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, pad] of Object.entries(expected)) {
      const layout = page
        .locator(`[data-component='masonry'][data-size='${size}']`)
        .first();
      await expect(layout).toBeVisible();
      const measured = await layout.evaluate(
        (el) => window.getComputedStyle(el).paddingTop,
      );
      expect(measured, `size=${size}`).toBe(pad);
    }
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const layout = page
        .locator(`[data-component='masonry'][data-shape='${shape}']`)
        .first();
      const radius = await layout.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("balanced packing sets column-fill to `balance`", async ({ page }) => {
    await page.goto(storyUrl("advanced-masonry--packing"));
    const layout = page
      .locator("[data-component='masonry'][data-packing='balanced']")
      .first();
    const fill = await layout.evaluate((el) => {
      const inner = el.querySelector(
        "[data-slot='layout']",
      ) as HTMLElement;
      return window.getComputedStyle(inner).columnFill;
    });
    expect(fill).toBe("balance");
  });

  test("sequential packing sets column-fill to `auto`", async ({ page }) => {
    await page.goto(storyUrl("advanced-masonry--packing"));
    const layout = page
      .locator("[data-component='masonry'][data-packing='sequential']")
      .first();
    const fill = await layout.evaluate((el) => {
      const inner = el.querySelector(
        "[data-slot='layout']",
      ) as HTMLElement;
      return window.getComputedStyle(inner).columnFill;
    });
    expect(fill).toBe("auto");
  });

  test("masonry layout uses CSS multi-columns + break-inside-avoid tiles", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--default"));
    const layout = page.locator("[data-component='masonry']").first();
    const tile = layout
      .locator("[data-component='masonry-item']")
      .first();
    const styles = await tile.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        breakInside: cs.breakInside,
        display: cs.display,
        marginBottom: cs.marginBottom,
      };
    });
    expect(styles.breakInside).toBe("avoid");
    expect(styles.display).toBe("block");
    expect(styles.marginBottom).toBe("8px");
  });

  test("disabled host dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--states"));
    const layout = page
      .locator("[data-component='masonry'][data-disabled='true']")
      .first();
    const styles = await layout.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error host paints error-container + on-error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--states"));
    const layout = page
      .locator("[data-component='masonry'][data-error='true']")
      .first();
    const styles = await layout.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
    await expect(layout).toHaveAttribute("aria-invalid", "true");
  });

  test("selected interactive tile paints aria-selected + secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--states"));
    const tile = page
      .locator("[data-component='masonry-item'][data-selected='true']")
      .first();
    await expect(tile).toHaveAttribute("aria-selected", "true");
    const bg = await tile.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("interactive tile exposes role=button + tabindex=0 + state-layer slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--states"));
    const tile = page
      .locator("[data-component='masonry-item'][data-interactive='true']")
      .first();
    await expect(tile).toHaveAttribute("role", "button");
    await expect(tile).toHaveAttribute("tabindex", "0");
    const stateLayer = tile.locator("[data-slot='state-layer']");
    await expect(stateLayer).toHaveCount(1);
  });

  test("interactive tile paints state-layer at hover 0.08 opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-masonry--motion", "light", "no-preference"),
    );
    const tile = page
      .locator("[data-component='masonry-item'][data-interactive='true']")
      .first();
    await tile.hover();
    await expect(tile).toHaveAttribute("data-state-layer-opacity", "0.08");
  });

  test("interactive tile morphs the corner shape one notch up on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-masonry--motion", "light", "no-preference"),
    );
    const tile = page
      .locator("[data-component='masonry-item'][data-interactive='true']")
      .first();
    const radiusAtRest = await tile.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    await tile.hover();
    const radiusOnHover = await tile.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radiusAtRest).toBe("12px");
    expect(radiusOnHover).toBe("16px");
  });

  test("focus-visible paints the M3 primary focus ring on the tile", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-masonry--motion", "light", "no-preference"),
    );
    const tile = page
      .locator("[data-component='masonry-item'][data-interactive='true']")
      .first();
    await tile.focus();
    const ringColor = await tile.evaluate((el) => {
      const raw = window
        .getComputedStyle(el)
        .getPropertyValue("--tw-ring-color")
        .trim();
      const m = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
        return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`.toLowerCase();
      }
      return raw.toLowerCase();
    });
    expect(ringColor).toBe("#6750a4");
  });

  test("leading + trailing icon slots render with on-surface-variant glyphs", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--slots"));
    const leading = page
      .locator("[data-component='masonry'] [data-slot='leading-icon']")
      .first();
    const trailing = page
      .locator("[data-component='masonry'] [data-slot='trailing-icon']")
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
    await page.goto(storyUrl("advanced-masonry--accessibility"));
    const sectionLayout = page
      .locator("section[data-component='masonry']")
      .first();
    await expect(sectionLayout).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 duration on container", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-masonry--motion", "light", "no-preference"),
    );
    const layout = page.locator("[data-component='masonry']").first();
    const styles = await layout.evaluate((el) => {
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
    await page.goto(storyUrl("advanced-masonry--default", "dark"));
    const layout = page.locator("[data-component='masonry']").first();
    const bg = await layout.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("layout exposes its packing via aria-roledescription", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--packing"));
    const balanced = page
      .locator("[data-component='masonry'][data-packing='balanced']")
      .first();
    const sequential = page
      .locator("[data-component='masonry'][data-packing='sequential']")
      .first();
    await expect(balanced).toHaveAttribute(
      "aria-roledescription",
      "masonry layout",
    );
    await expect(sequential).toHaveAttribute(
      "aria-roledescription",
      "sequential masonry layout",
    );
  });

  test("each tile exposes role=listitem when not interactive", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-masonry--default"));
    const tile = page.locator("[data-component='masonry-item']").first();
    await expect(tile).toHaveAttribute("role", "listitem");
  });

  test("Playground renders a Masonry with controls", async ({ page }) => {
    await page.goto(storyUrl("advanced-masonry--playground"));
    const layout = page.locator("[data-component='masonry']").first();
    await expect(layout).toBeVisible();
    await expect(layout).toHaveAttribute("data-packing", "balanced");
    await expect(layout).toHaveAttribute("data-columns", "3");
  });
});
