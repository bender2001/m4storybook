import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Skeleton placeholder.
 *
 * M3 doesn't ship a Skeleton primitive — we re-skin the MUI API onto
 * the M3 surface tonal step (`surface-container-high`) so loading
 * states read as a tonal recess on `surface`, not a disabled control.
 *
 * Variants paint the body via M3 tokens:
 *   - filled    : surface-container-high body (default)
 *   - tonal     : secondary-container body
 *   - outlined  : transparent body + 1dp outline border
 *   - text      : transparent body, no border
 *
 * Type scale (height defaults):
 *   text:        sm 12px / md 16px / lg 24px (per M3 typography roles)
 *   rectangular: sm 64px / md 96px / lg 144px
 *   rounded:     sm 64px / md 96px / lg 144px (default shape-md radius)
 *   circular:    sm 24px / md 40px / lg 56px diameter
 *
 * Animation modes: pulse (opacity oscillation), wave (sweeping
 * highlight), none (static). All honor reduced-motion.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const DARK_SURFACE_CONTAINER_HIGH = "rgb(43, 41, 48)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Skeleton - M3 design parity", () => {
  test("default story renders a text/filled/md skeleton with role=status", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--default"));
    const skeleton = page.locator("[data-component='skeleton']").first();
    await expect(skeleton).toBeVisible();
    await expect(skeleton).toHaveAttribute("data-type", "text");
    await expect(skeleton).toHaveAttribute("data-variant", "filled");
    await expect(skeleton).toHaveAttribute("data-size", "md");
    await expect(skeleton).toHaveAttribute("data-animation", "pulse");
    await expect(skeleton).toHaveAttribute("role", "status");
    await expect(skeleton).toHaveAttribute("aria-busy", "true");
    await expect(skeleton).toHaveAttribute("aria-live", "polite");
  });

  test("filled variant paints body in surface-container-high", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--variants"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-variant='filled']")
      .first();
    const body = skeleton.locator("[data-slot='body']").first();
    await expect(body).toBeVisible();
    const bg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
  });

  test("tonal variant paints body in secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--variants"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-variant='tonal']")
      .first();
    const body = skeleton.locator("[data-slot='body']").first();
    const bg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("outlined variant: transparent body + 1dp outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--variants"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-variant='outlined']")
      .first();
    const body = skeleton.locator("[data-slot='body']").first();
    const styles = await body.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(styles.borderWidth).toBe("1px");
  });

  test("text variant: transparent body + transparent border", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--variants"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-variant='text']")
      .first();
    const body = skeleton.locator("[data-slot='body']").first();
    const styles = await body.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderColor };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(TRANSPARENT);
  });

  test("text type height scale matches M3 typography roles (12 / 16 / 24)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--sizes"));
    const matrix: Record<string, string> = {
      sm: "12px",
      md: "16px",
      lg: "24px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const skeleton = page
        .locator(
          `[data-component='skeleton'][data-type='text'][data-size='${size}']`,
        )
        .first();
      const body = skeleton.locator("[data-slot='body']").first();
      const height = await body.evaluate(
        (el) => window.getComputedStyle(el).height,
      );
      expect(height, `text size=${size}`).toBe(expected);
    }
  });

  test("rounded type height scale matches M3 (64 / 96 / 144)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--sizes"));
    const matrix: Record<string, string> = {
      sm: "64px",
      md: "96px",
      lg: "144px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const skeleton = page
        .locator(
          `[data-component='skeleton'][data-type='rounded'][data-size='${size}']`,
        )
        .first();
      const body = skeleton.locator("[data-slot='body']").first();
      const height = await body.evaluate(
        (el) => window.getComputedStyle(el).height,
      );
      expect(height, `rounded size=${size}`).toBe(expected);
    }
  });

  test("circular type renders perfect circle (24 / 40 / 56dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--sizes"));
    const matrix: Record<string, string> = {
      sm: "24px",
      md: "40px",
      lg: "56px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const skeleton = page
        .locator(
          `[data-component='skeleton'][data-type='circular'][data-size='${size}']`,
        )
        .first();
      const body = skeleton.locator("[data-slot='body']").first();
      const dims = await body.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          width: cs.width,
          height: cs.height,
          radius: cs.borderTopLeftRadius,
        };
      });
      expect(dims.width, `circular size=${size}`).toBe(expected);
      expect(dims.height, `circular size=${size}`).toBe(expected);
      // shape=full -> 9999px
      expect(dims.radius).toBe("9999px");
    }
  });

  test("shape scale renders the correct radius on the rectangular body", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--shapes"));
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
      const skeleton = page
        .locator(`[data-component='skeleton'][data-shape='${shape}']`)
        .first();
      const body = skeleton.locator("[data-slot='body']").first();
      const radius = await body.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("default shape per type honors M3 defaults", async ({ page }) => {
    await page.goto(storyUrl("feedback-skeleton--types"));
    const defaults: Record<string, string> = {
      text: "sm",
      rectangular: "none",
      rounded: "md",
      circular: "full",
    };
    for (const [type, shape] of Object.entries(defaults)) {
      const skeleton = page
        .locator(`[data-component='skeleton'][data-type='${type}']`)
        .first();
      await expect(skeleton).toHaveAttribute("data-shape", shape);
    }
  });

  test("disabled state dims the host to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    // motion/react's useReducedMotion() reads the prefers-reduced-motion
    // media query, not the storybook URL globals — so emulate the OS
    // preference so the disabled-opacity tween settles immediately.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(storyUrl("feedback-skeleton--states"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-disabled='true']")
      .first();
    await expect(skeleton).toBeVisible();
    await expect
      .poll(
        async () =>
          skeleton.evaluate(
            (el) => parseFloat(window.getComputedStyle(el).opacity),
          ),
        { timeout: 2_000 },
      )
      .toBeCloseTo(0.38, 2);
    const pointer = await skeleton.evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );
    expect(pointer).toBe("none");
  });

  test("error state paints the body in the M3 error-container role", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--states"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-error='true']")
      .first();
    await expect(skeleton).toBeVisible();
    const body = skeleton.locator("[data-slot='body']").first();
    const bg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_ERROR_CONTAINER);
  });

  test("multi-line text renders N stacked lines with the last tapering to 70%", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--slots"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-lines='3']")
      .first();
    await expect(skeleton).toBeVisible();
    const lines = skeleton.locator("[data-slot='body']");
    await expect(lines).toHaveCount(3);
    const lastWidth = await lines.last().evaluate(
      (el) => (el as HTMLElement).style.width || el.className,
    );
    // last child has the `w-[70%]` class
    expect(lastWidth).toContain("70%");
  });

  test("wave animation renders the gradient sweep span", async ({ page }) => {
    await page.goto(
      storyUrl("feedback-skeleton--motion", "light", "no-preference"),
    );
    const skeleton = page
      .locator("[data-component='skeleton'][data-animation='wave']")
      .first();
    await expect(skeleton).toBeVisible();
    const wave = skeleton.locator("[data-slot='wave']").first();
    await expect(wave).toBeVisible();
    const bg = await wave.evaluate(
      (el) => window.getComputedStyle(el).backgroundImage,
    );
    expect(bg).toContain("linear-gradient");
  });

  test("animation=none omits both pulse cycle and wave gradient", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--motion"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-animation='none']")
      .first();
    await expect(skeleton).toBeVisible();
    const wave = skeleton.locator("[data-slot='wave']");
    await expect(wave).toHaveCount(0);
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-skeleton--default", "light", "no-preference"),
    );
    const skeleton = page.locator("[data-component='skeleton']").first();
    await expect(skeleton).toBeVisible();
    const styles = await skeleton.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("opacity");
    expect(styles.duration).toContain("0.3s");
  });

  test("ARIA: aria-label customizes the announcement", async ({ page }) => {
    await page.goto(storyUrl("feedback-skeleton--accessibility"));
    const skeleton = page
      .locator("[data-component='skeleton']")
      .first();
    await expect(skeleton).toHaveAttribute(
      "aria-label",
      /Loading article preview/i,
    );
  });

  test("dark theme: filled body swaps to dark surface-container-high", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--variants", "dark"));
    const skeleton = page
      .locator("[data-component='skeleton'][data-variant='filled']")
      .first();
    const body = skeleton.locator("[data-slot='body']").first();
    const bg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGH);
  });

  test("playground story renders + accepts runtime controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-skeleton--playground"));
    const skeleton = page.locator("[data-component='skeleton']").first();
    await expect(skeleton).toBeVisible();
    await expect(skeleton).toHaveAttribute("data-animation", "pulse");
  });
});
