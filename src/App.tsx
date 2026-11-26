import { useRef, useState } from "react"
import { issuesFor, mapCatalog, type Product, suggest } from "#src/catalog.ts"
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
  const issues = issuesFor(catalog.items)
  const pending = issues.filter((list) => list.length).length
  function saveCorrection(item: Product) {
    const updated = catalog.items.map((previous, index) =>
      index === editing ? item : previous,
    )
    const rowDisappears =
      editing !== null && onlyIssues && !issuesFor(updated)[editing].length
    setCatalog({ ...catalog, items: updated })
    setEditing(null)
    if (rowDisappears) requestAnimationFrame(() => filterInput.current?.focus())
  }
  return (
    <section className="workspace content">
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
            onEdit={setEditing}
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
