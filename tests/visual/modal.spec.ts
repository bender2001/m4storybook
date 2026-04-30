import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Modal.
 *
 * Modal is the primitive that powers Dialog / Drawer / Bottom Sheet,
 * re-skinned onto the M3 modal surface
 * (https://m3.material.io/components/dialogs/specs).
 *
 * Variants:
 *   - standard : surface-container-high + elevation-3 + xl radius
 *   - tonal    : primary-container + elevation-1 + xl radius
 *   - outlined : surface + 1dp outline border + elevation-0
 *   - text     : transparent fill + no border + elevation-0
 *   - elevated : surface-container-low + elevation-4 + xl radius
 *
 * Key tokens:
 *   - default shape : xl (28dp)
 *   - default size  : md (320..560px wide)
 *   - title type    : title-l (22px / 28px line-height)
 *   - body type     : body-l (16px)
 *   - scrim opacity : 0.32 (M3 dialog scrim)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const DARK_SURFACE_CONTAINER_HIGH = "rgb(43, 41, 48)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_SURFACE = "rgb(254, 247, 255)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const SCRIM = "rgb(0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Modal - M3 design parity", () => {
  test("default renders standard / md / xl with role=dialog + aria-modal=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--default"));
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("data-variant", "standard");
    await expect(modal).toHaveAttribute("data-size", "md");
    await expect(modal).toHaveAttribute("data-shape", "xl");
    await expect(modal).toHaveAttribute("role", "dialog");
    await expect(modal).toHaveAttribute("aria-modal", "true");
    const styles = await modal.evaluate((el) => {
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
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("standard variant: surface-container-high + elevation-3", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--variants"));
    const modal = page
      .locator("[data-component='modal'][data-variant='standard']")
      .first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, boxShadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("tonal variant: primary-container + elevation-1", async ({ page }) => {
    await page.goto(storyUrl("utils-modal--variants"));
    const modal = page
      .locator("[data-component='modal'][data-variant='tonal']")
      .first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, boxShadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("outlined variant: surface fill + 1dp outline border + no elevation", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--variants"));
    const modal = page
      .locator("[data-component='modal'][data-variant='outlined']")
      .first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
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
    // elevation-0 -> no opaque shadow
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
    expect(styles.boxShadow).not.toMatch(/rgb\(0, 0, 0\)/);
  });

  test("text variant: transparent fill + no border + no elevation", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--variants"));
    const modal = page
      .locator("[data-component='modal'][data-variant='text']")
      .first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(TRANSPARENT);
    expect(styles.boxShadow).not.toMatch(/rgba?\(0, 0, 0, 0\.[1-9]/);
    expect(styles.boxShadow).not.toMatch(/rgb\(0, 0, 0\)/);
  });

  test("elevated variant: surface-container-low + elevation-4", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--variants"));
    const modal = page
      .locator("[data-component='modal'][data-variant='elevated']")
      .first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, boxShadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.boxShadow).toMatch(/rgba?\(0, 0, 0, 0\.\d/);
  });

  test("size scale enforces M3 width bands (sm 400 / md 560 / lg 720 px max)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--sizes"));
    const matrix: Record<string, string> = {
      sm: "400px",
      md: "560px",
      lg: "720px",
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const modal = page
        .locator(`[data-component='modal'][data-size='${size}']`)
        .first();
      await expect(modal).toBeVisible();
      const maxWidth = await modal.evaluate(
        (el) => window.getComputedStyle(el).maxWidth,
      );
      expect(maxWidth, `size=${size}`).toBe(expected);
    }
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--shapes"));
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
      const modal = page
        .locator(`[data-component='modal'][data-shape='${shape}']`)
        .first();
      await expect(modal).toBeVisible();
      const radius = await modal.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("title slot uses title-l and the modal wires aria-labelledby to it", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--default"));
    const modal = page.locator("[data-component='modal']").first();
    const title = modal.locator("[data-slot='title']").first();
    await expect(title).toBeVisible();
    const styles = await title.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(styles.fontSize).toBe("22px");
    expect(styles.lineHeight).toBe("28px");
    const labelledBy = await modal.getAttribute("aria-labelledby");
    const titleId = await title.getAttribute("id");
    expect(labelledBy).toBe(titleId);
  });

  test("scrim renders a Backdrop layer at 32% opacity by default", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--default"));
    const scrim = page
      .locator("[data-role='modal-scrim'][data-component='backdrop']")
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
    await page.goto(storyUrl("utils-modal--states"));
    // States renders three modals; the third uses scrim=false.
    const modals = page.locator("[data-component='modal']");
    await expect(modals).toHaveCount(3);
    const noScrimHost = page
      .locator("[data-host='modal-surface']")
      .nth(2);
    await expect(
      noScrimHost.locator(
        "[data-role='modal-scrim'][data-component='backdrop']",
      ),
    ).toHaveCount(0);
  });

  test("leading-icon slot renders a 24dp glyph in the header row", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--slots"));
    const icon = page.locator("[data-slot='leading-icon']").first();
    await expect(icon).toBeVisible();
    const box = await icon.boundingBox();
    expect(box?.width).toBeCloseTo(24, 0);
    expect(box?.height).toBeCloseTo(24, 0);
  });

  test("trailing-icon slot renders a button labelled Close that fires onClose", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-modal--motion", "light", "no-preference"),
    );
    const close = page.locator("[data-slot='trailing-icon']").first();
    await expect(close).toBeVisible();
    await expect(close).toHaveAttribute("aria-label", "Close");
    await close.click();
    await expect(page.locator("[data-component='modal']")).toHaveCount(0);
  });

  test("actions row aligns trailing buttons to the end of the surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--default"));
    // Default has no actions row — open the slots story instead.
    await page.goto(storyUrl("utils-modal--slots"));
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

  test("contained mode positions the modal absolutely inside its host", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--default"));
    const positioner = page
      .locator("[data-component='modal-positioner']")
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
      storyUrl("utils-modal--default", "light", "no-preference"),
    );
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("box-shadow");
    expect(styles.property).toContain("opacity");
    expect(styles.duration).toContain("0.3s");
  });

  test("Escape key with focus inside the modal fires onClose", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-modal--motion", "light", "no-preference"),
    );
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    await modal.focus();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-component='modal']")).toHaveCount(0);
  });

  test("click on the scrim fires onClose and unmounts via AnimatePresence", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-modal--motion", "light", "no-preference"),
    );
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    const surface = page.locator("[data-host='modal-surface']").first();
    const box = await surface.boundingBox();
    if (!box) throw new Error("surface bounding box missing");
    // Click in the corner — guaranteed to hit the scrim, not the
    // centered modal surface.
    await page.mouse.click(box.x + 8, box.y + 8);
    await expect(page.locator("[data-component='modal']")).toHaveCount(0);
  });

  test("click on the modal surface itself does NOT fire onClose", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-modal--motion", "light", "no-preference"),
    );
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    const title = modal.locator("[data-slot='title']").first();
    await title.click();
    await expect(page.locator("[data-component='modal']")).toHaveCount(1);
  });

  test("disabled state dims the modal to opacity 0.38 and blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--states"));
    const modal = page
      .locator("[data-component='modal'][data-disabled='true']")
      .first();
    await expect(modal).toBeVisible();
    const styles = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("dark theme swaps the standard modal to dark surface-container-high", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--default", "dark"));
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    // The surface transitions background-color over medium2 (300ms)
    // when the theme decorator flips data-theme=dark; toHaveCSS auto-
    // retries until the resolved color settles on the dark token.
    await expect(modal).toHaveCSS(
      "background-color",
      DARK_SURFACE_CONTAINER_HIGH,
    );
  });

  test("ARIA: modal renders with role=dialog and aria-modal=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--accessibility"));
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("role", "dialog");
    await expect(modal).toHaveAttribute("aria-modal", "true");
  });

  test("playground renders + carries the title + content + actions", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-modal--playground"));
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    await expect(modal.locator("[data-slot='title']")).toHaveCount(1);
    await expect(modal.locator("[data-slot='content']")).toHaveCount(1);
    await expect(modal.locator("[data-slot='actions']")).toHaveCount(1);
  });

  test("z-index: modal positioner sits above the scrim", async ({ page }) => {
    await page.goto(storyUrl("utils-modal--default"));
    const positioner = page
      .locator("[data-component='modal-positioner']")
      .first();
    const scrim = page
      .locator("[data-role='modal-scrim'][data-component='backdrop']")
      .first();
    const positionerZ = await positioner.evaluate(
      (el) => window.getComputedStyle(el).zIndex,
    );
    const scrimZ = await scrim.evaluate(
      (el) => window.getComputedStyle(el).zIndex,
    );
    expect(parseInt(positionerZ, 10)).toBeGreaterThan(parseInt(scrimZ, 10));
  });

  test("focus trap: Tab from the last focusable element wraps to the first", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-modal--motion", "light", "no-preference"),
    );
    const modal = page.locator("[data-component='modal']").first();
    await expect(modal).toBeVisible();
    const close = page.locator("[data-slot='trailing-icon']").first();
    const buttons = modal.locator("button");
    const total = await buttons.count();
    expect(total).toBeGreaterThanOrEqual(2);
    // Focus the trailing close icon (first focusable in the modal).
    await close.focus();
    // Tab forward (total - 1) times to land on the last action button.
    for (let i = 0; i < total - 1; i++) {
      await page.keyboard.press("Tab");
    }
    // One more Tab should wrap to the trailing close icon.
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-slot"),
    );
    expect(focused).toBe("trailing-icon");
  });
});
