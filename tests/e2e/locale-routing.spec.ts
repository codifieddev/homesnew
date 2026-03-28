import { expect, test } from "@playwright/test";
import {
  chooseLanguage,
  gotoRoute,
  openAnyLanguageMenu,
  openLanguageMenu,
} from "./helpers";

test.describe("locale routing", () => {
  test("default english canonicalizes to clean URLs", async ({ page }) => {
    await gotoRoute(page, "/en");
    await expect(page).toHaveURL(/\/$/);

    await gotoRoute(page, "/en/about");
    await page.waitForURL(/\/about$/);
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { name: /Guiding You|हमारे बारे में/i })
    ).toBeVisible();
  });

  test("language switcher adds and removes locale prefixes correctly", async ({
    page,
  }) => {
    await gotoRoute(page, "/about");

    await openLanguageMenu(page, /English/i);
    await chooseLanguage(page, /हिंदी/i);
    await page.waitForURL(/\/hi\/about$/);
    await expect(page).toHaveURL(/\/hi\/about$/);
    await expect(
      page.getByRole("heading", { name: /हर कदम|Guiding You/i })
    ).toBeVisible();

    await openAnyLanguageMenu(page);
    await chooseLanguage(page, /English/i);
    await page.waitForURL(/\/about$/);
    await expect(page).toHaveURL(/\/about$/);
  });

  test("non-default locale pages render on prefixed URLs", async ({ page }) => {
    await gotoRoute(page, "/hi/about");
    await page.waitForURL(/\/hi\/about$/);
    await expect(page).toHaveURL(/\/hi\/about$/);
    await expect(
      page.getByRole("heading", { name: /हर कदम|Guiding You/i })
    ).toBeVisible();
  });
});
