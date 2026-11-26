import type { FormEvent } from "react"
import { labels, type Product, validPrice } from "#src/catalog.ts"
import { Dialog } from "#src/Dialog.tsx"

export function EditDialog({
  item,
  issues,
  onSave,
  onDismiss,
}: {
  item: Product
  issues: string[]
  onSave: (item: Product) => void
  onDismiss: () => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const next = { ...item }
    for (const key of ["name", "sku", "price"] as const) {
      const input = form.elements.namedItem(key) as HTMLInputElement
      const value = input.value.trim()
      if (!value || (key === "price" && !validPrice(value))) {
        input.setCustomValidity(
          key === "price"
            ? "Informe um valor positivo com até duas casas decimais."
            : "Preencha este campo.",
        )
        input.reportValidity()
        return
      }
      next[key] = value
    }
    onSave(next)
  }
  return (
    <Dialog id="editor" title="Editar produto" onDismiss={onDismiss}>
      <form onSubmit={submit}>
        <p className="summary">
          {issues.join(" · ") || "Ajuste os dados deste produto."}
        </p>
        {(["name", "sku", "price"] as const).map((key) => (
          <label key={key}>
            {key === "price" ? "Preço em reais" : labels[key]}
            <input
              name={key}
              defaultValue={item[key]}
              required
              inputMode={key === "price" ? "decimal" : "text"}
              aria-describedby={key === "price" ? "priceHelp" : undefined}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
            />
          </label>
        ))}
        <small id="priceHelp">Exemplo: 189,90</small>
        <div className="actions">
          <button type="button" className="btn" onClick={onDismiss}>
            Cancelar
          </button>
          <button type="submit" className="btn primary">
            Salvar correção
          </button>
        </div>
      </form>
    </Dialog>
  )
}
