import { parse } from "csv-parse/browser/esm/sync"

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export function parseCSV(text: string, fileName: string) {
  const firstLine = text
    .trimStart()
    .split(/[\r\n]/, 1)[0]
    .replace(/"(?:[^"]|"")*"/g, "")
  const separator = firstLine.includes(";") ? ";" : ","
  let records: string[][]
  try {
    records = parse(text, {
      delimiter: separator,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    })
  } catch {
    throw Error("Confira as aspas e os separadores do CSV.")
  }
  const [headers = [], ...rows] = records
    .map((row) => row.map((value) => value.trim()))
    .filter((row) => row.length > 1 || row[0] !== "")
  const names = headers.map(normalize)
  if (headers.length < 3)
    throw Error("Inclua pelo menos três colunas para SKU, nome e preço.")
  if (names.includes("") || new Set(names).size !== names.length)
    throw Error("Cada coluna precisa de um nome único.")
  if (!rows.length || rows.length > 200)
    throw Error("Escolha um lote de 1 a 200 produtos.")
  const invalid = rows.findIndex((row) => row.length !== headers.length)
  if (invalid >= 0)
    throw Error(
      "O registro " +
        (invalid + 1) +
        " tem uma quantidade de campos diferente do cabeçalho.",
    )
  return { headers, rows, fileName }
}
