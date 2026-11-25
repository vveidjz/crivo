import { deepEqual, equal, rejects, throws } from "node:assert/strict"
import { test } from "node:test"
import { parseCSV, readFile } from "#src/catalog.ts"

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
