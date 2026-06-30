import { expect, type Locator, type Page, test } from "@playwright/test";

const email = process.env.ASTRA_TEST_EMAIL;
const password = process.env.ASTRA_TEST_PASSWORD;

test.describe("authenticated Astra module CRUD", () => {
  test.skip(!email || !password, "Set ASTRA_TEST_EMAIL and ASTRA_TEST_PASSWORD to run authenticated CRUD E2E.");

  test("covers authenticated CRUD flows across Astra modules", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const stamp = Date.now();
    const ids = {
      task: `E2E Task ${stamp}`,
      taskUpdated: `E2E Task Updated ${stamp}`,
      habit: `E2E Habit ${stamp}`,
      habitUpdated: `E2E Habit Updated ${stamp}`,
      time: `E2E Time Block ${stamp}`,
      timeUpdated: `E2E Time Block Updated ${stamp}`,
      meal: `E2E Meal ${stamp}`,
      mealUpdated: `E2E Meal Updated ${stamp}`,
      workout: `E2E Workout ${stamp}`,
      workoutUpdated: `E2E Workout Updated ${stamp}`,
      reviewText: `E2E well signal ${stamp}`,
      reviewUpdated: `E2E updated course correction ${stamp}`,
      profile: `Astra E2E ${stamp}`,
    };

    await signIn(page);
    await expect(page.getByText("Command Center").first()).toBeVisible();

    await dashboardQuickCaptureSmoke(page);
    await tasksCrud(page, ids.task, ids.taskUpdated);
    await habitsCrud(page, ids.habit, ids.habitUpdated);
    await timeCrud(page, ids.time, ids.timeUpdated);
    await mealsCrud(page, ids.meal, ids.mealUpdated);
    await workoutsCrud(page, ids.workout, ids.workoutUpdated);
    await reviewsCrud(page, ids.reviewText, ids.reviewUpdated);
    await aiCopilotCoverage(page);
    await settingsCrud(page, ids.profile);
    await mobileNavigationSmoke(page);
  });
});

async function signIn(page: Page) {
  if (!email || !password) throw new Error("Missing authenticated E2E credentials.");

  await page.goto("/login", { waitUntil: "load", timeout: 45_000 });
  await expect(page.getByLabel("Email")).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await submitLoginForm(page);

  if (page.url().includes("/onboarding")) {
    await page.getByLabel("Display name").fill("Astra E2E");
    await page.getByLabel("Main goal").fill("Validate Astra end-to-end stability.");
    await page.getByRole("button", { name: "Launch Command Center" }).click();
    await page.waitForURL(/\/dashboard(?:\?|$)/, { timeout: 30_000 });
  }
}

async function submitLoginForm(page: Page) {
  const loginButton = page.getByRole("button", { name: "Enter Command Center" });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.getByLabel("Email").fill(email ?? "");
    await page.getByLabel("Password").fill(password ?? "");
    await expect(loginButton).toBeEnabled();
    await expect(page.getByLabel("Email")).toHaveValue(email ?? "");
    await expect(page.getByLabel("Password")).toHaveValue(password ?? "");
    await loginButton.click();

    try {
      await page.waitForURL(/\/(dashboard|onboarding)(?:\?|$)/, { timeout: 20_000, waitUntil: "domcontentloaded" });
      return;
    } catch {
      const formText = await page.locator("form").textContent().catch(() => "");
      if (formText && /invalid|confirm|rate|disabled|credentials|not configured/i.test(formText)) {
        throw new Error(`Login failed: ${formText}`);
      }
    }
  }

  const formText = await page.locator("form").textContent().catch(() => "");
  throw new Error(`Login did not navigate after three attempts.${formText ? ` Last form text: ${formText}` : ""}`);
}

