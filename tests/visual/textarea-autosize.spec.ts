import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 TextareaAutosize.
 *
 * TextareaAutosize is the unstyled MUI primitive
 * (https://mui.com/material-ui/react-textarea-autosize/) that grows
 * a `<textarea>` to fit its content between a `minRows` floor
 * (default 1) and a `maxRows` ceiling (default unbounded). The slice
 * re-skins the surface onto the M3 text-field tokens
 * (https://m3.material.io/components/text-fields/specs).
 *
 * Variants:
 *   - standard : surface-container-highest + elevation-0 + xs radius (default)
 *   - tonal    : secondary-container + elevation-0 + xs radius
 *   - outlined : transparent + 1dp outline border + elevation-0
 *   - text     : transparent fill + no border + elevation-0
 *   - elevated : surface-container-low + elevation-3 + xs radius
 *
 * Key tokens:
 *   - default shape : xs (4dp, M3 text-field surface radius)
 *   - default size  : md (56dp tray, body-m typography)
 *   - body type     : body-m (14px / 20px / 0.25px tracking)
 *   - label type    : label-l (14px / 20px / 500 weight)
 *   - helper type   : body-s (12px / 16px / 0.4px tracking)
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
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("TextareaAutosize - M3 design parity", () => {
  test("default renders standard / md / xs with aria-multiline + textarea slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--default"));
    const host = page
      .locator("[data-component='textarea-autosize']")
      .first();
    await expect(host).toBeVisible();
    await expect(host).toHaveAttribute("data-variant", "standard");
    await expect(host).toHaveAttribute("data-size", "md");
    await expect(host).toHaveAttribute("data-shape", "xs");

    const tray = host.locator("[data-slot='tray']").first();
    const textarea = host.locator("[data-slot='textarea']").first();
    await expect(textarea).toHaveAttribute("aria-multiline", "true");

    const styles = await tray.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        minHeight: cs.minHeight,
      };
    });
    expect(styles.radius).toBe("4px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.minHeight).toBe("56px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-textarea-autosize--variants"));
    const expected: Record<string, string> = {
      standard: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      text: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const host = page
        .locator(
          `[data-component='textarea-autosize'][data-variant='${variant}']`,
        )
        .first();
      await expect(host).toBeVisible();
      const tray = host.locator("[data-slot='tray']").first();
      const bg = await tray.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline border", async ({ page }) => {
    await page.goto(storyUrl("utils-textarea-autosize--variants"));
    const tray = page
      .locator(
        "[data-component='textarea-autosize'][data-variant='outlined'] [data-slot='tray']",
      )
      .first();
    const styles = await tray.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.borderTopWidth,
        color: cs.borderTopColor,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE);
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
  });

  test("text variant: transparent fill + on-surface foreground", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--variants"));
    const tray = page
      .locator(
        "[data-component='textarea-autosize'][data-variant='text'] [data-slot='tray']",
      )
      .first();
    const styles = await tray.evaluate((el) => {
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
    await page.goto(storyUrl("utils-textarea-autosize--variants"));
    const tray = page
      .locator(
        "[data-component='textarea-autosize'][data-variant='elevated'] [data-slot='tray']",
      )
      .first();
    const shadow = await tray.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("size scale enforces M3 tray heights (sm 40 / md 56 / lg 72 px)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--sizes"));
    const matrix: Record<string, string> = {
      sm: "40px",
      md: "56px",
      lg: "72px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const tray = page
        .locator(
          `[data-component='textarea-autosize'][data-size='${size}'] [data-slot='tray']`,
        )
        .first();
      await expect(tray).toBeVisible();
      const minHeight = await tray.evaluate(
        (el) => window.getComputedStyle(el).minHeight,
      );
      expect(minHeight, `size=${size}`).toBe(expected);
    }
  });

  test("size scale assigns the M3 body type role per density", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--sizes"));
    const matrix: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const textarea = page
        .locator(
          `[data-component='textarea-autosize'][data-size='${size}'] [data-slot='textarea']`,
        )
        .first();
      const fontSize = await textarea.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );
      expect(fontSize, `size=${size}`).toBe(expected);
    }
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-textarea-autosize--shapes"));
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
      const tray = page
        .locator(
          `[data-component='textarea-autosize'][data-shape='${shape}'] [data-slot='tray']`,
        )
        .first();
      await expect(tray).toBeVisible();
      const radius = await tray.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("disabled host: aria-disabled, opacity 0.38, pointer-events:none on tray", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-textarea-autosize--states", "light", "no-preference"),
    );
    const host = page
      .locator("[data-component='textarea-autosize'][data-disabled='true']")
      .first();
    await expect(host).toBeVisible();
    const textarea = host.locator("[data-slot='textarea']").first();
    await expect(textarea).toHaveAttribute("aria-disabled", "true");
    const opacity = await host.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
    const tray = host.locator("[data-slot='tray']").first();
    const pointerEvents = await tray.evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );
    expect(pointerEvents).toBe("none");
  });

  test("error host paints error-container + aria-invalid + helper text becomes error", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--states"));
    const host = page
      .locator("[data-component='textarea-autosize'][data-error='true']")
      .first();
    const textarea = host.locator("[data-slot='textarea']").first();
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    const tray = host.locator("[data-slot='tray']").first();
    const styles = await tray.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("selected host paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--states"));
    const host = page
      .locator("[data-component='textarea-autosize'][data-selected='true']")
      .first();
    const textarea = host.locator("[data-slot='textarea']").first();
    await expect(textarea).toHaveAttribute("aria-selected", "true");
    const tray = host.locator("[data-slot='tray']").first();
    const styles = await tray.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("label slot renders label-l typography and is htmlFor=textarea", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--with-icons"));
    const host = page
      .locator("[data-component='textarea-autosize']", {
        has: page.locator("[data-slot='label']"),
      })
      .first();
    const label = host.locator("[data-slot='label']").first();
    const textarea = host.locator("[data-slot='textarea']").first();
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
    const labelFor = await label.getAttribute("for");
    const textareaId = await textarea.getAttribute("id");
    expect(labelFor).toBe(textareaId);
  });

  test("helper text renders body-s typography + describes the textarea", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--with-icons"));
    const host = page
      .locator("[data-component='textarea-autosize']", {
        has: page.locator("[data-slot='helper']"),
      })
      .first();
    const helper = host.locator("[data-slot='helper']").first();
    const textarea = host.locator("[data-slot='textarea']").first();
    const styles = await helper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("12px");
    expect(styles.lineHeight).toBe("16px");
    const describedBy = await textarea.getAttribute("aria-describedby");
    const helperId = await helper.getAttribute("id");
    expect(describedBy).toBe(helperId);
  });

  test("autosize grows the textarea height past the resting min when content overflows", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--autosize"));
    const textarea = page
      .locator("[data-component='textarea-autosize'] [data-slot='textarea']")
      .first();
    await expect(textarea).toBeVisible();

    const startBox = await textarea.boundingBox();
    expect(startBox).not.toBeNull();
    await textarea.click();
    await textarea.pressSequentially(
      "\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7",
    );
    // Allow the layout effect to run.
    await page.waitForTimeout(150);
    const endBox = await textarea.boundingBox();
    expect(endBox).not.toBeNull();
    expect(endBox!.height).toBeGreaterThan(startBox!.height);
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on tray transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-textarea-autosize--motion", "light", "no-preference"),
    );
    const tray = page
      .locator("[data-component='textarea-autosize'] [data-slot='tray']")
      .first();
    await expect(tray).toBeVisible();
    const styles = await tray.evaluate((el) => {
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

  test("focused tray morphs the border to primary", async ({ page }) => {
    await page.goto(storyUrl("utils-textarea-autosize--variants"));
    const host = page
      .locator(
        "[data-component='textarea-autosize'][data-variant='outlined']",
      )
      .first();
    const textarea = host.locator("[data-slot='textarea']").first();
    await textarea.focus();
    await expect(host).toHaveAttribute("data-focused", "true");
    const tray = host.locator("[data-slot='tray']").first();
    // border-top-color rides the medium2 (300ms) emphasized transition;
    // poll via toHaveCSS so the assertion outlasts the morph.
    await expect(tray).toHaveCSS("border-top-color", "rgb(103, 80, 164)");
  });

  test("ARIA wiring: aria-multiline + role=textbox via native textarea", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--accessibility"));
    const textarea = page
      .locator("[data-component='textarea-autosize'] [data-slot='textarea']")
      .first();
    await expect(textarea).toHaveAttribute("aria-multiline", "true");
    const tagName = await textarea.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("textarea");
  });

  test("dark theme swaps standard tray to dark surface-container-highest", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--default", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const tray = page
      .locator(
        "[data-component='textarea-autosize'][data-variant='standard'] [data-slot='tray']",
      )
      .first();
    const bg = await tray.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("playground story renders a textarea with aria-multiline", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-textarea-autosize--playground"));
    const textarea = page
      .locator("[data-component='textarea-autosize'] [data-slot='textarea']")
      .first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute("aria-multiline", "true");
  });

  test("textarea body uses body-m typography by default", async ({ page }) => {
    await page.goto(storyUrl("utils-textarea-autosize--default"));
    const textarea = page
      .locator("[data-component='textarea-autosize'] [data-slot='textarea']")
      .first();
    const styles = await textarea.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.lineHeight).toBe("20px");
  });
});
