import { parseCSV } from "#src/catalog.ts"
import { sampleCSV } from "#src/sample.ts"

export const demo = parseCSV(sampleCSV, "tintas-exemplo.csv", true)
export const supplier = {
  ...demo,
  fileName: "tintas-fornecedor.csv",
  headers: ["Referência", "Descrição", "Valor", "Categoria", "Cor"],
}

export const sampleUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(sampleCSV)}`
