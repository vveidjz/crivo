import { parseCSV } from "#src/catalog.ts"
import { sampleCSV } from "#src/sample.ts"

export const demo = parseCSV(sampleCSV, "tintas-exemplo.csv")
