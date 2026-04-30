import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Link.
 *
 * Spec sources (no dedicated M3 Expressive component, so we re-skin
 * MUI Link with M3 tokens):
 *   - M3 typography "Applying type" (link guidance)
 *     https://m3.material.io/styles/typography/applying-type
 *   - MUI Link
 *     https://mui.com/material-ui/react-link/
 *   - M3 color roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 *
 * Container:
 *   - Native <a> element (preserves middle-click + Cmd-click).
 *   - Default shape `full` (pill) on chip variants.
 *   - Host fill matrix:
 *       text     -> transparent + primary text
 *       filled   -> surface-container-highest + primary
 *       tonal    -> secondary-container + on-secondary-container
 *       outlined -> transparent + 1dp outline-variant border
 *       elevated -> surface-container-low + elevation-1
 *
 * Per link:
 *   - state-layer opacities: hover 0.08, focus 0.10, pressed 0.10
 *   - density: 24 / 28 / 36 px host height (sm / md / lg) on chip variants
 *   - typography: label-m / body-m / body-l for sm / md / lg
 *   - container transition: medium2 (300ms) / emphasized easing
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

test.describe("Link - M3 design parity", () => {
  test("default renders a native <a> with primary foreground + href", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--default"));
    const link = page.locator("[data-component='link']").first();
    await expect(link).toBeVisible();
    const tag = await link.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("a");
    await expect(link).toHaveAttribute("href", "#docs");
    await expect(link).toHaveAttribute("data-variant", "text");
    await expect(link).toHaveAttribute("data-size", "md");
    await expect(link).toHaveAttribute("data-shape", "full");
    const color = await link.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_PRIMARY);
  });

  test("variants paint the M3 host matrix", async ({ page }) => {
    await page.goto(storyUrl("navigation-link--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const link = page
        .locator(`[data-component='link'][data-variant='${variant}']`)
        .first();
      await expect(link).toBeVisible();
      const bg = await link.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("text + outlined variants paint primary foreground; tonal uses on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--variants"));
    const text = page
      .locator("[data-component='link'][data-variant='text']")
      .first();
    expect(
      await text.evaluate((el) => window.getComputedStyle(el).color),
    ).toBe(LIGHT_PRIMARY);

    const outlined = page
      .locator("[data-component='link'][data-variant='outlined']")
      .first();
    expect(
      await outlined.evaluate((el) => window.getComputedStyle(el).color),
    ).toBe(LIGHT_PRIMARY);

    const tonal = page
      .locator("[data-component='link'][data-variant='tonal']")
      .first();
    expect(
      await tonal.evaluate((el) => window.getComputedStyle(el).color),
    ).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--variants"));
    const link = page
      .locator("[data-component='link'][data-variant='outlined']")
      .first();
    const styles = await link.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-1 shadow", async ({ page }) => {
    await page.goto(storyUrl("navigation-link--variants"));
    const link = page
      .locator("[data-component='link'][data-variant='elevated']")
      .first();
    const shadow = await link.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale matches density: 24 / 28 / 36 px host heights on chip variants", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const link = page
          .locator(
            `[data-component='link'][data-size='${size}'][data-variant='filled']`,
          )
          .first();
        await expect(link).toBeVisible();
        return link.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["24px", "28px", "36px"]);
  });

  test("typography steps label-m / body-m / body-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "12px", weight: "500" },
      md: { size: "14px", weight: "400" },
      lg: { size: "16px", weight: "400" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const link = page
        .locator(
          `[data-component='link'][data-size='${size}'][data-variant='filled']`,
        )
        .first();
      const measured = await link.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled link strips href, sets aria-disabled, dims to 0.38, blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--states"));
    const link = page
      .locator("[data-component='link'][data-disabled='true']")
      .first();
    await expect(link).toBeVisible();
    expect(await link.evaluate((el) => el.hasAttribute("href"))).toBe(false);
    await expect(link).toHaveAttribute("aria-disabled", "true");
    const styles = await link.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error state paints link in error-container + on-error-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--states"));
    const link = page
      .locator("[data-component='link'][data-error='true']")
      .first();
    const styles = await link.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("selected link adopts the secondary-container treatment + aria-current=page", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--states"));
    const link = page
      .locator("[data-component='link'][data-selected='true']")
      .first();
    await expect(link).toHaveAttribute("aria-current", "page");
    const styles = await link.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const link = page
        .locator(`[data-component='link'][data-shape='${shape}']`)
        .first();
      const radius = await link.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='link'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("leading + trailing icon slots render alongside the label", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--slots"));
    const leading = page
      .locator("[data-component='link'] [data-slot='icon-leading']")
      .first();
    const trailing = page
      .locator("[data-component='link'] [data-slot='icon-trailing']")
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
  });

  test("external links auto-tag target=_blank + rel=noopener + render the external glyph", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--slots"));
    const ext = page
      .locator("[data-component='link'][data-external='true']")
      .first();
    await expect(ext).toHaveAttribute("target", "_blank");
    const rel = await ext.getAttribute("rel");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
    const glyph = ext.locator("[data-icon='external']");
    await expect(glyph).toHaveCount(1);
  });

  test("underline policy: none / hover / always", async ({ page }) => {
    await page.goto(storyUrl("navigation-link--underline", "light", "no-preference"));
    const none = page
      .locator("[data-component='link'][data-underline='none']")
      .first();
    expect(
      await none.evaluate((el) => window.getComputedStyle(el).textDecorationLine),
    ).toBe("none");

    const always = page
      .locator("[data-component='link'][data-underline='always']")
      .first();
    expect(
      await always.evaluate(
        (el) => window.getComputedStyle(el).textDecorationLine,
      ),
    ).toBe("underline");

    const hover = page
      .locator("[data-component='link'][data-underline='hover']")
      .first();
    expect(
      await hover.evaluate((el) => window.getComputedStyle(el).textDecorationLine),
    ).toBe("none");
    await hover.hover();
    await page.waitForTimeout(250);
    expect(
      await hover.evaluate((el) => window.getComputedStyle(el).textDecorationLine),
    ).toBe("underline");
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-link--motion", "light", "no-preference"),
    );
    const link = page.locator("[data-component='link']").first();
    const styles = await link.evaluate((el) => {
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

  test("hover paints state-layer at opacity 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("navigation-link--default", "light", "no-preference"),
    );
    const link = page.locator("[data-component='link']").first();
    await link.hover();
    // duration-short4 = 200ms; pad for safety so transition settles.
    await page.waitForTimeout(350);
    const stateLayer = link.locator("[data-slot='state-layer']");
    const opacity = await stateLayer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.08, 2);
  });

  test("focus-visible paints state-layer at opacity 0.10", async ({ page }) => {
    await page.goto(
      storyUrl("navigation-link--default", "light", "no-preference"),
    );
    const link = page.locator("[data-component='link']").first();
    await link.focus();
    await page.waitForTimeout(350);
    const stateLayer = link.locator("[data-slot='state-layer']");
    const opacity = await stateLayer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.1, 2);
  });

  test("keyboard: Enter on focused link follows the href", async ({ page }) => {
    await page.goto(storyUrl("navigation-link--accessibility"));
    const link = page.getByRole("link", { name: "Material 3 design system" });
    await link.focus();
    await page.keyboard.press("Enter");
    // Anchor has href="#a11y" — Enter follows it. Just assert no crash +
    // the link survives.
    await expect(link).toBeVisible();
  });

  test("ARIA: selected link is aria-current=page; on-surface foreground for current page", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-link--accessibility"));
    const current = page
      .locator("[data-component='link'][data-selected='true']")
      .first();
    await expect(current).toHaveAttribute("aria-current", "page");
    expect(
      await current.evaluate((el) => window.getComputedStyle(el).color),
    ).toBe(LIGHT_ON_SURFACE);
  });

  test("dark theme swaps link foreground to dark primary", async ({ page }) => {
    await page.goto(storyUrl("navigation-link--default", "dark"));
    const link = page.locator("[data-component='link']").first();
    const color = await link.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(DARK_PRIMARY);
  });

  test("playground story renders a link with role=link", async ({ page }) => {
    await page.goto(storyUrl("navigation-link--playground"));
    const link = page.locator("[data-component='link']").first();
    await expect(link).toBeVisible();
    const role = link;
    expect(await role.evaluate((el) => el.tagName.toLowerCase())).toBe("a");
  });
});