async function dashboardQuickCaptureSmoke(page: Page) {
  await gotoModule(page, "/dashboard");
  await expect(page.getByRole("heading", { name: "Quick Capture" })).toBeVisible();
  await page.waitForTimeout(750);
  const captureInput = page.getByPlaceholder("I drank 500ml water");
  const captureButton = page.getByRole("button", { name: "Capture Signal" });
  await fillAndEnable(captureInput, "I drank 250ml water", captureButton);
  await captureButton.click();

  const detected = page.getByText("Signal detected");
  const error = page.locator("text=/Quick Capture failed|AI service is not configured|AI service quota|AI service timed out|Astra could not/i");
  await expect(detected.or(error).first()).toBeVisible({ timeout: 30_000 });

  if (await detected.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Adjust later" }).click();
    await expect(page.getByText("cancelled").first()).toBeVisible();
  }
}

async function tasksCrud(page: Page, title: string, updatedTitle: string) {
  await gotoModule(page, "/tasks");
  await expect(page.getByRole("button", { name: "New Task" })).toBeVisible();

  const createDialog = await openDialog(page, page.getByRole("button", { name: "New Task" }), "New Task");
  await createDialog.getByLabel("Title").fill(title);
  await createDialog.getByLabel("Description").fill("Created by authenticated browser E2E.");
  await createDialog.getByLabel("Priority").selectOption("high");
  await createDialog.getByLabel("Status").selectOption("open");
  await createDialog.getByRole("button", { name: "Create Task" }).click();

  const card = recordCard(page, "task-card", title);
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Edit task" }).click();
  const editDialog = activeDialog(page, "Edit Task");
  await editDialog.getByLabel("Title").fill(updatedTitle);
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const updatedCard = recordCard(page, "task-card", updatedTitle);
  await expect(updatedCard).toBeVisible();

  await updatedCard.getByRole("button", { name: "Mark task complete" }).click();
  await expect(updatedCard.getByText("completed")).toBeVisible();
  await updatedCard.getByRole("button", { name: "Delete task" }).click();
  await expect(recordCard(page, "task-card", updatedTitle)).toHaveCount(0);
}

async function habitsCrud(page: Page, title: string, updatedTitle: string) {
  await gotoModule(page, "/habits");
  await expect(page.getByRole("button", { name: "New Habit" }).first()).toBeVisible();

  const createDialog = await openDialog(page, page.getByRole("button", { name: "New Habit" }).first(), "New Habit");
  await createDialog.getByLabel("Name").fill(title);
  await createDialog.getByLabel("Category").selectOption("custom");
  await createDialog.getByLabel("Target value").fill("2");
  await createDialog.getByLabel("Unit").fill("signals");
  await createDialog.getByRole("button", { name: "Create Habit" }).click();

  const card = recordCard(page, "habit-card", title);
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Log" }).click();
  const logDialog = activeDialog(page, title);
  await expect(logDialog).toBeVisible();
  await logDialog.getByLabel("Value").fill("1");
  await logDialog.getByLabel("Notes").fill("E2E habit log.");
  await logDialog.getByRole("button", { name: "Save Signal" }).click();
  await expect(card.getByText(/1\s*\/\s*2/)).toBeVisible();

  await card.getByRole("button", { name: "Edit" }).click();
  const editDialog = activeDialog(page, "Edit Habit");
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel("Name").fill(updatedTitle);
  await editDialog.getByLabel("Active system").uncheck();
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const updatedCard = recordCard(page, "habit-card", updatedTitle);
  await expect(updatedCard).toBeVisible();
  await expect(updatedCard.getByText("inactive")).toBeVisible();
}

async function timeCrud(page: Page, title: string, updatedTitle: string) {
  await gotoModule(page, "/time");
  await expect(page.getByRole("button", { name: "Log Time Block" }).first()).toBeVisible();

  const createDialog = await openDialog(page, page.getByRole("button", { name: "Log Time Block" }).first(), "Log Time Block");
  await createDialog.getByLabel("Title").fill(title);
  await createDialog.getByLabel("Category").selectOption("deep_work");
  await createDialog.getByLabel("Duration minutes").fill("25");
  await createDialog.getByLabel("Quality score").fill("8");
  await createDialog.getByLabel("Notes").fill("E2E time signal.");
  await createDialog.getByRole("button", { name: "Save Block" }).click();

  const card = recordCard(page, "time-block-card", title);
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: `Edit ${title}` }).click();
  const editDialog = activeDialog(page, "Edit Time Block");
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel("Title").fill(updatedTitle);
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const updatedCard = recordCard(page, "time-block-card", updatedTitle);
  await expect(updatedCard).toBeVisible();
  await updatedCard.getByRole("button", { name: `Delete ${updatedTitle}` }).click();
  await expect(recordCard(page, "time-block-card", updatedTitle)).toHaveCount(0);
}

