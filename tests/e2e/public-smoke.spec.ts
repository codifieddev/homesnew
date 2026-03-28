import { expect, test } from "@playwright/test";
import { gotoRoute } from "./helpers";

test.describe("public smoke", () => {
  test("projects filters preserve locale-aware URLs", async ({ page }) => {
    await gotoRoute(page, "/projects");
    const englishPlot = page.getByRole("button", { name: /^Plot$/ }).first();
    await englishPlot.scrollIntoViewIfNeeded();
    await englishPlot.click();
    await expect(page).toHaveURL(/\/projects\?type=Plot$/);

    await gotoRoute(page, "/hi/projects");
    const hindiPlot = page.getByRole("button", { name: /प्लॉट/i }).first();
    await hindiPlot.scrollIntoViewIfNeeded();
    await hindiPlot.click();
    await expect(page).toHaveURL(/\/hi\/projects\?type=Plot$/);
  });

  test("admin routes redirect unauthenticated users with locale intact", async ({
    page,
  }) => {
    await gotoRoute(page, "/admin");
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=%2Fadmin$/);

    await gotoRoute(page, "/hi/admin");
    await expect(page).toHaveURL(/\/hi\/auth\/login\?callbackUrl=%2Fhi%2Fadmin$/);
  });
});
