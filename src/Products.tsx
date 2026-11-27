import { type Product, price } from "#src/catalog.ts"

type Props = { items: Product[]; issues: string[][] }
function Swatch({ item, className }: { item: Product; className: string }) {
  const color =
    item.color && /^#[0-9a-f]{6}$/i.test(item.color) ? item.color : undefined
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ backgroundColor: color }}
    />
  )
}

export function Review({
  items,
  issues,
  onlyIssues,
  saved,
  onEdit,
}: Props & {
  onlyIssues: boolean
  saved: boolean
  onEdit: (index: number) => void
}) {
  if (onlyIssues && issues.every((list) => !list.length))
    return <p className="empty">Nenhuma pendência neste lote.</p>
  return (
    <table className="listing" aria-label="Produtos do arquivo">
      <thead>
        <tr>
          {["Produto", "SKU", "Preço", "Situação", "Ação"].map((label) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const problems = issues[index]
          if (onlyIssues && !problems.length) return null
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Each row keeps its original CSV position throughout review.
            <tr key={index}>
              <td>
                <div className="product">
                  <Swatch item={item} className="swatch" />
                  <div>
                    <span className="name">{item.name || "Sem nome"}</span>
                    <small className="muted">
                      {item.category || "Produto"}
                    </small>
                  </div>
                </div>
              </td>
              <td className="sku">{item.sku || "Sem SKU"}</td>
              <td>{price(item.price)}</td>
              <td>
                <span className={"badge " + (problems.length ? "bad" : "good")}>
                  {problems.join(" · ") || "Pronto"}
                </span>
              </td>

              <td>
                {saved ? (
                  "Conferido"
                ) : (
                  <button
                    type="button"
                    className="link"
                    aria-label={
                      "Editar " +
                      (item.name || "produto") +
                      ", registro " +
                      (index + 1)
                    }
                    onClick={() => onEdit(index)}
                  >
                    Editar
                  </button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function Preview({ items, issues }: Props) {
  return (
    <div className="cards">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Preview preserves the immutable source record order.
        <article key={index} className="card">
          <Swatch item={item} className="sample" />
          <div>
            <small className="sku">{item.sku || "Sem SKU"}</small>
            <h3>{item.name || "Sem nome"}</h3>
            <small className="muted">{item.category || "Produto"}</small>
            <p className="gridprice">{price(item.price)}</p>
            {!!issues[index].length && (
              <small className="issue">{issues[index].join(" · ")}</small>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
