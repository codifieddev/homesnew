import { expect, test } from "@playwright/test";
import { gotoRoute, signIn } from "./helpers";

test.describe("admin authentication", () => {
  test("seeded admin can sign in and open the dashboard", async ({ page }) => {
    await signIn(page);
    await page.waitForURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: /Good morning, Admin/i })).toBeVisible();
  });

  test("company manager is redirected away from restricted settings", async ({
    page,
  }) => {
    await signIn(page, {
      email: "manager@homes.in",
      password: "Manager@Homes2025!",
    });
    await page.waitForURL(/\/admin$/);

    await gotoRoute(page, "/admin/settings");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
