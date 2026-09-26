import { expect, test } from "@playwright/test";

test("logs count progress and shows a compact week with unscheduled days", async ({
  page,
}) => {
  await page.goto("/habits");

  await expect(page.getByRole("heading", { name: "Habits" })).toBeVisible();
  await expect(page.getByText("5 / 8 glasses")).toBeVisible();
  await page.getByRole("button", { name: "Increase Water progress" }).click();
  await expect(page.getByText("6 / 8 glasses")).toBeVisible();
  await page.getByRole("button", { name: "Complete Water target" }).click();
  await expect(page.getByText("8 / 8 glasses")).toBeVisible();

  await page.getByRole("button", { name: "Week", exact: true }).click();
  await expect(page.getByText("Workout", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Gym is not scheduled/ }),
  ).toHaveCount(4);
});

test("creates a weekday habit and archives it without removing its week row", async ({
  page,
}) => {
  await page.goto("/habits");
  await page.getByRole("button", { name: "New habit" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Habit name").fill("Yoga");
  await dialog.getByLabel("Schedule").selectOption("weekdays");
  await dialog.getByText("Mon", { exact: true }).click();
  await dialog.getByText("Wed", { exact: true }).click();
  await dialog.getByText("Fri", { exact: true }).click();
  await dialog.getByRole("button", { name: "New habit" }).click();

  await expect(page.getByText("Habit created")).toBeVisible();
  await page.getByRole("button", { name: "Week", exact: true }).click();
  await expect(page.getByText("Yoga", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Archive Yoga" }).click();
  await expect(page.getByText("Habit archived")).toBeVisible();
  await page.getByRole("button", { name: "Archived", exact: true }).click();
  await page.getByRole("button", { name: "Week", exact: true }).click();
  await expect(page.getByText("Yoga", { exact: true })).toBeVisible();
});
