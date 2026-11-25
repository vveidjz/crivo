import { parse } from "csv-parse/browser/esm/sync"

const fields = ["sku", "name", "price", "category", "color"] as const
type Field = (typeof fields)[number]
type Columns = Record<Field, number>
type Source = {
  fileName: string
  headers: string[]
  rows: string[][]
}

const labels: Record<Field, string> = {
  sku: "SKU",
  name: "Nome",
  price: "Preço",
  category: "Categoria",
  color: "Cor",
}
const required = ["sku", "name", "price"] as const
const aliases: Partial<Record<Field, string>> = {
  sku: "referencia",
  name: "descricao",
  price: "valor",
}
const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export function parseCSV(text: string, fileName: string): Source {
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

export async function readFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".csv") || file.size > 256 * 1024)
    throw Error("Escolha um arquivo .csv de até 256 KiB.")
  const bytes = await file.arrayBuffer()
  let text: string
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    throw Error("Salve o CSV em UTF-8 antes de abrir.")
  }
  return parseCSV(text, file.name)
}

export function suggest(headers: string[]): Columns {
  const names = headers.map(normalize)
  const columns: Columns = {
    sku: -1,
    name: -1,
    price: -1,
    category: -1,
    color: -1,
  }
  for (const field of fields) {
    const exact = names.indexOf(normalize(labels[field]))
    columns[field] =
      exact >= 0 ? exact : names.findIndex((name) => name === aliases[field])
  }
  return columns
}

export function needsMapping(source: Source) {
  const names = source.headers.map(normalize)
  return (
    !required.every((field) => names.includes(normalize(labels[field]))) ||
    names.some(
      (name) => !fields.some((field) => normalize(labels[field]) === name),
    )
  )
}

export function mappingError(headers: string[], columns: Columns): string {
  const selected = new Set<number>()
  for (const field of fields) {
    const index = columns[field]
    if (index === -1 && (field === "color" || field === "category")) continue
    if (!Number.isInteger(index) || index < 0 || index >= headers.length)
      return "Escolha uma coluna para " + labels[field] + "."
    if (selected.has(index))
      return "Use a coluna “" + headers[index] + "” em apenas um campo."
    selected.add(index)
  }
  return ""
}
