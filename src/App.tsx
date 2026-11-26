import { issuesFor, mapCatalog, suggest } from "#src/catalog.ts"
import { demo } from "#src/examples.ts"
import { Review } from "#src/Products.tsx"

const catalog = mapCatalog(demo, suggest(demo.headers))

export function App() {
  const issues = issuesFor(catalog.items)
  const pending = issues.filter((list) => list.length).length
  return (
    <section className="workspace content">
      <h2>Produtos do arquivo</h2>
      <p role="status">
        {catalog.items.length} no lote · {pending} com pendência
      </p>
      <Review items={catalog.items} issues={issues} />
    </section>
  )
}
