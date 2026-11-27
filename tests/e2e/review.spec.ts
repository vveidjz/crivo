import { expect, test } from "@playwright/test"

test("fixing one duplicate clears both SKU warnings", async ({ page }) => {
  await page.goto("/")
  await page.getByLabel("Só com pendências").check()
  await expect(page.locator("tbody tr")).toHaveCount(3)
  await page.getByRole("button", { name: "Editar Marfim, registro 5" }).click()
  await page.getByLabel("SKU", { exact: true }).fill("T-005")
  await page.getByRole("button", { name: "Salvar correção" }).click()
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await expect(page.locator("tbody")).toContainText("Azul profundo")
})
