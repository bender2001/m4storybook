import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Dialog.
 *
 * Spec: https://m3.material.io/components/dialogs/specs.
 *
 * Variants:
 *   - standard   : surface-container-high + elevation-3 + xl radius
 *   - tonal      : primary-container + elevation-1 + xl radius
 *   - outlined   : surface + 1dp outline border + no elevation
 *   - fullscreen : edge-to-edge surface, no radius / elevation
 *
 * Key tokens:
 *   - default shape : xl (28dp)
 *   - default size  : md (320..560px wide)
 *   - title type    : headline-s (24px)
 *   - supporting    : body-m (14px)
 *   - scrim opacity : 0.32 (M3 dialog scrim)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const DARK_SURFACE_CONTAINER_HIGH = "rgb(43, 41, 48)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_SURFACE = "rgb(254, 247, 255)";
const SCRIM = "rgb(0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Dialog - M3 design parity", () => {
  test("default renders standard / md / xl with role=dialog + aria-modal=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-variant", "standard");
    await expect(dialog).toHaveAttribute("data-size", "md");
    await expect(dialog).toHaveAttribute("data-shape", "xl");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    const styles = await dialog.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.radius).toBe("28px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    // elevation-3 places at least one shadow on the surface
    expect(styles.boxShadow).not.toBe("none");
  });

  test("standard variant: surface-container-high + elevation-3", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--variants"));
    const dialog = page
      .locator("[data-component='dialog'][data-variant='standard']")
      .first();
    await expect(dialog).toBeVisible();
    const styles = await dialog.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, boxShadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    expect(styles.boxShadow).not.toBe("none");
  });

  test("tonal variant: primary-container + elevation-1", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--variants"));
    const dialog = page
      .locator("[data-component='dialog'][data-variant='tonal']")
      .first();
    await expect(dialog).toBeVisible();
    const styles = await dialog.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, boxShadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.boxShadow).not.toBe("none");
  });

  test("outlined variant: surface fill + 1dp outline border + no elevation", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--variants"));
    const dialog = page
      .locator("[data-component='dialog'][data-variant='outlined']")
      .first();
    await expect(dialog).toBeVisible();
    const styles = await dialog.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        borderWidth: cs.borderTopWidth,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(styles.borderWidth).toBe("1px");
    expect(styles.boxShadow).toBe("none");
  });

  test("fullscreen variant: edge-to-edge surface + 0 radius + no elevation", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--variants"));
    const dialog = page
      .locator("[data-component='dialog'][data-variant='fullscreen']")
      .first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-fullscreen", "true");
    const styles = await dialog.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        boxShadow: cs.boxShadow,
        bg: cs.backgroundColor,
      };
    });
    expect(styles.radius).toBe("0px");
    expect(styles.boxShadow).toBe("none");
    expect(styles.bg).toBe(LIGHT_SURFACE);
  });

  test("size scale enforces M3 width bands (sm 400 / md 560 / lg 720 px max)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--sizes"));
    const matrix: Record<string, string> = {
      sm: "400px",
      md: "560px",
      lg: "720px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const dialog = page
        .locator(`[data-component='dialog'][data-size='${size}']`)
        .first();
      await expect(dialog).toBeVisible();
      const maxWidth = await dialog.evaluate(
        (el) => window.getComputedStyle(el).maxWidth,
      );
      expect(maxWidth, `size=${size}`).toBe(expected);
    }
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--shapes"));
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
      const dialog = page
        .locator(`[data-component='dialog'][data-shape='${shape}']`)
        .first();
      await expect(dialog).toBeVisible();
      const radius = await dialog.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("title slot uses headline-s and the dialog wires aria-labelledby to it", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const dialog = page.locator("[data-component='dialog']").first();
    const title = dialog.locator("[data-slot='title']").first();
    await expect(title).toBeVisible();
    const styles = await title.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("24px");
    expect(styles.lineHeight).toBe("32px");
    const labelledBy = await dialog.getAttribute("aria-labelledby");
    const titleId = await title.getAttribute("id");
    expect(labelledBy).toBe(titleId);
  });

  test("supporting text uses body-m and the dialog wires aria-describedby to it", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const dialog = page.locator("[data-component='dialog']").first();
    const supporting = dialog
      .locator("[data-slot='supporting-text']")
      .first();
    await expect(supporting).toBeVisible();
    const fontSize = await supporting.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("14px");
    const describedBy = await dialog.getAttribute("aria-describedby");
    const supportingId = await supporting.getAttribute("id");
    expect(describedBy).toBe(supportingId);
  });

  test("scrim renders a Backdrop layer at 32% opacity by default", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const scrim = page
      .locator("[data-role='dialog-scrim'][data-component='backdrop']")
      .first();
    await expect(scrim).toBeVisible();
    const styles = await scrim.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, opacity: cs.opacity };
    });
    expect(styles.bg).toBe(SCRIM);
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.32, 2);
  });

  test("scrim=false omits the Backdrop layer", async ({ page }) => {
    await page.goto(storyUrl("feedback-dialog--states"));
    const noScrim = page
      .locator("[data-component='dialog']")
      .nth(2);
    await expect(noScrim).toBeVisible();
    // The third state in States renders scrim=false; only two backdrops
    // should mount (one per scrimmed dialog above it).
    const backdrops = page.locator(
      "[data-role='dialog-scrim'][data-component='backdrop']",
    );
    await expect(backdrops).toHaveCount(2);
  });

  test("hero icon slot renders a 24dp glyph above the headline", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--slots"));
    const icon = page.locator("[data-slot='icon']").first();
    await expect(icon).toBeVisible();
    const box = await icon.boundingBox();
    expect(box?.width).toBeCloseTo(24, 0);
    expect(box?.height).toBeCloseTo(24, 0);
  });

  test("actions row aligns trailing buttons to the end of the surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const actions = page.locator("[data-slot='actions']").first();
    await expect(actions).toBeVisible();
    const styles = await actions.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        display: cs.display,
        justify: cs.justifyContent,
      };
    });
    expect(styles.display).toBe("flex");
    expect(styles.justify).toBe("flex-end");
  });

  test("contained mode positions the dialog absolutely inside its host", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const positioner = page
      .locator("[data-component='dialog-positioner']")
      .first();
    await expect(positioner).toBeVisible();
    const position = await positioner.evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(position).toBe("absolute");
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-dialog--default", "light", "no-preference"),
    );
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    const styles = await dialog.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("box-shadow");
    expect(styles.duration).toContain("0.3s");
  });

  test("Escape key with focus inside the dialog fires onClose", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-dialog--motion", "light", "no-preference"),
    );
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    await dialog.focus();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-component='dialog']")).toHaveCount(0);
  });

  test("click on the scrim fires onClose and unmounts via AnimatePresence", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-dialog--motion", "light", "no-preference"),
    );
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    const surface = page.locator("[data-host='dialog-surface']").first();
    const box = await surface.boundingBox();
    if (!box) throw new Error("surface bounding box missing");
    // Click in the corner — guaranteed to hit the scrim, not the
    // centered dialog surface.
    await page.mouse.click(box.x + 8, box.y + 8);
    await expect(page.locator("[data-component='dialog']")).toHaveCount(0);
  });

  test("click on the dialog surface itself does NOT fire onClose", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-dialog--motion", "light", "no-preference"),
    );
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    const title = dialog.locator("[data-slot='title']").first();
    await title.click();
    await expect(page.locator("[data-component='dialog']")).toHaveCount(1);
  });

  test("dark theme swaps the standard dialog to dark surface-container-high", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--default", "dark"));
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    const bg = await dialog.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGH);
  });

  test("ARIA: dialog renders with role=dialog and aria-modal=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--accessibility"));
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("playground renders + carries the title + supporting text + actions", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--playground"));
    const dialog = page.locator("[data-component='dialog']").first();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-slot='title']")).toHaveCount(1);
    await expect(dialog.locator("[data-slot='supporting-text']")).toHaveCount(
      1,
    );
    await expect(dialog.locator("[data-slot='actions']")).toHaveCount(1);
  });

  test("z-index: dialog positioner sits above the scrim", async ({ page }) => {
    await page.goto(storyUrl("feedback-dialog--default"));
    const positioner = page
      .locator("[data-component='dialog-positioner']")
      .first();
    const scrim = page
      .locator("[data-role='dialog-scrim'][data-component='backdrop']")
      .first();
    const positionerZ = await positioner.evaluate(
      (el) => window.getComputedStyle(el).zIndex,
    );
    const scrimZ = await scrim.evaluate(
      (el) => window.getComputedStyle(el).zIndex,
    );
    expect(parseInt(positionerZ, 10)).toBeGreaterThan(parseInt(scrimZ, 10));
  });

  test("the third States dialog uses scrim=false (no scrim under it)", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-dialog--states"));
    const dialogs = page.locator("[data-component='dialog']");
    await expect(dialogs).toHaveCount(3);
    const third = dialogs.nth(2);
    await expect(third).toBeVisible();
    // The third Surface in States is the no-scrim variant — verify
    // that no Backdrop is mounted inside the same host.
    const host = third.locator("xpath=ancestor::*[@data-host='dialog-surface']");
    await expect(
      host.locator("[data-role='dialog-scrim'][data-component='backdrop']"),
    ).toHaveCount(0);
  });
});
