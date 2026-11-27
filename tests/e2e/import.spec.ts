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

test("keeps a corrected draft when a replacement is declined", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Editar Marfim, registro 5" }).click()
  await page.getByLabel("SKU", { exact: true }).fill("T-005")
  await page.getByRole("button", { name: "Salvar correção" }).click()
  page.once("dialog", (dialog) => dialog.dismiss())
  await page
    .getByLabel("Arquivo CSV")
    .setInputFiles("tests/fixtures/catalog.csv")
  await expect(page.locator("tbody")).toContainText("T-005")
  await expect(page.locator("tbody tr")).toHaveCount(6)
})

test("maps supplier columns using the first product as a sample", async ({
  page,
}) => {
  await page.goto("/")
  await page
    .getByLabel("Arquivo CSV")
    .setInputFiles("tests/fixtures/supplier.csv")
  const form = page.getByRole("dialog", { name: "Mapear colunas" })
  await expect(form.getByLabel("SKU")).toHaveValue("1")
  await form.getByLabel("Preço").selectOption("1")
  await expect(
    form.getByRole("button", { name: "Revisar lote" }),
  ).toBeDisabled()
  await form.getByLabel("Preço").selectOption("0")
  await form.getByRole("button", { name: "Revisar lote" }).click()
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await expect(page.locator("tbody")).toContainText("Argila")
})
