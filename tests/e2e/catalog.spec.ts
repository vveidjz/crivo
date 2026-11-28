import { expect, type Page, test } from "@playwright/test"

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

test("keeps the current batch on invalid files or cancelled mapping", async ({
  page,
}) => {
  await page.goto("/")
  for (const [csv, message] of [
    ['nome;sku;preco\n"a;b;1', "aspas"],
    ["Nome;nome;Preço\na;b;1", "único"],
    ["sku;nome;preco\na;b", "registro 1"],
    ["sku;nome;preco\n" + "a;b;1\n".repeat(201), "1 a 200"],
  ]) {
    await upload(page, csv)
    await expect(page.getByRole("alert")).toContainText(message)
  }
  await upload(page, Buffer.from([255]))
  await expect(page.getByRole("alert")).toContainText("UTF-8")
  await upload(page, Buffer.alloc(262145))
  await expect(page.getByRole("alert")).toContainText("256 KiB")
  await page.getByRole("button", { name: "Testar mapeamento" }).click()
  await page.getByRole("button", { name: "Cancelar" }).click()
  await expect(page.locator("tbody tr")).toHaveCount(6)
  await expect(
    page.getByRole("button", { name: "Confirmar lote" }),
  ).toBeDisabled()
})
