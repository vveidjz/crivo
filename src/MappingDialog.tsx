import { useState } from "react"
import {
  type Columns,
  fields,
  labels,
  mappingError,
  type Source,
  suggest,
} from "#src/catalog.ts"
import { Dialog } from "#src/Dialog.tsx"

export function MappingDialog({
  source,
  onApply,
  onDismiss,
}: {
  source: Source
  onApply: (columns: Columns) => void
  onDismiss: () => void
}) {
  const [columns, setColumns] = useState(() => suggest(source.headers))
  const issue = mappingError(source.headers, columns)
  return (
    <Dialog id="mapper" title="Mapear colunas" onDismiss={onDismiss}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!issue) onApply(columns)
        }}
      >
        <p id="mapSource" className="summary">
          {source.fileName} · {source.rows.length}{" "}
          {source.rows.length === 1 ? "produto" : "produtos"}
        </p>
        <p className="summary">
          Associe cada campo à coluna do CSV usando os valores da primeira
          linha.
        </p>
        <div id="mapFields">
          {fields.map((field) => {
            const optional = field === "color" || field === "category"
            return (
              <div className="mapRow" key={field}>
                <label htmlFor={"column-" + field}>
                  {labels[field]}
                  <small className="muted">
                    {optional ? "Opcional" : "Obrigatório"}
                  </small>
                </label>
                <select
                  id={"column-" + field}
                  value={columns[field]}
                  onChange={(event) =>
                    setColumns({
                      ...columns,
                      [field]: Number(event.target.value),
                    })
                  }
                >
                  <option value={-1}>
                    {optional ? "Ignorar campo" : "Selecionar coluna"}
                  </option>
                  {source.headers.map((name, index) => (
                    <option key={name} value={index}>
                      {name} · {source.rows[0][index] || "(vazio)"}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
        <p className="summary" role="status">
          {issue || "Os três campos obrigatórios estão associados."}
        </p>
        <div className="actions">
          <button className="btn" type="button" onClick={onDismiss}>
            Cancelar
          </button>
          <button type="submit" className="btn primary" disabled={!!issue}>
            Revisar lote
          </button>
        </div>
      </form>
    </Dialog>
  )
}
