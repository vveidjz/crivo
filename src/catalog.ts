import { parse } from "csv-parse/browser/esm/sync"

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
  return { headers, rows, fileName }
}
