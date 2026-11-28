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

test("maps supplier data, fixes all pending records, and reopens the saved catalog", async ({
  page,
  context,
}) => {
  await page.goto("/")
  await upload(
    page,
    '\uFEFFValor;Referência;Descrição\r\n89,90;0001;"Papel, ""Azul"""\r\na combinar;0001;Tinta',
  )
  const mapping = page.getByRole("dialog", { name: "Mapear colunas" })
  await expect(mapping.getByLabel("SKU")).toHaveValue("1")
  await mapping.getByLabel("Preço").selectOption("1")
  await expect(
    mapping.getByRole("button", { name: "Revisar lote" }),
  ).toBeDisabled()
  await mapping.getByLabel("Preço").selectOption("0")
  await mapping.getByRole("button", { name: "Revisar lote" }).click()
  await page.getByLabel("Só com pendências").check()
  await expect(page.locator("tbody tr")).toHaveCount(2)
  await page.getByRole("button", { name: "Editar Tinta, registro 2" }).click()
  await page.getByLabel("SKU", { exact: true }).fill("0002")
  await page.getByLabel("Preço em reais").fill("0")
  await page.getByRole("button", { name: "Salvar correção" }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByLabel("Preço em reais").fill("109,90")
  await page.getByRole("button", { name: "Salvar correção" }).click()
  await expect(page.getByText("Nenhuma pendência neste lote.")).toBeVisible()
  await page.getByRole("button", { name: "Prévia do catálogo" }).click()
  await expect(
    page.getByRole("article").filter({ hasText: "Tinta" }),
  ).toContainText("109,90")
  await page.getByRole("button", { name: "Confirmar lote" }).click()
  await page.close()
  const reopened = await context.newPage()
  await reopened.goto("/?exemplo=fornecedor")
  await expect(
    reopened.getByRole("heading", { name: "Catálogo confirmado" }),
  ).toBeVisible()
  await expect(reopened.getByRole("article")).toHaveCount(2)
  await expect(reopened.getByRole("article").first()).toContainText("0001")
  await expect(reopened.getByRole("article").first()).toContainText(
    'Papel, "Azul"',
  )
  await expect(reopened.getByRole("article").last()).toContainText("0002")
})
