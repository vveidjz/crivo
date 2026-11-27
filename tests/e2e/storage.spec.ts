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
