import { expect, test } from "@playwright/test";
import { APP_ROUTES } from "../src/lib/routes";

test("quickly creates and completes a task", async ({ page }) => {
  await page.goto(APP_ROUTES.tasks);

  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Quickly add a task" })
    .fill("Write release notes");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByRole("button", { name: "All" }).click();

  const taskCheckbox = page.getByRole("checkbox", {
    name: "Write release notes",
  });
  await expect(taskCheckbox).toBeVisible();
  await page.getByText("Write release notes", { exact: true }).click();
  await expect(taskCheckbox).toBeChecked();
});

test("shows upcoming tasks grouped by date", async ({ page }) => {
  await page.goto(APP_ROUTES.tasks);
  await page.getByRole("button", { name: "Upcoming" }).click();

  await expect(page.getByText("Prepare design review notes")).toBeVisible();
  await expect(page.getByText("Finish course module three")).toBeVisible();
});
