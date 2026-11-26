import { expect, test } from "@playwright/test"

test("opens a CSV with canonical headers", async ({ page }) => {
  await page.goto("/")
  await page
    .getByLabel("Arquivo CSV")
    .setInputFiles("tests/fixtures/catalog.csv")
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await expect(page.locator("tbody")).toContainText("0007")
  await expect(page.locator("tbody")).toContainText("Papel, azul")
})
