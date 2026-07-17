import { expect, test } from "@playwright/test";

test.describe("public read-only demo", () => {
  test("opens without authentication and never contacts AI or the data API", async ({ page }) => {
    const protectedRequests: string[] = [];

    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/api/ai/") || url.pathname === "/api/db") {
        protectedRequests.push(`${request.method()} ${url.pathname}`);
      }
    });

    await page.goto("/demo");

    await expect(page).toHaveURL(/\/demo$/);
    await expect(page.getByText("Demo telemetry")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Good morning, Alex" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick Capture" })).toBeVisible();
    await expect(page.getByText("Preview only")).toBeVisible();
    await expect(page.getByText("AI Copilot Insight")).toBeVisible();
    expect(protectedRequests).toEqual([]);
  });

  test("keeps the real dashboard protected", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  });

  test("rejects anonymous requests before every paid AI operation", async ({ request }) => {
    const attempts = [
      request.post("/api/ai/quick-capture", { data: { rawText: "I drank 500ml water" } }),
      request.post("/api/ai/copilot", { data: { message: "Summarize my week" } }),
      request.post("/api/ai/daily-review", { data: { reviewDate: "2026-07-13" } }),
      request.post("/api/ai/weekly-report", { data: { weekStart: "2026-07-13" } }),
      request.post("/api/ai/insights", { data: {} }),
    ];

    const responses = await Promise.all(attempts);

    for (const response of responses) {
      expect(response.status()).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: "Authentication required." });
    }
  });
});