async function mealsCrud(page: Page, title: string, updatedTitle: string) {
  await gotoModule(page, "/meals");
  await expect(page.getByRole("button", { name: "Log Meal" }).first()).toBeVisible();

  await page.getByRole("button", { name: "+250ml" }).click();
  await expect(page.getByRole("button", { name: "Undo latest water signal" })).toBeVisible();
  await page.getByRole("button", { name: "Undo latest water signal" }).click();

  const createDialog = await openDialog(page, page.getByRole("button", { name: "Log Meal" }).first(), "Log Meal");
  await createDialog.getByLabel("Meal type").selectOption("snack");
  await createDialog.getByLabel("Title").fill(title);
  await createDialog.getByLabel("Calories").fill("321");
  await createDialog.getByLabel("Protein grams").fill("22");
  await createDialog.getByLabel("Notes").fill("E2E fuel signal.");
  await createDialog.getByRole("button", { name: "Save Meal" }).click();

  const card = recordCard(page, "meal-card", title);
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: `Edit ${title}` }).click();
  const editDialog = activeDialog(page, "Edit Meal");
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel("Title").fill(updatedTitle);
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const updatedCard = recordCard(page, "meal-card", updatedTitle);
  await expect(updatedCard).toBeVisible();
  await updatedCard.getByRole("button", { name: `Delete ${updatedTitle}` }).click();
  await expect(recordCard(page, "meal-card", updatedTitle)).toHaveCount(0);
}

async function workoutsCrud(page: Page, title: string, updatedTitle: string) {
  await gotoModule(page, "/workouts");
  await expect(page.getByRole("button", { name: "Log Workout" }).first()).toBeVisible();

  const quickDialog = await openDialog(page, page.getByRole("button", { name: "Strength" }).first(), "Log Strength?");
  await quickDialog.getByRole("button", { name: "Save Workout" }).click();
  await expect(page.getByTestId("workout-card").filter({ hasText: "Strength" }).first()).toBeVisible();

  const createDialog = await openDialog(page, page.getByRole("button", { name: "Log Workout" }).first(), "Log Workout");
  await createDialog.getByLabel("Workout title").fill(title);
  await createDialog.getByLabel("Workout type").selectOption("mobility");
  await createDialog.getByLabel("Duration minutes").fill("18");
  await createDialog.getByLabel("Intensity").selectOption("low");
  await createDialog.getByLabel("Notes").fill("E2E training signal.");
  await createDialog.getByRole("button", { name: "Save Workout" }).click();

  const card = recordCard(page, "workout-card", title);
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: `Edit ${title}` }).click();
  const editDialog = activeDialog(page, "Edit Workout");
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel("Workout title").fill(updatedTitle);
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const updatedCard = recordCard(page, "workout-card", updatedTitle);
  await expect(updatedCard).toBeVisible();
  await updatedCard.getByRole("button", { name: `Delete ${updatedTitle}` }).click();
  await expect(recordCard(page, "workout-card", updatedTitle)).toHaveCount(0);
}

