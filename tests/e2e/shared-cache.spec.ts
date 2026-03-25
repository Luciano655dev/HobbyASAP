import { test, expect } from "@playwright/test"

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "hobbyasap_e2e_auth",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ])
})

test("new course page shows the generation screen and redirects when the shared course resolves", async ({
  page,
}) => {
  await page.route("**/api/course-sessions", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sessionId: "shared-session-1",
        templateId: "template-1",
        reusedTemplate: true,
        existingSession: false,
      }),
    })
  })

  await page.goto("/app/courses/new")
  await page.getByLabel("Hobby").fill("Photography")
  await page.getByRole("button", { name: "Generate section 1" }).click()

  await expect(page.getByText("Building your course")).toBeVisible()
  await expect(page.getByText("Photography")).toBeVisible()
  await expect(
    page.getByText("Checking whether this course already exists...")
  ).toBeVisible()

  await expect(page).toHaveURL(/\/app\/learn\?sessionId=shared-session-1/)
})
