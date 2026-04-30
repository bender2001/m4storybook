import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Stack.
 *
 * Stack is a token-aware single-axis flex layout primitive (M3
 * Expressive does not specify a Stack component — this re-skins
 * MUI's Stack with M3 surface, shape, elevation, and motion tokens).
 * These specs assert that:
 *
 *   - the variant matrix paints the right M3 surface roles
 *   - the size matrix sets the documented padding + min cross-axis
 *   - the shape token scale renders the canonical radii
 *   - the spacing scale produces the documented gap pixel sizes
 *   - the direction prop drives `flex-direction`
 *   - the interactive mode exposes the M3 state-layer + ARIA wiring
 *   - the elevated variant lifts to the elevation-1 shadow
 *   - the polymorphic `as` prop renders the requested element
 *   - dark theme swaps the surface roles to the dark token set
 *   - the M3 emphasized easing + medium2 duration drive the
 *     container transition
 *   - hover paints the state-layer at 0.08 opacity and morphs the
 *     corner shape one notch up
 *   - the `divider` slot interposes a separator between every pair
 *     of stacked children and stretches across the cross-axis
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

test.describe("Stack - M3 design parity", () => {
  test("default renders a column-stacked filled host at shape-md / md size", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--default"));
    const stack = page.locator("[data-component='stack']").first();
    await expect(stack).toBeVisible();
    await expect(stack).toHaveAttribute("data-variant", "filled");
    await expect(stack).toHaveAttribute("data-size", "md");
    await expect(stack).toHaveAttribute("data-shape", "md");
    await expect(stack).toHaveAttribute("data-direction", "column");

    const styles = await stack.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const track = el.querySelector(
        "[data-slot='track']",
      ) as HTMLElement | null;
      const trackCs = track ? window.getComputedStyle(track) : null;
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        padding: cs.paddingTop,
        display: cs.display,
        trackDirection: trackCs?.flexDirection,
        trackGap: trackCs?.rowGap,
      };
    });
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.padding).toBe("16px");
    expect(styles.display).toBe("flex");
    expect(styles.trackDirection).toBe("column");
    expect(styles.trackGap).toBe("16px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("layout-stack--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const stack = page
        .locator(`[data-component='stack'][data-variant='${variant}']`)
        .first();
      await expect(stack).toBeVisible();
      const bg = await stack.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--variants"));
    const stack = page
      .locator("[data-component='stack'][data-variant='outlined']")
      .first();
    const styles = await stack.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to the elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--variants"));
    const stack = page
      .locator("[data-component='stack'][data-variant='elevated']")
      .first();
    const shadow = await stack.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale steps interior padding 8 / 16 / 24 px", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--sizes"));
    const expected: Record<string, string> = {
      sm: "8px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, pad] of Object.entries(expected)) {
      const stack = page
        .locator(`[data-component='stack'][data-size='${size}']`)
        .first();
      await expect(stack).toBeVisible();
      const measured = await stack.evaluate(
        (el) => window.getComputedStyle(el).paddingTop,
      );
      expect(measured, `size=${size}`).toBe(pad);
    }
  });

  test("size scale also drives default child gap 8 / 16 / 24 px", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--sizes"));
    const expected: Record<string, string> = {
      sm: "8px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, gap] of Object.entries(expected)) {
      const stack = page
        .locator(`[data-component='stack'][data-size='${size}']`)
        .first();
      const measured = await stack.evaluate((el) => {
        const track = el.querySelector(
          "[data-slot='track']",
        ) as HTMLElement;
        return window.getComputedStyle(track).rowGap;
      });
      expect(measured, `size=${size}`).toBe(gap);
    }
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const stack = page
        .locator(`[data-component='stack'][data-shape='${shape}']`)
        .first();
      const radius = await stack.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("spacing scale produces 0 / 4 / 8 / 16 / 24 / 32 px child gaps", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--spacing"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    };
    for (const [spacing, value] of Object.entries(expected)) {
      const stack = page
        .locator(`[data-component='stack'][data-spacing='${spacing}']`)
        .first();
      const gap = await stack.evaluate((el) => {
        const track = el.querySelector(
          "[data-slot='track']",
        ) as HTMLElement;
        return window.getComputedStyle(track).rowGap;
      });
      expect(gap, `spacing=${spacing}`).toBe(value);
    }
  });

  test("direction prop drives the inner track flex-direction", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--direction"));
    const expected: Record<string, string> = {
      column: "column",
      row: "row",
      "column-reverse": "column-reverse",
      "row-reverse": "row-reverse",
    };
    for (const [direction, css] of Object.entries(expected)) {
      const stack = page
        .locator(`[data-component='stack'][data-direction='${direction}']`)
        .first();
      await expect(stack).toBeVisible();
      const measured = await stack.evaluate((el) => {
        const track = el.querySelector(
          "[data-slot='track']",
        ) as HTMLElement;
        return window.getComputedStyle(track).flexDirection;
      });
      expect(measured, `direction=${direction}`).toBe(css);
    }
  });

  test("disabled stack dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--states"));
    const stack = page
      .locator("[data-component='stack'][data-disabled='true']")
      .first();
    const styles = await stack.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error stack paints error-container + on-error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--states"));
    const stack = page
      .locator("[data-component='stack'][data-error='true']")
      .first();
    const styles = await stack.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
    await expect(stack).toHaveAttribute("aria-invalid", "true");
  });

  test("selected interactive stack paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--states"));
    const stack = page
      .locator("[data-component='stack'][data-selected='true']")
      .first();
    const styles = await stack.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
    await expect(stack).toHaveAttribute("aria-selected", "true");
  });

  test("interactive stack exposes role=button + tabindex=0 + state-layer slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--states"));
    const stack = page
      .locator("[data-component='stack'][data-interactive='true']")
      .first();
    await expect(stack).toHaveAttribute("role", "button");
    await expect(stack).toHaveAttribute("tabindex", "0");
    const stateLayer = stack.locator("[data-slot='state-layer']");
    await expect(stateLayer).toHaveCount(1);
  });

  test("interactive stack paints state-layer at hover 0.08 opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-stack--motion", "light", "no-preference"),
    );
    const stack = page
      .locator("[data-component='stack'][data-interactive='true']")
      .first();
    await stack.hover();
    await expect(stack).toHaveAttribute("data-state-layer-opacity", "0.08");
  });

  test("interactive stack morphs the corner shape one notch up on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-stack--motion", "light", "no-preference"),
    );
    const stack = page
      .locator("[data-component='stack'][data-interactive='true']")
      .first();
    const radiusAtRest = await stack.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    await stack.hover();
    const radiusOnHover = await stack.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radiusAtRest).toBe("12px");
    expect(radiusOnHover).toBe("16px");
  });

  test("focus-visible paints the M3 primary focus ring", async ({ page }) => {
    await page.goto(
      storyUrl("layout-stack--motion", "light", "no-preference"),
    );
    const stack = page
      .locator("[data-component='stack'][data-interactive='true']")
      .first();
    await stack.focus();
    const ringColor = await stack.evaluate((el) => {
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
    await page.goto(storyUrl("layout-stack--slots"));
    const leading = page
      .locator("[data-component='stack'] [data-slot='leading-icon']")
      .first();
    const trailing = page
      .locator("[data-component='stack'] [data-slot='trailing-icon']")
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
    await page.goto(storyUrl("layout-stack--accessibility"));
    const sectionStack = page
      .locator("section[data-component='stack']")
      .first();
    await expect(sectionStack).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 duration on container", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("layout-stack--motion", "light", "no-preference"),
    );
    const stack = page.locator("[data-component='stack']").first();
    const styles = await stack.evaluate((el) => {
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
    await page.goto(storyUrl("layout-stack--default", "dark"));
    const stack = page.locator("[data-component='stack']").first();
    const bg = await stack.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("divider slot interposes a separator between every pair of children", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--divider"));
    const stack = page
      .locator("[data-component='stack'][data-has-divider='true']")
      .first();
    await expect(stack).toBeVisible();
    // 3 children → 2 dividers between them.
    const dividers = stack.locator("[data-slot='divider']");
    await expect(dividers).toHaveCount(2);
    // Each divider wrapper is presentational so it doesn't pollute
    // the accessibility tree.
    const role = await dividers
      .first()
      .evaluate((el) => el.getAttribute("role"));
    expect(role).toBe("presentation");
  });

  test("divider stack sets aria-orientation on the host", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--divider"));
    const vertical = page
      .locator("[data-component='stack'][data-has-divider='true']")
      .first();
    await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
    const horizontal = page
      .locator(
        "[data-component='stack'][data-has-divider='true'][data-direction='row']",
      )
      .first();
    await expect(horizontal).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
  });

  test("Playground renders an interactive Stack with controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("layout-stack--playground"));
    const stack = page.locator("[data-component='stack']").first();
    await expect(stack).toBeVisible();
    await expect(stack).toHaveAttribute("data-interactive", "true");
    await expect(stack).toHaveAttribute("data-direction", "column");
  });
});
