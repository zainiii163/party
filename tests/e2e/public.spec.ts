import { test, expect, type Page } from "@playwright/test";

/**
 * Mark the one-time invitation gate as seen for tests that focus on other
 * behaviour. The sessionStorage guard makes this run once per test context,
 * so a later page.reload() does not erase the persisted localStorage flag.
 */
async function hideInvitationGate(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("cwr_e2e_gate_handled")) {
      sessionStorage.setItem("cwr_e2e_gate_handled", "1");
      localStorage.setItem("cwr_invitation_seen_v1", "1");
    }
  });
}

test("homepage renders the cinematic hero and section navigation", async ({ page }) => {
  await hideInvitationGate(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Winter Feels Warmer/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /Main navigation/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Who's Joining the Fun/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your Ideas, Our Perfect Reunion/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Spin the Fun/i })).toBeVisible();
});

test("invitation gate appears once and can be skipped", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Something Special Is Waiting For You...")).toBeVisible();
  await page.getByRole("button", { name: /Skip the animation/i }).click();
  await expect(page.getByText("Something Special Is Waiting For You...")).toHaveCount(0, { timeout: 5000 });
  await page.reload();
  await expect(page.getByText("Something Special Is Waiting For You...")).toHaveCount(0);
});

test("RSVP form shows friendly validation without a database", async ({ page }) => {
  await hideInvitationGate(page);
  await page.goto("/");
  await page.getByRole("heading", { name: /Save Your Seat/i }).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByText(/Please enter your full name/i)).toBeVisible();
});

test("fun wheel selects an activity", async ({ page }) => {
  await hideInvitationGate(page);
  await page.goto("/");
  await page.getByRole("heading", { name: /Spin the Fun/i }).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Just pick one for me/i }).click();
  await expect(page.locator("text=Your activity is")).toBeVisible({ timeout: 8000 });
});

test("personalised invitation card can be downloaded", async ({ page }) => {
  await hideInvitationGate(page);
  await page.goto("/");
  await page.getByLabel("Name for the card").fill("Ayesha");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download PNG/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("cousins-winter-reunion-ayesha");
});

test("admin pages are not publicly accessible", async ({ page }) => {
  await hideInvitationGate(page);
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/admin\/login$/, { timeout: 60_000 });
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  await hideInvitationGate(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
