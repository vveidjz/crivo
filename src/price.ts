export function validPrice(value: string) {
  return (
    /^\d{1,9}([.,]\d{1,2})?$/.test(value) && Number(value.replace(",", ".")) > 0
  )
}
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})
export function price(value: string) {
  return validPrice(value)
    ? currency.format(Number(value.replace(",", ".")))
    : value || "Sem preço"
}
