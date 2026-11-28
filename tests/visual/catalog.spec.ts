import { expect, test } from "@playwright/test"

test.use({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
  locale: "pt-BR",
})

test("review visual", async ({ page }) => {
  await page.goto("/")
  await page.getByLabel("Só com pendências").check()
  await expect(page.locator("tbody tr")).toHaveCount(3)
  await expect(
    page.getByRole("table", { name: "Produtos do arquivo" }),
  ).toHaveScreenshot("review.png", { animations: "disabled" })
})
