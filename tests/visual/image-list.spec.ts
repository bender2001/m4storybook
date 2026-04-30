import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 ImageList.
 *
 * ImageList is a token-aware 2D image gallery primitive (M3 does not
 * specify an Image List component — this re-skins MUI's primitive
 * with M3 surface, shape, elevation, and motion tokens). These specs
 * assert that:
 *
 *   - the variant matrix paints the right M3 surface roles on the host
 *   - the size matrix sets the documented padding + tile row height
 *   - the shape token scale renders the canonical radii on the host
 *   - the spacing scale produces the documented tile gap pixel sizes
 *   - the four MUI arrangements (standard / quilted / woven / masonry)
 *     drive distinct layout primitives (grid template + flow + col
 *     count vs. CSS multi-columns)
 *   - tile spans (cols + rows) translate to grid `span N` placement
 *   - the woven arrangement stamps an alternating col-span pattern
 *   - interactive tiles expose the M3 state-layer + ARIA wiring +
 *     paint at the documented opacities + morph the corner shape
 *   - the elevated host lifts to the elevation-1 shadow
 *   - the polymorphic `as` prop renders the requested element
 *   - dark theme swaps the surface roles to the dark token set
 *   - the M3 emphasized easing + medium2 duration drive the
 *     container transition
 *   - the gallery exposes its arrangement via aria-roledescription
 *   - the optional `<ImageListItemBar>` overlay paints title / subtitle
 *     + an action slot that respects `actionPosition`
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

