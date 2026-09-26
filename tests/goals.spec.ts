import { expect, test } from "@playwright/test";

test("task-based progress updates from linked tasks but completion stays intentional", async ({
  page,
}) => {
  await page.goto("/goals");
  await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
  await expect(page.getByText("1 of 2 tasks completed")).toBeVisible();

  await page.goto("/goals?goalId=goal-gh300");
  await page
    .getByText("Complete a practice assessment", { exact: true })
    .click();
  await expect(page.getByText("2 of 2 tasks completed").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mark complete" }),
  ).toBeVisible();
  await expect(page.getByText("Active", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Completed", { exact: true })).toBeVisible();
});

test("manual progress can reach 100 percent without completing the Goal", async ({
  page,
}) => {
  await page.goto("/goals?goalId=goal-1");
  await page.getByRole("spinbutton", { name: "Progress (%)" }).fill("100");
  await page.getByRole("button", { name: "Save progress" }).click();

  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await expect(page.getByText("Active", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Completed", { exact: true })).toBeVisible();
});

test("tasks can be associated with a Goal from the task form", async ({
  page,
}) => {
  await page.goto("/tasks");
  await page.getByRole("button", { name: "New task" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill("Prepare GH-300 flash cards");
  await dialog.getByLabel("Goal").selectOption("goal-gh300");
  await dialog.getByRole("button", { name: "New task" }).click();

  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByText("Prepare GH-300 flash cards")).toBeVisible();
  await page.getByRole("link", { name: "Goals" }).click();
  await page.getByText("Pass GH-300", { exact: true }).click();
  await expect(page.getByText("Prepare GH-300 flash cards")).toBeVisible();
  await expect(page.getByText("1 of 3 tasks completed").first()).toBeVisible();
});