async function reviewsCrud(page: Page, reviewText: string, updatedText: string) {
  await gotoModule(page, "/reviews");
  await expect(page.getByText("Daily Debrief").first()).toBeVisible();

  await page.getByLabel("What went well?").fill(reviewText);
  await page.getByLabel("What drained your energy?").fill("E2E drain signal.");
  await page.getByLabel("What should improve tomorrow?").fill("E2E course correction.");
  await page.getByLabel("Mood score").fill("7");
  await page.getByLabel("Energy score").fill("6");
  await page.getByLabel("Focus score").fill("8");
  await page.getByRole("button", { name: "Save Debrief" }).click();
  await expect(page.getByText(reviewText).first()).toBeVisible();

  await page.getByLabel("What went well?").fill(updatedText);
  await page.getByLabel("What should improve tomorrow?").fill("E2E updated tomorrow signal.");
  await page.getByRole("button", { name: "Save Debrief" }).click();
  await expect(page.getByText(updatedText).first()).toBeVisible();

  await page.locator("#daily-debrief").getByRole("button", { name: "Generate" }).click();
  await expect(page.locator("text=/Daily summary generation failed|AI service is not configured|AI service quota|AI service timed out|things that went well|patterns/i").first()).toBeVisible({ timeout: 30_000 });
}

async function aiCopilotCoverage(page: Page) {
  await gotoModule(page, "/ai");
  await expect(page.getByText("Astra Intelligence Online")).toBeVisible();
  await page.getByPlaceholder("Ask: What should I focus on today?").fill("Give me one course correction for tomorrow.");
  await page.getByRole("button", { name: "Send Command" }).click();
  await expect(page.locator("text=/Astra Copilot could not|AI service is not configured|AI service timed out|Suggested Action|course correction/i").first()).toBeVisible({ timeout: 45_000 });

  if (await page.getByRole("button", { name: "Save Insight" }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Save Insight" }).click();
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  }
}

async function settingsCrud(page: Page, profileName: string) {
  await gotoModule(page, "/settings");
  await expect(page.getByText("Profile Settings")).toBeVisible();
  await page.getByLabel("Display name").fill(profileName);
  await page.getByLabel("Timezone").fill("America/Detroit");
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Profile settings saved.")).toBeVisible();

  await page.getByRole("button", { name: "Targets" }).click();
  await page.getByLabel("Water target in ml").fill("2400");
  await page.getByLabel("Workout target per week").fill("3");
  await page.getByRole("button", { name: "Save Targets" }).click();
  await expect(page.getByText("Daily targets saved.")).toBeVisible();

  await page.getByRole("button", { name: "AI Copilot" }).click();
  await page.getByLabel("AI tone").selectOption("calm");
  await page.getByLabel("Recommendation style").selectOption("balanced");
  await page.getByRole("button", { name: "Save AI Settings" }).click();
  await expect(page.locator("text=/AI Copilot settings saved/i").first()).toBeVisible();
}

async function mobileNavigationSmoke(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoModule(page, "/dashboard");
  await expect(page.getByRole("heading", { name: /Good morning/i })).toBeVisible();
  await page.getByRole("link", { name: /^Tasks$/i }).last().click();
  await expect(page.getByRole("button", { name: "New Task" })).toBeVisible();
  await page.getByRole("link", { name: /^AI Copilot$/i }).last().click();
  await expect(page.getByText("Astra Intelligence Online")).toBeVisible();
}

function recordCard(page: Page, testId: string, text: string): Locator {
  return page.getByTestId(testId).filter({ hasText: text });
}

function activeDialog(page: Page, title: string): Locator {
  return page.locator(".fixed").filter({ hasText: title }).first();
}

async function gotoModule(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(500);
}

async function fillAndEnable(input: Locator, value: string, button: Locator) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await input.fill(value);
    await expect(input).toHaveValue(value);

    try {
      await expect(button).toBeEnabled({ timeout: 2_000 });
      return;
    } catch {
      // Hydration can reset controlled fields immediately after navigation.
    }
  }

  await expect(button).toBeEnabled();
}

async function openDialog(page: Page, trigger: Locator, title: string) {
  const dialog = activeDialog(page, title);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await expect(trigger).toBeEnabled();
    await trigger.click();

    try {
      await expect(dialog).toBeVisible({ timeout: 2_500 });
      return dialog;
    } catch {
      await page.waitForTimeout(500);
    }
  }

  await expect(dialog).toBeVisible();
  return dialog;
}
