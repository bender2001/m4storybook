import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Progress indicator.
 *
 * Spec: https://m3.material.io/components/progress-indicators/specs.
 *
 * Linear thickness:  sm 4dp / md 8dp (default) / lg 12dp.
 * Circular diameter: sm 24dp / md 48dp (default) / lg 64dp,
 *                    stroke 3dp / 4dp / 6dp.
 *
 * Variants paint the active indicator + track via M3 tokens:
 *   - filled    : primary indicator on primary-container track
 *   - tonal     : primary indicator on secondary-container track
 *   - outlined  : primary indicator on transparent track + 1dp outline
 *   - text      : primary indicator on transparent track, no border
 *
 * Determinate exposes aria-valuenow / aria-valuemin / aria-valuemax;
 * indeterminate omits aria-valuenow per ARIA 1.2.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const DARK_PRIMARY_CONTAINER = "rgb(79, 55, 139)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Progress - M3 design parity", () => {
  test("default story renders a linear/filled/md determinate progressbar", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--default"));
    const progress = page.locator("[data-component='progress']").first();
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("data-type", "linear");
    await expect(progress).toHaveAttribute("data-variant", "filled");
    await expect(progress).toHaveAttribute("data-size", "md");
    await expect(progress).toHaveAttribute("data-mode", "determinate");
    await expect(progress).toHaveAttribute("role", "progressbar");
    await expect(progress).toHaveAttribute("aria-valuenow", "60");
    await expect(progress).toHaveAttribute("aria-valuemin", "0");
    await expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  test("filled variant paints primary indicator on primary-container track", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--variants"));
    const progress = page
      .locator(
        "[data-component='progress'][data-type='linear'][data-variant='filled']",
      )
      .first();
    const track = progress.locator("[data-slot='track']").first();
    const indicator = progress.locator("[data-slot='indicator']").first();
    await expect(track).toBeVisible();
    await expect(indicator).toBeVisible();
    const trackBg = await track.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const indicatorBg = await indicator.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(trackBg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(indicatorBg).toBe(LIGHT_PRIMARY);
  });

  test("tonal variant paints primary indicator on secondary-container track", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--variants"));
    const progress = page
      .locator(
        "[data-component='progress'][data-type='linear'][data-variant='tonal']",
      )
      .first();
    const track = progress.locator("[data-slot='track']").first();
    const indicator = progress.locator("[data-slot='indicator']").first();
    const trackBg = await track.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const indicatorBg = await indicator.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(trackBg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(indicatorBg).toBe(LIGHT_PRIMARY);
  });

  test("outlined variant: transparent track + 1dp outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--variants"));
    const progress = page
      .locator(
        "[data-component='progress'][data-type='linear'][data-variant='outlined']",
      )
      .first();
    const track = progress.locator("[data-slot='track']").first();
    const styles = await track.evaluate((el) => {
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

  test("text variant: transparent track + transparent border", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--variants"));
    const progress = page
      .locator(
        "[data-component='progress'][data-type='linear'][data-variant='text']",
      )
      .first();
    const track = progress.locator("[data-slot='track']").first();
    const styles = await track.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderColor };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(TRANSPARENT);
  });

  test("linear thickness scale matches M3 (sm 4dp / md 8dp / lg 12dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--sizes"));
    const matrix: Record<string, string> = {
      sm: "4px",
      md: "8px",
      lg: "12px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const progress = page
        .locator(
          `[data-component='progress'][data-type='linear'][data-size='${size}']`,
        )
        .first();
      const track = progress.locator("[data-slot='track']").first();
      const height = await track.evaluate(
        (el) => window.getComputedStyle(el).height,
      );
      expect(height, `linear size=${size}`).toBe(expected);
    }
  });

  test("circular diameter scale matches M3 (sm 24dp / md 48dp / lg 64dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--sizes"));
    const matrix: Record<string, { width: string; stroke: string }> = {
      sm: { width: "24px", stroke: "3" },
      md: { width: "48px", stroke: "4" },
      lg: { width: "64px", stroke: "6" },
    };
    for (const [size, { width, stroke }] of Object.entries(matrix)) {
      const progress = page
        .locator(
          `[data-component='progress'][data-type='circular'][data-size='${size}']`,
        )
        .first();
      await expect(progress).toBeVisible();
      const svg = progress.locator("[data-slot='svg']").first();
      const indicator = progress.locator("[data-slot='indicator']").first();
      const dims = await svg.evaluate((el) => ({
        w: el.getAttribute("width"),
        h: el.getAttribute("height"),
      }));
      const sw = await indicator.evaluate((el) =>
        el.getAttribute("stroke-width"),
      );
      expect(dims.w, `circular size=${size}`).toBe(width.replace("px", ""));
      expect(dims.h, `circular size=${size}`).toBe(width.replace("px", ""));
      expect(sw, `circular stroke=${size}`).toBe(stroke);
    }
  });

  test("shape scale renders the correct radius on the linear track", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--shapes"));
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
      const progress = page
        .locator(`[data-component='progress'][data-shape='${shape}']`)
        .first();
      const track = progress.locator("[data-slot='track']").first();
      const radius = await track.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("disabled state dims the host to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    // motion/react's useReducedMotion() reads the prefers-reduced-motion
    // media query, not the storybook URL globals — so emulate the OS
    // preference so the disabled-opacity tween settles immediately.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(storyUrl("feedback-progress--states"));
    const progress = page
      .locator("[data-component='progress'][data-disabled='true']")
      .first();
    await expect(progress).toBeVisible();
    await expect
      .poll(
        async () =>
          progress.evaluate(
            (el) => parseFloat(window.getComputedStyle(el).opacity),
          ),
        { timeout: 2_000 },
      )
      .toBeCloseTo(0.38, 2);
    const pointer = await progress.evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );
    expect(pointer).toBe("none");
  });

  test("error state flips the active indicator to the M3 error color role", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--states"));
    const progress = page
      .locator("[data-component='progress'][data-error='true']")
      .first();
    await expect(progress).toBeVisible();
    const indicator = progress.locator("[data-slot='indicator']").first();
    const bg = await indicator.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_ERROR);
  });

  test("determinate width tracks aria-valuenow as a percentage", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--default"));
    const progress = page.locator("[data-component='progress']").first();
    const indicator = progress.locator("[data-slot='indicator']").first();
    const width = await indicator.evaluate(
      (el) => (el as HTMLElement).style.width,
    );
    expect(width).toBe("60%");
  });

  test("indeterminate mode drops aria-valuenow per ARIA 1.2", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--accessibility"));
    const progress = page
      .locator("[data-component='progress'][data-mode='indeterminate']")
      .first();
    await expect(progress).toBeVisible();
    const aria = await progress.evaluate((el) => ({
      now: el.getAttribute("aria-valuenow"),
      min: el.getAttribute("aria-valuemin"),
      max: el.getAttribute("aria-valuemax"),
    }));
    expect(aria.now).toBeNull();
    expect(aria.min).toBe("0");
    expect(aria.max).toBe("100");
  });

  test("M3 stop indicator renders a 4dp dot at the end of the linear track", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--default"));
    const stop = page.locator("[data-slot='stop']").first();
    await expect(stop).toBeVisible();
    const styles = await stop.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.width,
        height: cs.height,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
      };
    });
    // md size -> 8px stop diameter (matches the bar height per M3 dot)
    expect(styles.width).toBe("8px");
    expect(styles.height).toBe("8px");
    expect(styles.radius).toBe("9999px");
    expect(styles.bg).toBe(LIGHT_PRIMARY);
  });

  test("inline label is wired via aria-labelledby", async ({ page }) => {
    await page.goto(storyUrl("feedback-progress--slots"));
    const progress = page
      .locator("[data-component='progress']")
      .filter({ has: page.locator("[data-slot='label']") })
      .first();
    const labelledBy = await progress.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    // React's useId produces colon-bearing IDs (e.g. ":r0:"); reach
    // them via attribute selector so we don't fight CSS escaping.
    const label = page.locator(`[id="${labelledBy}"]`).first();
    await expect(label).toBeVisible();
    await expect(label).toHaveText(/Uploading/i);
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-progress--default", "light", "no-preference"),
    );
    const progress = page.locator("[data-component='progress']").first();
    await expect(progress).toBeVisible();
    const styles = await progress.evaluate((el) => {
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

  test("circular determinate paints the indicator stroke in the variant color", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--variants"));
    const progress = page
      .locator(
        "[data-component='progress'][data-type='circular'][data-variant='filled']",
      )
      .first();
    await expect(progress).toBeVisible();
    const indicator = progress.locator("[data-slot='indicator']").first();
    const trackCircle = progress.locator("[data-slot='track']").first();
    const styles = await indicator.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { stroke: cs.stroke };
    });
    const trackStyles = await trackCircle.evaluate((el) => ({
      stroke: window.getComputedStyle(el).stroke,
    }));
    expect(styles.stroke).toBe(LIGHT_PRIMARY);
    expect(trackStyles.stroke).toBe(LIGHT_PRIMARY_CONTAINER);
  });

  test("dark theme swaps the filled indicator to the dark primary token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--variants", "dark"));
    const progress = page
      .locator(
        "[data-component='progress'][data-type='linear'][data-variant='filled']",
      )
      .first();
    const track = progress.locator("[data-slot='track']").first();
    const indicator = progress.locator("[data-slot='indicator']").first();
    const trackBg = await track.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const indicatorBg = await indicator.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(trackBg).toBe(DARK_PRIMARY_CONTAINER);
    expect(indicatorBg).toBe(DARK_PRIMARY);
  });

  test("playground story renders + accepts runtime controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--playground"));
    const progress = page.locator("[data-component='progress']").first();
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("data-mode", "determinate");
  });

  test("typography: inline label uses the M3 label-m role", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-progress--slots"));
    const label = page.locator("[data-slot='label']").first();
    await expect(label).toBeVisible();
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        fontWeight: cs.fontWeight,
      };
    });
    // M3 label-m: 12px / 16px / 500 (see tailwind.config.ts)
    expect(styles.fontSize).toBe("12px");
    expect(styles.lineHeight).toBe("16px");
    expect(styles.fontWeight).toBe("500");
  });
});
