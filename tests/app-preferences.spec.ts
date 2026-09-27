import { expect, test } from "@playwright/test";
import { APP_ROUTES } from "../src/lib/routes";

test("switches language and color mode from the application header", async ({
  page,
}) => {
  await page.goto(APP_ROUTES.home);

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByLabel("Language").selectOption("fr");
  await expect(
    page.getByRole("heading", {
      name: /^(Bonjour|Bon apres-midi|Bonsoir), Chaker$/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Aujourd hui" })).toBeVisible();
});

test("opens the application version information dialog", async ({ page }) => {
  await page.goto(APP_ROUTES.home);

  await page.getByRole("button", { name: "Application information" }).click();
  await page.getByRole("menuitem", { name: "Version" }).click();

  const dialog = page.getByRole("dialog", { name: "Application version" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("0.1.0");
});
