import { deepEqual, equal } from "node:assert/strict"
import { test } from "node:test"
import { parseCSV } from "#src/catalog.ts"

test("reads CSV headers and keeps leading zeros in SKU", () => {
  const source = parseCSV("sku,nome,preco\n0007,Papel,12", "papel.csv")
  equal(source.fileName, "papel.csv")
  deepEqual(source.headers, ["sku", "nome", "preco"])
  deepEqual(source.rows, [["0007", "Papel", "12"]])
})
