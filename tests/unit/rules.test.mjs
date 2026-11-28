import { deepEqual, equal, match, rejects, throws } from "node:assert/strict"
import { test } from "node:test"
import {
  issuesFor,
  mapCatalog,
  mappingError,
  needsMapping,
  parseCSV,
  readFile,
  suggest,
} from "#src/catalog.ts"
import { price, validPrice } from "#src/price.ts"

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

test("rejects wrong row width and oversized batches", () => {
  throws(() => parseCSV("sku;nome;preco\n1;x", "a.csv"), /registro 1/)
  throws(
    () => parseCSV("sku;nome;preco\n" + "1;x;2\n".repeat(201), "a.csv"),
    /200/,
  )
})

test("checks file type, byte limit and encoding", async () => {
  await rejects(readFile(new File(["x"], "a.txt")), /256 KiB/)
  await rejects(
    readFile(new File([new Uint8Array(262145)], "a.csv")),
    /256 KiB/,
  )
  await rejects(readFile(new File([new Uint8Array([255])], "a.csv")), /UTF-8/)
  const batch = await readFile(new File(["sku;nome;preco\n007;x;1"], "a.csv"))
  equal(batch.rows[0][0], "007")
})

test("suggests supplier columns by normalized header", () => {
  const source = parseCSV("Valor;Referência;Descrição\n10;0001;Tinta", "a.csv")
  deepEqual(suggest(source.headers), {
    sku: 1,
    name: 2,
    price: 0,
    category: -1,
    color: -1,
  })
  equal(needsMapping(source), true)
})

test("requires distinct source columns", () => {
  const headers = ["sku", "nome", "preco"]
  const columns = suggest(headers)
  equal(mappingError(headers, columns), "")
  match(mappingError(headers, { ...columns, sku: -1 }), /SKU/)
  match(mappingError(headers, { ...columns, price: 0 }), /apenas um campo/)
})

test("maps a reordered source into a catalog", () => {
  const source = parseCSV(
    "Valor;Referência;Descrição\n12,50;007;Cobre",
    "a.csv",
  )
  const [product] = mapCatalog(source, suggest(source.headers)).items
  equal(product.sku, "007")
  equal(product.price, "12,50")
  equal(product.name, "Cobre")
})

test("accepts positive prices with up to two decimal places", () => {
  for (const value of ["12", "12.50", "12,50"]) equal(validPrice(value), true)
  for (const value of ["0", "-1", "1,999", "a combinar"])
    equal(validPrice(value), false)
  match(price("12,50"), /12,50/)
})

test("clears both duplicate warnings after correcting one SKU", () => {
  const items = [
    { sku: "a", name: "Areia", price: "10" },
    { sku: "A", name: "Marfim", price: "10" },
  ]
  deepEqual(issuesFor(items), [["SKU repetido"], ["SKU repetido"]])
  deepEqual(issuesFor([items[0], { ...items[1], sku: "b" }]), [[], []])
  deepEqual(issuesFor([{ sku: "", name: " ", price: "0" }])[0], [
    "Informe o nome",
    "Informe o SKU",
    "Revise o preço",
  ])
})

import { sampleCSV } from "#src/sample.ts"

test("finds three affected products in the demo", () => {
  const source = parseCSV(sampleCSV, "demo.csv")
  const catalog = mapCatalog(source, suggest(source.headers))
  equal(catalog.items.length, 6)
  equal(issuesFor(catalog.items).filter((list) => list.length).length, 3)
})

test("recognizes both supplier SKU aliases", () => {
  equal(suggest(["Código", "Nome", "Preço"]).sku, 0)
  equal(suggest(["Referência", "Nome", "Preço"]).sku, 0)
})
