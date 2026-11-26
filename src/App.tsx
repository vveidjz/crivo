import { useState } from "react"
import { issuesFor, mapCatalog, suggest } from "#src/catalog.ts"
import { EditDialog } from "#src/EditDialog.tsx"
import { demo } from "#src/examples.ts"
import { Preview, Review } from "#src/Products.tsx"

const catalog = mapCatalog(demo, suggest(demo.headers))

export function App() {
  const [editing, setEditing] = useState<number | null>(null)
  const [reviewing, setReviewing] = useState(true)
  const [onlyIssues, setOnlyIssues] = useState(false)
  const issues = issuesFor(catalog.items)
  const pending = issues.filter((list) => list.length).length
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
          onDismiss={() => setEditing(null)}
        />
      )}
    </section>
  )
}
