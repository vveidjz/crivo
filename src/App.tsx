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
import { sampleUrl, supplier } from "#src/examples.ts"
import { MappingDialog } from "#src/MappingDialog.tsx"
import { Preview, Review } from "#src/Products.tsx"
import { catalogKey, restore } from "#src/storage.ts"

export function App() {
  const [initial] = useState(restore)
  const [catalog, setCatalog] = useState(initial.catalog)
  const [saved, setSaved] = useState(initial.saved)
  const [editing, setEditing] = useState<number | null>(null)
  const [reviewing, setReviewing] = useState(!initial.saved)
  const [onlyIssues, setOnlyIssues] = useState(false)
  const previewButton = useRef<HTMLButtonElement>(null)
  const filterInput = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<Source | null>(() =>
    !initial.saved &&
    new URLSearchParams(location.search).get("exemplo") === "fornecedor"
      ? supplier
      : null,
  )
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState(initial.error)
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
    setSource(null)
    setDirty(false)
    setSaved(false)
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
      if (needsMapping(next)) setSource(next)
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
  function confirmBatch() {
    if (saved || pending) return
    request.current++
    try {
      const previous = localStorage.getItem(catalogKey)
      if (
        previous !== null &&
        !window.confirm(
          "Substituir o catálogo salvo neste navegador pelo lote de " +
            catalog.fileName +
            "?",
        )
      )
        return
      if (localStorage.getItem(catalogKey) !== previous) {
        setError(
          "O catálogo salvo mudou em outra aba. Confirme novamente para substituir a versão atual.",
        )
        return
      }
      localStorage.setItem(catalogKey, JSON.stringify(catalog))
    } catch {
      setError(
        "Não foi possível salvar. Mantenha a aba aberta, confira o espaço e as permissões do navegador e tente novamente.",
      )
      return
    }
    setSaved(true)
    setDirty(false)
    setReviewing(false)
    setError("")
    requestAnimationFrame(() => previewButton.current?.focus())
  }
  return (
    <section className="workspace" aria-label="Área de importação">
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      <div className="filebar">
        <div className="row">
          <span className="filetag">CSV</span>
          <div className="fileinfo">
            <b className="filename">{catalog.fileName}</b>
            <span className="soft">
              {saved
                ? "Catálogo salvo neste navegador"
                : catalog.example
                  ? "Lote de exemplo · Dados fictícios"
                  : "Arquivo local · Em revisão"}
            </span>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="link"
            onClick={() => {
              request.current++
              setSource(supplier)
            }}
          >
            Testar mapeamento
          </button>
          <a className="link" href={sampleUrl} download="tintas-exemplo.csv">
            Baixar exemplo
          </a>
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
          ref={previewButton}
          aria-pressed={!reviewing}
          onClick={() => setReviewing(false)}
        >
          {saved ? "Catálogo salvo" : "Prévia do catálogo"}
        </button>
      </nav>
      <div className="content">
        <div className="toolbar">
          <div>
            <h2>
              {reviewing
                ? "Produtos do arquivo"
                : saved
                  ? "Catálogo confirmado"
                  : "Prévia do catálogo"}
            </h2>
            <p className="summary" role="status">
              {catalog.items.length} no lote · {catalog.items.length - pending}{" "}
              prontos · {pending} com pendência
            </p>
          </div>
          {reviewing && (
            <label className="filter">
              <input
                ref={filterInput}
                type="checkbox"
                checked={onlyIssues}
                onChange={(event) => setOnlyIssues(event.target.checked)}
              />
              Só com pendências
            </label>
          )}
        </div>
        {reviewing ? (
          <Review
            items={catalog.items}
            issues={issues}
            onlyIssues={onlyIssues}
            saved={saved}
            onEdit={(index) => {
              request.current++
              setEditing(index)
            }}
          />
        ) : (
          <Preview items={catalog.items} issues={issues} />
        )}
        <div className="bottom">
          <p>
            {saved
              ? "Você pode fechar a aba. Seu catálogo estará aqui quando voltar."
              : pending
                ? "Corrija as pendências para confirmar o lote."
                : "Ao confirmar, o catálogo será salvo neste navegador."}
          </p>
          <button
            type="button"
            className="btn primary"
            onClick={confirmBatch}
            disabled={saved || pending > 0}
          >
            {saved ? "Lote confirmado" : "Confirmar lote"}
          </button>
        </div>
      </div>
      {source && (
        <MappingDialog
          source={source}
          onApply={(columns) => startReview(source, columns)}
          onDismiss={() => setSource(null)}
        />
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
