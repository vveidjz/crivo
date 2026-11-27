import { expect, test } from "@playwright/test"

test("opens catalogs from the prototype and lets users recover from invalid storage", async ({
  page,
}) => {
  await page.goto("/")
  await page.evaluate(() =>
    localStorage.setItem(
      "crivo.catalog.v1",
      JSON.stringify({
        fileName: "legado.csv",
        example: false,
        items: [{ sku: "001", nome: "Legado", preco: "9,90" }],
      }),
    ),
  )
  await page.reload()
  await expect(page.getByRole("article")).toContainText("Legado")
  await page.evaluate(() =>
    localStorage.setItem("crivo.catalog.v1", '{"items":null}'),
  )
  await page.reload()
  await expect(page.getByRole("alert")).toContainText("recuperar")
  await expect(page.locator("tbody tr")).toHaveCount(6)
})

test("blocks incomplete batches and reopens confirmed data", async ({
  page,
}) => {
  await page.goto("/")
  const confirm = page.getByRole("button", { name: "Confirmar lote" })
  await expect(confirm).toBeDisabled()
  await page
    .getByLabel("Arquivo CSV")
    .setInputFiles("tests/fixtures/catalog.csv")
  await confirm.click()
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Catálogo confirmado" }),
  ).toBeVisible()
  await expect(page.getByRole("article")).toContainText("0007")
})

import type { Page } from "@playwright/test"

async function upload(
  page: Page,
  text: string | Buffer,
  name = "fornecedor.csv",
) {
  await page.getByLabel("Arquivo CSV").setInputFiles({
    name,
    mimeType: "text/csv",
    buffer: typeof text === "string" ? Buffer.from(text) : text,
  })
}

test("preserves the previous confirmed catalog until replacement succeeds", async ({
  page,
}) => {
  await page.goto("/")
  await upload(page, 'sku,nome,preco\n009,Original,"3,50"', "primeiro.csv")
  const confirm = page.getByRole("button", {
    name: "Confirmar lote",
    exact: true,
  })
  await confirm.click()
  await upload(page, "sku,nome,preco\n008,Segundo,12")
  await page.reload()
  await expect(page.getByRole("article")).toContainText("Original")
  await upload(page, "sku,nome,preco\n008,Segundo,12")
  page.once("dialog", (dialog) => dialog.dismiss())
  await confirm.click()
  await expect(confirm).toBeEnabled()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      Storage.prototype.setItem = original
      throw new DOMException("Quota", "QuotaExceededError")
    }
  })
  page.once("dialog", (dialog) => dialog.accept())
  await confirm.click()
  await expect(page.getByRole("alert")).toContainText("Não foi possível salvar")
  expect(
    await page.evaluate(() => localStorage.getItem("crivo.catalog.v1")),
  ).toContain("Original")
  page.once("dialog", (dialog) => dialog.accept())
  await confirm.click()
  await page.reload()
  await expect(page.getByRole("article")).toContainText("Segundo")
})
