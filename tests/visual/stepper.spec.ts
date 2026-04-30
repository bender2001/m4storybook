import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Stepper.
 *
 * Spec sources:
 *   - MUI Stepper             https://mui.com/material-ui/react-stepper/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * MUI's `<Stepper />` has no Material 3 spec, so the surface is
 * re-skinned onto M3 navigation tokens. The active-step container
 * morphs from `shape-full` (circle) to the selected `shape` token via
 * a springy motion/react transition - the same M3 Expressive
 * selection pattern shared with Pagination + Navigation Rail.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_SURFACE_VARIANT = "rgb(231, 224, 236)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Stepper - M3 design parity", () => {
  test("default stepper renders <ol> + role=list + listitems", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const root = page.locator("[data-component='stepper']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-shape", "md");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
    const items = page.locator("[data-component='stepper-step']");
    await expect(items).toHaveCount(3);
  });

  test("default story marks the active step with aria-current=step", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const active = page
      .locator("[data-component='stepper-step'][data-active='true']")
      .first();
    await expect(active).toBeVisible();
    await expect(active).toHaveAttribute("aria-current", "step");
    await expect(active).toHaveAttribute("data-state", "active");
    const completed = page.locator(
      "[data-component='stepper-step'][data-state='completed']",
    );
    await expect(completed).toHaveCount(1);
  });

  test("active icon paints primary + on-primary (filled, M3 default)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const activeIcon = page
      .locator(
        "[data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first();
    const styles = await activeIcon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY);
  });

  test("upcoming icon paints surface-variant + on-surface-variant (filled)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const upcomingIcon = page
      .locator(
        "[data-component='stepper-step'][data-state='upcoming'] [data-slot='step-icon']",
      )
      .first();
    const bg = await upcomingIcon.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SURFACE_VARIANT);
  });

  test("variant matrix paints the M3 active surface mapping", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--variants"));
    const expected: Record<string, string> = {
      filled: LIGHT_PRIMARY,
      tonal: LIGHT_SECONDARY_CONTAINER,
      // outlined + text active surfaces are transparent (rgba 0,0,0,0)
      elevated: LIGHT_PRIMARY,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const icon = page
        .locator(
          `[data-component='stepper'][data-variant='${variant}'] [data-component='stepper-step'][data-active='true'] [data-slot='step-icon']`,
        )
        .first();
      await expect(icon).toBeVisible();
      const bg = await icon.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
    const tonalActiveColor = await page
      .locator(
        "[data-component='stepper'][data-variant='tonal'] [data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first()
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(tonalActiveColor).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined variant paints a 1px primary border on the active icon", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--variants"));
    const icon = page
      .locator(
        "[data-component='stepper'][data-variant='outlined'] [data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first();
    const styles = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        color: cs.color,
      };
    });
    expect(styles.borderColor).toBe(LIGHT_PRIMARY);
    expect(styles.borderWidth).toBe("1px");
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("elevated variant paints surface-container-low + elevation-1 host", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--variants"));
    const host = page
      .locator("[data-component='stepper'][data-variant='elevated']")
      .first();
    const styles = await host.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("size scale: 24 / 28 / 36 px icon containers for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const icon = page
          .locator(
            `[data-component='stepper'][data-size='${size}'] [data-slot='step-icon']`,
          )
          .first();
        await expect(icon).toBeVisible();
        return icon.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["24px", "28px", "36px"]);
  });

  test("active icon morph: filled active paints shape-md (12px)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const icon = page
      .locator(
        "[data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first();
    const radius = await icon.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
  });

  test("upcoming icon stays as a circle (shape-full / 9999px)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const icon = page
      .locator(
        "[data-component='stepper-step'][data-state='upcoming'] [data-slot='step-icon']",
      )
      .first();
    const radius = await icon.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("9999px");
  });

  test("shape scale renders the canonical M3 active radii", async ({ page }) => {
    await page.goto(storyUrl("navigation-stepper--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const icon = page
        .locator(
          `[data-component='stepper'][data-shape='${shape}'] [data-component='stepper-step'][data-active='true'] [data-slot='step-icon']`,
        )
        .first();
      const radius = await icon.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullActive = page
      .locator(
        "[data-component='stepper'][data-shape='full'] [data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first();
    const radius = await fullActive.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("9999px");
  });

  test("connector paints outline-variant on incoming + has motion progress span", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const connector = page.locator("[data-slot='step-connector']").first();
    await expect(connector).toBeVisible();
    const bg = await connector.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_OUTLINE_VARIANT);
    const progress = connector.locator("[data-slot='connector-progress']");
    await expect(progress).toHaveCount(1);
  });

  test("completed connector flags data-filled=true (drives motion fill)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const filled = page.locator(
      "[data-component='stepper-step'][data-state='completed'] [data-slot='step-connector'][data-filled='true']",
    );
    await expect(filled).toHaveCount(1);
  });

  test("error step paints the error / on-error role pair", async ({ page }) => {
    await page.goto(storyUrl("navigation-stepper--states"));
    const errorIcon = page
      .locator(
        "[data-component='stepper-step'][data-error='true'] [data-slot='step-icon']",
      )
      .first();
    await expect(errorIcon).toBeVisible();
    const bg = await errorIcon.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_ERROR);
    const errorLabel = page
      .locator(
        "[data-component='stepper-step'][data-error='true'] [data-slot='step-label']",
      )
      .first();
    const labelColor = await errorLabel.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(labelColor).toBe(LIGHT_ERROR);
  });

  test("disabled stepper: aria-disabled wash + opacity 0.38 + pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--states"));
    const disabledRoot = page
      .locator("[data-component='stepper'][data-disabled='true']")
      .first();
    await expect(disabledRoot).toBeVisible();
    const styles = await disabledRoot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("disabled step: data-disabled + aria-disabled + non-interactive span", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--states"));
    const disabledStep = page
      .locator("[data-component='stepper-step'][data-disabled='true']")
      .first();
    await expect(disabledStep).toBeVisible();
    await expect(disabledStep).toHaveAttribute("aria-disabled", "true");
  });

  test("alternative-label layout flags data-alternative-label='true'", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--alternative-label"));
    const root = page.locator("[data-component='stepper']").first();
    await expect(root).toHaveAttribute("data-alternative-label", "true");
    const labelStack = page.locator("[data-slot='step-label-stack']").first();
    const cls = await labelStack.evaluate((el) => el.className);
    expect(cls).toMatch(/text-center/);
  });

  test("vertical orientation flips aria-orientation + connector axis", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--vertical"));
    const root = page.locator("[data-component='stepper']").first();
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    await expect(root).toHaveAttribute("aria-orientation", "vertical");
    const connector = page.locator("[data-slot='step-connector']").first();
    const width = await connector.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    expect(width).toBe("2px");
  });

  test("vertical: active step expands its content region", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-stepper--vertical", "light", "no-preference"),
    );
    await page.waitForTimeout(450);
    const content = page
      .locator(
        "[data-component='stepper-step'][data-active='true'] [data-slot='stepper-content']",
      )
      .first();
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute("role", "region");
  });

  test("M3 motion: emphasized easing on icon transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-stepper--default", "light", "no-preference"),
    );
    const icon = page
      .locator(
        "[data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first();
    const styles = await icon.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.duration).toContain("0.3s");
  });

  test("hover paints state-layer at 0.08 opacity on a reachable step icon", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-stepper--non-linear", "light", "no-preference"),
    );
    const button = page
      .locator(
        "[data-component='stepper-step'][data-state='completed'] [data-slot='step-button']",
      )
      .first();
    await expect(button).toBeVisible();
    const layer = button
      .locator("[data-slot='step-icon'] [data-slot='state-layer']")
      .first();
    await button.hover();
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("ARIA wiring: role=list + listitems + labelled by ariaLabel", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-stepper--default"));
    const list = page.locator("[role='list']").first();
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute("aria-label", /default stepper/i);
    const items = list.locator("[role='listitem']");
    await expect(items).toHaveCount(3);
  });

  test("roving-tabindex (non-linear): exactly one focusable step button", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-stepper--non-linear", "light", "no-preference"),
    );
    await page.waitForLoadState("networkidle");
    const buttons = page.locator("[data-slot='step-button']").filter({
      hasNot: page.locator("[aria-disabled='true']"),
    });
    const count = await buttons.count();
    expect(count).toBeGreaterThan(1);
    const tabIndices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        buttons
          .nth(i)
          .evaluate((el) => (el as HTMLElement).getAttribute("tabindex")),
      ),
    );
    const focusable = tabIndices.filter((t) => t === "0").length;
    expect(focusable).toBe(1);
  });

  test("playground story: clicking a step (non-linear) updates aria-current", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-stepper--non-linear", "light", "no-preference"),
    );
    const review = page
      .locator("[data-component='stepper-step'][data-key='review']")
      .first();
    await expect(review).toBeVisible();
    const reviewButton = review.locator("[data-slot='step-button']").first();
    await reviewButton.click();
    await expect(review).toHaveAttribute("aria-current", "step");
  });

  test("dark theme: filled active swaps to dark primary", async ({ page }) => {
    await page.goto(storyUrl("navigation-stepper--default", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const icon = page
      .locator(
        "[data-component='stepper-step'][data-active='true'] [data-slot='step-icon']",
      )
      .first();
    const bg = await icon.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_PRIMARY);
  });

  test("Enter on a focused step (non-linear) advances active", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "navigation-stepper--interaction-spec",
        "light",
        "no-preference",
      ),
    );
    const reviewBtn = page
      .locator(
        "[data-component='stepper-step'][data-key='review'] [data-slot='step-button']",
      )
      .first();
    await reviewBtn.focus();
    await page.keyboard.press("Enter");
    const reviewItem = page
      .locator("[data-component='stepper-step'][data-key='review']")
      .first();
    await expect(reviewItem).toHaveAttribute("aria-current", "step");
  });
});
