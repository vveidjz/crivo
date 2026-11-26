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

export function Review({ items, issues }: Props) {
  return (
    <table className="listing" aria-label="Produtos do arquivo">
      <thead>
        <tr>
          {["Produto", "SKU", "Preço", "Situação"].map((label) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const problems = issues[index]
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
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
