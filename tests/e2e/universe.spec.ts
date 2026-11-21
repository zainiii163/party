import { test, expect, type Page } from "@playwright/test";

async function hideInvitationGate(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("cwr_e2e_gate_handled")) {
      sessionStorage.setItem("cwr_e2e_gate_handled", "1");
      localStorage.setItem("cwr_invitation_seen_v1", "1");
    }
  });
}

test("Universe section opens a real experience inside a modal", async ({ page }) => {
  await hideInvitationGate(page);
  await page.goto("/");
  const section = page.locator("#universe");
  await expect(section.getByRole("heading", { name: /Cousins Universe/i })).toBeVisible();
  await expect(section.getByRole("button", { name: /Magical Winter Portal/i })).toBeVisible();
  await section.getByRole("button", { name: /Magical Winter Portal/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Choose your doorway")).toBeVisible();
  await page.getByRole("button", { name: "Open golden door 1" }).click();
  await expect(page.getByText("Your surprise")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Close experience" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Universe experiences are responsive on a phone", async ({ page }) => {
  await hideInvitationGate(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await page.locator("#universe").scrollIntoViewIfNeeded();
  await page.locator("#universe").getByRole("button", { name: /3D Snow Globe/i }).click();
  await expect(page.getByText("Shake the little world")).toBeVisible();
});

test("public Universe API is read-only and rejects invented actions", async ({ request }) => {
  const response = await request.get("/api/universe");
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(Object.keys(json.config.experiences)).toHaveLength(25);
  expect(json.config.reveal).toBeNull();

  const invalid = await request.post("/api/universe", {
    data: { action: "report", experienceId: "not-a-real-experience", reason: "spoiler" },
  });
  expect(invalid.status()).toBe(400);
});

test("Universe admin controls require an organizer session", async ({ request }) => {
  const response = await request.get("/api/admin/universe");
  expect(response.status()).toBe(401);
});
