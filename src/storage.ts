import {
  type Catalog,
  issuesFor,
  mapCatalog,
  type Product,
  suggest,
} from "#src/catalog.ts"
import { demo } from "#src/examples.ts"

const required = ["sku", "name", "price"] as const

export const catalogKey = "crivo.catalog.v1"
function readStoredProduct(item: unknown): unknown {
  if (!item || typeof item !== "object" || "name" in item) return item
  const legacy = item as Record<string, unknown>
  return {
    sku: legacy.sku,
    name: legacy.nome,
    price: legacy.preco,
    category: legacy.categoria,
    color: legacy.cor,
  }
}

function isProduct(item: unknown): item is Product {
  if (!item || typeof item !== "object") return false
  const row = item as Record<string, unknown>
  return (
    required.every((key) => typeof row[key] === "string") &&
    ["category", "color"].every(
      (key) => row[key] === undefined || typeof row[key] === "string",
    )
  )
}

export function restore(): { catalog: Catalog; saved: boolean; error: string } {
  const initial = {
    catalog: mapCatalog(demo, suggest(demo.headers)),
    saved: false,
    error: "",
  }
  let raw: string | null
  try {
    raw = localStorage.getItem(catalogKey)
  } catch {
    return {
      ...initial,
      error: "Armazenamento indisponível. Você ainda pode revisar o lote.",
    }
  }
  if (raw === null) return initial
  try {
    const saved = JSON.parse(raw)
    if (Array.isArray(saved?.items))
      saved.items = saved.items.map(readStoredProduct)
    if (
      typeof saved.fileName === "string" &&
      saved.fileName.trim() &&
      typeof saved.example === "boolean" &&
      Array.isArray(saved.items) &&
      saved.items.length > 0 &&
      saved.items.length <= 200 &&
      saved.items.every(isProduct) &&
      issuesFor(saved.items).every((issues) => !issues.length)
    ) {
      return { catalog: saved, saved: true, error: "" }
    }
  } catch {
    /* Invalid stored data stays intact until the user confirms a replacement. */
  }
  return {
    ...initial,
    error:
      "Não foi possível ler o catálogo salvo. Abra o CSV de origem para recuperar os produtos.",
  }
}
