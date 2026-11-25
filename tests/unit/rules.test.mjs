import { deepEqual, equal, throws } from "node:assert/strict"
import { test } from "node:test"
import { parseCSV } from "#src/catalog.ts"

test("reads CSV headers and keeps leading zeros in SKU", () => {
  const source = parseCSV("sku,nome,preco\n0007,Papel,12", "papel.csv")
  equal(source.fileName, "papel.csv")
  deepEqual(source.headers, ["sku", "nome", "preco"])
  deepEqual(source.rows, [["0007", "Papel", "12"]])
})

test("reads quoted fields without converting identifiers", () => {
  const source = parseCSV(
    'sku,nome,preco\n0007,"Papel, azul","12,90"',
    "papel.csv",
  )
  deepEqual(source.rows, [["0007", "Papel, azul", "12,90"]])
  deepEqual(
    parseCSV('sku;nome;preco\n0008;"Tinta; azul";18', "tintas.csv").rows,
    [["0008", "Tinta; azul", "18"]],
  )
})

test("rejects repeated and insufficient headers", () => {
  throws(() => parseCSV("SKU;nome;NOME\n1;x;y", "a.csv"), /único/)
  throws(() => parseCSV("sku;nome\n1;x", "a.csv"), /três colunas/)
})
