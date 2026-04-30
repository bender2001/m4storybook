import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:6006/iframe.html?id=data-display-material-symbols--expressive-axes&viewMode=story");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(500);
const result = await page.evaluate(() => {
  const symbol = document.querySelector('[data-testid="hover-glyph-favorite"]');
  if (!symbol) return { found: false };
  const glyph = symbol.querySelector('[data-slot="glyph"]');
  return {
    found: true,
    glyphTag: glyph?.tagName,
    glyphInlineStyle: glyph?.getAttribute('style'),
    domStyleFVS: glyph?.style.fontVariationSettings,
    cssFVS: glyph ? window.getComputedStyle(glyph).fontVariationSettings : null,
    hasFVS: glyph?.style.cssText,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