test.describe("ImageList - M3 design parity", () => {
  test("default renders a 3-col grid host at shape-md / md size", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--default"));
    const list = page.locator("[data-component='image-list']").first();
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute("data-variant", "filled");
    await expect(list).toHaveAttribute("data-size", "md");
    await expect(list).toHaveAttribute("data-shape", "md");
    await expect(list).toHaveAttribute("data-arrangement", "standard");
    await expect(list).toHaveAttribute("data-cols", "3");

    const styles = await list.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const gallery = el.querySelector(
        "[data-slot='gallery']",
      ) as HTMLElement | null;
      const galleryCs = gallery ? window.getComputedStyle(gallery) : null;
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        padding: cs.paddingTop,
        display: cs.display,
        galleryDisplay: galleryCs?.display,
        gridTemplateColumns: galleryCs?.gridTemplateColumns,
        rowGap: galleryCs?.rowGap,
        columnGap: galleryCs?.columnGap,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.padding).toBe("16px");
    expect(styles.galleryDisplay).toBe("grid");
    expect(styles.gridTemplateColumns?.split(" ").length).toBe(3);
    expect(styles.rowGap).toBe("8px");
    expect(styles.columnGap).toBe("8px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("layout-imagelist--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const list = page
        .locator(`[data-component='image-list'][data-variant='${variant}']`)
        .first();
      await expect(list).toBeVisible();
      const bg = await list.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--variants"));
    const list = page
      .locator("[data-component='image-list'][data-variant='outlined']")
      .first();
    const styles = await list.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to the elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--variants"));
    const list = page
      .locator("[data-component='image-list'][data-variant='elevated']")
      .first();
    const shadow = await list.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale steps interior padding 8 / 16 / 24 px", async ({ page }) => {
    await page.goto(storyUrl("layout-imagelist--sizes"));
    const expected: Record<string, string> = {
      sm: "8px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, pad] of Object.entries(expected)) {
      const list = page
        .locator(`[data-component='image-list'][data-size='${size}']`)
        .first();
      await expect(list).toBeVisible();
      const measured = await list.evaluate(
        (el) => window.getComputedStyle(el).paddingTop,
      );
      expect(measured, `size=${size}`).toBe(pad);
    }
  });

  test("size scale also drives default tile row height", async ({ page }) => {
    await page.goto(storyUrl("layout-imagelist--sizes"));
    const expected: Record<string, string> = {
      sm: "120",
      md: "160",
      lg: "200",
    };
    for (const [size, rowH] of Object.entries(expected)) {
      const list = page
        .locator(`[data-component='image-list'][data-size='${size}']`)
        .first();
      await expect(list).toHaveAttribute("data-row-height", rowH);
    }
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const list = page
        .locator(`[data-component='image-list'][data-shape='${shape}']`)
        .first();
      const radius = await list.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("standard arrangement uses CSS grid with N equal columns", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--arrangements"));
    const list = page
      .locator("[data-component='image-list'][data-arrangement='standard']")
      .first();
    const display = await list.evaluate((el) => {
      const gallery = el.querySelector(
        "[data-slot='gallery']",
      ) as HTMLElement;
      return {
        d: window.getComputedStyle(gallery).display,
        cols: window.getComputedStyle(gallery).gridTemplateColumns,
      };
    });
    expect(display.d).toBe("grid");
    expect(display.cols.split(" ").length).toBe(3);
  });

  test("quilted arrangement applies grid-auto-flow with `dense` packing", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--arrangements"));
    const list = page
      .locator("[data-component='image-list'][data-arrangement='quilted']")
      .first();
    const flow = await list.evaluate((el) => {
      const gallery = el.querySelector(
        "[data-slot='gallery']",
      ) as HTMLElement;
      return window.getComputedStyle(gallery).gridAutoFlow;
    });
    // Chromium normalizes `"row dense"` to `"dense"` since `row` is the
    // initial value. Either spelling means dense packing is active.
    expect(flow).toMatch(/dense/);
  });

  test("woven arrangement stamps alternating col-spans (2 / 1 / 2 / 1 …)", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--arrangements"));
    const list = page
      .locator("[data-component='image-list'][data-arrangement='woven']")
      .first();
    // The woven pattern is driven by a CSS `:nth-child(odd|even)` rule
    // in src/index.css; assert via computed gridColumn rather than the
    // data-cols attribute (which still reflects the consumer-supplied
    // span, not the derived woven span).
    const spans = await list.evaluate((el) => {
      const tiles = el.querySelectorAll(
        "[data-component='image-list-item']",
      );
      return Array.from(tiles).map(
        (tile) =>
          window.getComputedStyle(tile as HTMLElement).gridColumn ?? "",
      );
    });
    const summarize = (col: string) => (col.includes("span 2") ? 2 : 1);
    expect(spans.slice(0, 6).map(summarize)).toEqual([2, 1, 2, 1, 2, 1]);
  });

  test("masonry arrangement uses CSS multi-columns instead of grid", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--arrangements"));
    const list = page
      .locator("[data-component='image-list'][data-arrangement='masonry']")
      .first();
    const styles = await list.evaluate((el) => {
      const gallery = el.querySelector(
        "[data-slot='gallery']",
      ) as HTMLElement;
      const cs = window.getComputedStyle(gallery);
      return {
        display: cs.display,
        columnCount: cs.columnCount,
        columnGap: cs.columnGap,
      };
    });
    expect(styles.display).toBe("block");
    expect(styles.columnCount).toBe("3");
    expect(styles.columnGap).toBe("8px");
  });

  test("tile cols + rows translate to grid `span N` placement", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--arrangements"));
    const list = page
      .locator("[data-component='image-list'][data-arrangement='quilted']")
      .first();
    const placement = await list.evaluate((el) => {
      const hero = el.querySelector(
        "[data-component='image-list-item']",
      ) as HTMLElement;
      const cs = window.getComputedStyle(hero);
      return { col: cs.gridColumn, row: cs.gridRow };
    });
    expect(placement.col.replace(/\s+/g, " ")).toContain("span 2");
    expect(placement.row.replace(/\s+/g, " ")).toContain("span 2");
  });

  test("disabled list dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--states"));
    const list = page
      .locator("[data-component='image-list'][data-disabled='true']")
      .first();
    const styles = await list.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error list paints error-container + on-error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--states"));
    const list = page
      .locator("[data-component='image-list'][data-error='true']")
      .first();
    const styles = await list.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
    await expect(list).toHaveAttribute("aria-invalid", "true");
  });

  test("selected interactive tile paints aria-selected + secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--states"));
    const tile = page
      .locator(
        "[data-component='image-list-item'][data-selected='true']",
      )
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
    await page.goto(storyUrl("layout-imagelist--states"));
    const tile = page
      .locator(
        "[data-component='image-list-item'][data-interactive='true']",
      )
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
      storyUrl("layout-imagelist--motion", "light", "no-preference"),
    );
    const tile = page
      .locator(
        "[data-component='image-list-item'][data-interactive='true']",
      )
      .first();
    await tile.hover();
    await expect(tile).toHaveAttribute("data-state-layer-opacity", "0.08");
  });

  test("interactive tile morphs the corner shape one notch up on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-imagelist--motion", "light", "no-preference"),
    );
    const tile = page
      .locator(
        "[data-component='image-list-item'][data-interactive='true']",
      )
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
      storyUrl("layout-imagelist--motion", "light", "no-preference"),
    );
    const tile = page
      .locator(
        "[data-component='image-list-item'][data-interactive='true']",
      )
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
    await page.goto(storyUrl("layout-imagelist--slots"));
    const leading = page
      .locator("[data-component='image-list'] [data-slot='leading-icon']")
      .first();
    const trailing = page
      .locator("[data-component='image-list'] [data-slot='trailing-icon']")
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

  test("ImageListItemBar overlay paints title + subtitle + action", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--slots"));
    const bar = page
      .locator("[data-component='image-list-item-bar']")
      .first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("data-position", "bottom");
    const title = bar.locator("[data-slot='title']").first();
    const subtitle = bar.locator("[data-slot='subtitle']").first();
    const action = bar.locator("[data-slot='action']").first();
    await expect(title).toHaveText("Photo 1");
    await expect(subtitle).toHaveText("Sample subtitle");
    await expect(action).toBeVisible();
    await expect(bar).toHaveAttribute("data-action-position", "right");
  });

  test("ImageListItemBar position=top + actionPosition=left flips slots", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--slots"));
    const bar = page
      .locator(
        "[data-component='image-list-item-bar'][data-position='top']",
      )
      .first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("data-action-position", "left");
  });

  test("polymorphic `as` prop renders the requested element", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--accessibility"));
    const sectionList = page
      .locator("section[data-component='image-list']")
      .first();
    await expect(sectionList).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 duration on container", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-imagelist--motion", "light", "no-preference"),
    );
    const list = page.locator("[data-component='image-list']").first();
    const styles = await list.evaluate((el) => {
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
    await page.goto(storyUrl("layout-imagelist--default", "dark"));
    const list = page.locator("[data-component='image-list']").first();
    const bg = await list.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("gallery exposes its arrangement via aria-roledescription", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--arrangements"));
    const standard = page
      .locator(
        "[data-component='image-list'][data-arrangement='standard']",
      )
      .first();
    const masonry = page
      .locator(
        "[data-component='image-list'][data-arrangement='masonry']",
      )
      .first();
    await expect(standard).toHaveAttribute(
      "aria-roledescription",
      "image gallery",
    );
    await expect(masonry).toHaveAttribute(
      "aria-roledescription",
      "masonry image gallery",
    );
  });

  test("each tile exposes role=listitem when not interactive", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-imagelist--default"));
    const tile = page
      .locator("[data-component='image-list-item']")
      .first();
    await expect(tile).toHaveAttribute("role", "listitem");
  });

  test("Playground renders an ImageList with controls", async ({ page }) => {
    await page.goto(storyUrl("layout-imagelist--playground"));
    const list = page.locator("[data-component='image-list']").first();
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute("data-arrangement", "standard");
    await expect(list).toHaveAttribute("data-cols", "3");
  });
});
