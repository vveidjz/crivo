import { labels, type Product } from "#src/catalog.ts"
import { Dialog } from "#src/Dialog.tsx"

export function EditDialog({
  item,
  issues,
  onDismiss,
}: {
  item: Product
  issues: string[]
  onDismiss: () => void
}) {
  return (
    <Dialog id="editor" title="Editar produto" onDismiss={onDismiss}>
      <p>{issues.join(" · ") || "Produto pronto"}</p>
      {(["name", "sku", "price"] as const).map((key) => (
        <label key={key}>
          {labels[key]}
          <input value={item[key]} readOnly />
        </label>
      ))}
      <button type="button" className="btn" onClick={onDismiss}>
        Cancelar
      </button>
    </Dialog>
  )
}
