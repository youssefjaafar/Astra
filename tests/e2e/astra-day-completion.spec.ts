import { expect, type Page, test } from "@playwright/test";

const email = process.env.ASTRA_TEST_EMAIL;
const password = process.env.ASTRA_TEST_PASSWORD;

test.describe("Day Completion - time-based calculation", () => {
  test.skip(!email || !password, "Set ASTRA_TEST_EMAIL and ASTRA_TEST_PASSWORD to run authenticated E2E.");

  test("day completion percentage reflects time elapsed from wake to sleep target", async ({ page }) => {
    // Sign in
    await signIn(page);
    await expect(page.getByText("Command Center").first()).toBeVisible();

    // Extract day completion percentage from the command center
    const dayCompletionText = await page
      .locator("text=Day Completion")
      .locator("../following-sibling::p")
      .textContent();

    expect(dayCompletionText).toBeTruthy();
    const percentageMatch = dayCompletionText?.match(/(\d+)%/);
    expect(percentageMatch).toBeTruthy();

    const dayCompletionPercent = parseInt(percentageMatch?.[1] ?? "0", 10);

    // Verify percentage is reasonable (between 0 and 100)
    expect(dayCompletionPercent).toBeGreaterThanOrEqual(0);
    expect(dayCompletionPercent).toBeLessThanOrEqual(100);

    // Get current time and default wake/sleep times to validate the percentage is sensible
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;

    // Default wake = 6:30, sleep = 22:30 (from the form defaults)
    const wakeMinutes = 6 * 60 + 30; // 390
    const sleepMinutes = 22 * 60 + 30; // 1350

    // If it's during a normal day (6:30am - 10:30pm)
    if (nowTotalMinutes >= wakeMinutes && nowTotalMinutes < sleepMinutes) {
      const elapsedMinutes = nowTotalMinutes - wakeMinutes;
      const dayMinutes = sleepMinutes - wakeMinutes;
      const expectedPercent = Math.round((elapsedMinutes / dayMinutes) * 100);

      // Allow 5% tolerance for timing variations
      expect(dayCompletionPercent).toBeGreaterThanOrEqual(expectedPercent - 5);
      expect(dayCompletionPercent).toBeLessThanOrEqual(expectedPercent + 5);
    }

    console.log(`✓ Day completion: ${dayCompletionPercent}% (current time: ${nowHours}:${String(nowMinutes).padStart(2, "0")})`);
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
}
