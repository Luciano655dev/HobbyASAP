import { test, expect } from "@playwright/test"

test("register redirects to the check-email flow", async ({ page }) => {
  await page.route("**/auth/v1/signup*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "user-1",
          email: "new@example.com",
        },
        session: null,
      }),
    })
  })

  await page.route("**/rest/v1/user_settings*", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({}),
    })
  })

  await page.route("**/api/metrics", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  })

  await page.goto("/register")
  await page.getByLabel("Name").fill("Luciano")
  await page.getByLabel("Email").fill("new@example.com")
  await page.getByLabel("Password").fill("strong-password")
  await page.getByRole("button", { name: "Create account" }).click()

  await expect(page).toHaveURL(/\/auth\/check-email\?mode=confirm/)
  await expect(page.getByText("Confirm your email")).toBeVisible()
  await expect(page.getByText("new@example.com")).toBeVisible()
})

test("forgot password redirects to the reset email instructions page", async ({
  page,
}) => {
  await page.route("**/auth/v1/recover*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    })
  })

  await page.goto("/forgot-password")
  await page.getByLabel("Email").fill("recover@example.com")
  await page.getByRole("button", { name: "Send reset email" }).click()

  await expect(page).toHaveURL(/\/auth\/check-email\?mode=recovery/)
  await expect(page.getByText("Check your reset email")).toBeVisible()
})
