import { useRef, useState } from "react"
import {
  type Columns,
  issuesFor,
  mapCatalog,
  needsMapping,
  type Product,
  readFile,
  type Source,
  suggest,
} from "#src/catalog.ts"
import { EditDialog } from "#src/EditDialog.tsx"
import { demo } from "#src/examples.ts"
import { Preview, Review } from "#src/Products.tsx"

export function App() {
  const [catalog, setCatalog] = useState(() =>
    mapCatalog(demo, suggest(demo.headers)),
  )
  const [editing, setEditing] = useState<number | null>(null)
  const [reviewing, setReviewing] = useState(true)
  const [onlyIssues, setOnlyIssues] = useState(false)
  const filterInput = useRef<HTMLInputElement>(null)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState("")
  const request = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const issues = issuesFor(catalog.items)
  const pending = issues.filter((list) => list.length).length
  function startReview(next: Source, columns: Columns) {
    if (
      dirty &&
      !window.confirm(
        "Substituir o lote em revisão e suas alterações pelo novo arquivo?",
      )
    )
      return
    setDirty(false)
    setCatalog(mapCatalog(next, columns))
    setOnlyIssues(false)
    setReviewing(true)
    setEditing(null)
    setError("")
  }

  async function openFile(file: File) {
    const id = ++request.current
    try {
      const next = await readFile(file)
      if (id !== request.current) return
      if (needsMapping(next)) setError("Use os cabeçalhos sku, nome e preco.")
      else startReview(next, suggest(next.headers))
    } catch (reason) {
      if (id === request.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível abrir o arquivo.",
        )
    }
  }

  function saveCorrection(item: Product) {
    const updated = catalog.items.map((previous, index) =>
      index === editing ? item : previous,
    )
    const rowDisappears =
      editing !== null && onlyIssues && !issuesFor(updated)[editing].length
    setCatalog({ ...catalog, items: updated })
    setDirty(true)
    setEditing(null)
    if (rowDisappears) requestAnimationFrame(() => filterInput.current?.focus())
  }
  return (
    <section className="workspace content">
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      <div className="filebar">
        <b className="filename">{catalog.fileName}</b>
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => fileInput.current?.click()}
          >
            Abrir CSV
          </button>
          <input
            hidden
            aria-label="Arquivo CSV"
            type="file"
            accept=".csv,text/csv"
            ref={fileInput}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void openFile(file)
            }}
          />
        </div>
      </div>
      <nav aria-label="Visualizações">
        <button
          type="button"
          aria-pressed={reviewing}
          onClick={() => setReviewing(true)}
        >
          Revisão do lote
        </button>
        <button
          type="button"
          aria-pressed={!reviewing}
          onClick={() => setReviewing(false)}
        >
          Prévia do catálogo
        </button>
      </nav>
      <h2>{reviewing ? "Produtos do arquivo" : "Prévia do catálogo"}</h2>
      <p role="status">
        {catalog.items.length} no lote · {pending} com pendência
      </p>
      {reviewing ? (
        <>
          <label className="filter">
            <input
              ref={filterInput}
              type="checkbox"
              checked={onlyIssues}
              onChange={(event) => setOnlyIssues(event.target.checked)}
            />
            Só com pendências
          </label>
          <Review
            items={catalog.items}
            issues={issues}
            onlyIssues={onlyIssues}
            onEdit={(index) => {
              request.current++
              setEditing(index)
            }}
          />
        </>
      ) : (
        <Preview items={catalog.items} issues={issues} />
      )}
      {editing !== null && (
        <EditDialog
          item={catalog.items[editing]}
          issues={issues[editing]}
          onSave={saveCorrection}
          onDismiss={() => setEditing(null)}
        />
      )}
    </section>
  )
}
