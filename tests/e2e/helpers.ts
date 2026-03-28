import { expect, type Page } from "@playwright/test";

export async function gotoRoute(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toBeVisible();
}

export async function openLanguageMenu(page: Page, currentLocaleLabel: RegExp | string) {
  const trigger = page.getByRole("button", { name: currentLocaleLabel }).first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  return trigger;
}

export async function openAnyLanguageMenu(page: Page) {
  const trigger = page
    .getByRole("button", { name: /English|Hindi|हिंदी/i })
    .first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  return trigger;
}

export async function chooseLanguage(page: Page, nativeLabel: RegExp | string) {
  const option = page.getByRole("menuitem").filter({ hasText: nativeLabel }).first();
  await expect(option).toBeVisible();
  await option.click();
}

export async function signIn(page: Page, options?: {
  localePrefix?: string;
  email?: string;
  password?: string;
  callbackUrl?: string;
}) {
  const {
    localePrefix = "",
    email = "admin@homes.in",
    password = "Admin@Homes2025!",
    callbackUrl = `${localePrefix || ""}/admin`,
  } = options ?? {};

  const loginPath = `${localePrefix || ""}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  await gotoRoute(page, loginPath);

  await page.getByLabel(/Email Address/i).fill(email);
  await page.getByLabel(/^Password$/i).fill(password);
  await page.getByRole("button", { name: /Sign In to Dashboard/i }).click();
}
