import { expect, test } from "@playwright/test";
import { APP_ROUTES } from "../src/lib/routes";

test("captures a note, pins it, and finds it through search", async ({
  page,
}) => {
  await page.goto(APP_ROUTES.notes);
  await page
    .getByRole("textbox", { name: "Quick note capture" })
    .fill("Call the clinic before noon");
  await page.getByRole("button", { name: "Capture note" }).click();

  await expect(page.getByRole("textbox", { name: "Note content" })).toHaveValue(
    "Call the clinic before noon",
  );
  await page.getByRole("button", { name: "Pin note" }).click();
  await expect(page.getByRole("button", { name: "Unpin note" })).toBeVisible();

  await page.getByRole("textbox", { name: "Search notes" }).fill("CLINIC");
  await expect(
    page.getByRole("button", { name: /Call the clinic before noon/ }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search notes" })
    .fill("not found phrase");
  await expect(page.getByText("No matching notes")).toBeVisible();
});

test("autosaves edits and confirms deletion", async ({ page }) => {
  await page.goto(APP_ROUTES.notes);
  await page.getByText("Dinner idea", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Note content" })
    .fill("Try the new recipe with lemon, chickpeas, and herbs.");

  await expect(page.getByText("Saved", { exact: true })).toBeVisible({
    timeout: 5_000,
  });
  await page.getByRole("button", { name: "Delete note" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Delete this note?")).toBeVisible();
  await dialog.getByRole("button", { name: "Delete note" }).click();

  await expect(page.getByText("Dinner idea", { exact: true })).toHaveCount(0);
});

test("Today quick capture saves into the Notes collection", async ({
  page,
}) => {
  await page.goto(APP_ROUTES.home);
  await page
    .getByRole("textbox", { name: "Quick note" })
    .fill("Remember to send the revised outline");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Note saved")).toBeVisible();

  await page.getByRole("button", { name: "Open global search" }).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page
    .getByRole("button", { name: /Remember to send the revised outline/ })
    .click();
  await expect(page.getByRole("textbox", { name: "Note content" })).toHaveValue(
    "Remember to send the revised outline",
  );
});
