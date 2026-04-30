import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the Foundations / Atomic Design index page.
 *
 * Acceptance: the MDX page must list every atom / molecule / organism
 * with a working link to its Storybook docs page.
 *
 *  - 28 atoms, 19 molecules, 19 organisms (one entry per generic
 *    component shipped under src/components)
 *  - each entry links to its `?path=/docs/<slug>--docs` autodoc page
 *  - sections render with the correct headings and counts
 *  - typography/color tokens (display-s headline, on-surface foreground)
 *    confirm the page is wired to the M3 token system
 */

const ATOMIC_INDEX_URL =
  "/iframe.html?id=foundations-atomic-design--docs&viewMode=docs";

const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";

const ATOM_COUNT = 28;
const MOLECULE_COUNT = 19;
const ORGANISM_COUNT = 19;

test.describe("Atomic design index - M3 design parity", () => {
  test("page renders the headline + intro paragraph", async ({ page }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const heading = page.getByRole("heading", {
      level: 1,
      name: /atomic design/i,
    });
    await expect(heading).toBeVisible();
    // Storybook docs theme owns the H1 typography here, so token parity
    // is asserted on a card title (which sits inside our own surface).
    const cardTitle = page
      .locator("[data-slug='inputs-button']")
      .locator("span", { hasText: "Button" })
      .first();
    const cardColor = await cardTitle.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(cardColor).toBe(LIGHT_ON_SURFACE);
  });

  test("renders three sections (atoms, molecules, organisms)", async ({
    page,
  }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const sections = page.locator("[data-component='atomic-design-index'] section");
    await expect(sections).toHaveCount(3);
    await expect(sections.nth(0)).toHaveAttribute("data-section", "atom");
    await expect(sections.nth(1)).toHaveAttribute("data-section", "molecule");
    await expect(sections.nth(2)).toHaveAttribute("data-section", "organism");
  });

  test("atoms section lists every atom with a docs link", async ({ page }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const entries = page.locator(
      "[data-section='atom'] [data-slot='entry']",
    );
    await expect(entries).toHaveCount(ATOM_COUNT);
    const button = page.locator(
      "[data-section='atom'] [data-slug='inputs-button']",
    );
    await expect(button).toHaveAttribute(
      "href",
      "?path=/docs/inputs-button--docs",
    );
  });

  test("molecules section lists every molecule with a docs link", async ({
    page,
  }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const entries = page.locator(
      "[data-section='molecule'] [data-slot='entry']",
    );
    await expect(entries).toHaveCount(MOLECULE_COUNT);
    const textField = page.locator(
      "[data-section='molecule'] [data-slug='inputs-text-field']",
    );
    await expect(textField).toHaveAttribute(
      "href",
      "?path=/docs/inputs-text-field--docs",
    );
  });

  test("organisms section lists every organism with a docs link", async ({
    page,
  }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const entries = page.locator(
      "[data-section='organism'] [data-slot='entry']",
    );
    await expect(entries).toHaveCount(ORGANISM_COUNT);
    const tabs = page.locator(
      "[data-section='organism'] [data-slug='navigation-tabs']",
    );
    await expect(tabs).toHaveAttribute(
      "href",
      "?path=/docs/navigation-tabs--docs",
    );
  });

  test("each section publishes its component count", async ({ page }) => {
    await page.goto(ATOMIC_INDEX_URL);
    await expect(
      page.locator("[data-section='atom'] [data-slot='count']"),
    ).toHaveText(`${ATOM_COUNT} components`);
    await expect(
      page.locator("[data-section='molecule'] [data-slot='count']"),
    ).toHaveText(`${MOLECULE_COUNT} components`);
    await expect(
      page.locator("[data-section='organism'] [data-slot='count']"),
    ).toHaveText(`${ORGANISM_COUNT} components`);
  });

  test("entry cards carry the atomic-level + slug data attributes", async ({
    page,
  }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const entry = page
      .locator("[data-slug='surfaces-card']")
      .first();
    await expect(entry).toHaveAttribute("data-atomic-level", "organism");
    await expect(entry).toHaveAttribute(
      "href",
      "?path=/docs/surfaces-card--docs",
    );
  });

  test("total entry count is 66 generic components", async ({ page }) => {
    await page.goto(ATOMIC_INDEX_URL);
    const entries = page.locator(
      "[data-component='atomic-design-index'] [data-slot='entry']",
    );
    await expect(entries).toHaveCount(
      ATOM_COUNT + MOLECULE_COUNT + ORGANISM_COUNT,
    );
  });
});
