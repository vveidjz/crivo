import { parse } from "csv-parse/browser/esm/sync"

export function parseCSV(text: string, fileName: string) {
  let records: string[][]
  try {
    records = parse(text, {
      delimiter: ",",
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    })
  } catch {
    throw Error("Confira as aspas e os separadores do CSV.")
  }
  const [headers = [], ...rows] = records
  return { fileName, headers, rows }
}
