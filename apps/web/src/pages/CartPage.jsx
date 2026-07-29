import { Link } from "react-router-dom";
import { OrderSummary } from "../components/OrderSummary.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";

export function CartPage() {
  const {
    items,
    deliveryMode,
    setDeliveryMode,
    changeQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total
  } = useCart();

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <h1 className="text-3xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-3 text-zinc-400">Adicione produtos do cardápio para continuar.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950">
          Ver cardápio
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-3xl font-black">Carrinho</h1>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center">
              <img src={item.imageUrl} alt={item.name} className="h-28 w-full rounded-xl object-cover sm:w-32" />
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{formatCurrency(item.price)} por unidade</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => changeQuantity(item.id, item.quantity - 1)} className="h-9 w-9 rounded-lg border border-zinc-700">−</button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button type="button" onClick={() => changeQuantity(item.id, item.quantity + 1)} className="h-9 w-9 rounded-lg border border-zinc-700">+</button>
              </div>
              <strong className="min-w-24 text-right text-amber-400">
                {formatCurrency(Number(item.price) * item.quantity)}
              </strong>
              <button type="button" onClick={() => removeItem(item.id)} className="text-sm text-red-400 hover:text-red-300">
                Remover
              </button>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-bold">Resumo</h2>
        <fieldset className="my-5 space-y-2">
          <legend className="mb-2 text-sm font-semibold text-zinc-300">Forma de recebimento</legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 p-3">
            <input type="radio" checked={deliveryMode === "DELIVERY"} onChange={() => setDeliveryMode("DELIVERY")} />
            Entrega
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 p-3">
            <input type="radio" checked={deliveryMode === "PICKUP"} onChange={() => setDeliveryMode("PICKUP")} />
            Retirada
          </label>
        </fieldset>

        <OrderSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} />
        {deliveryMode === "DELIVERY" && subtotal < 70 && (
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Frete grátis em pedidos com subtotal a partir de R$ 70,00.
          </p>
        )}
        <Link to="/checkout" className="mt-6 block rounded-xl bg-amber-500 px-5 py-3 text-center font-bold text-zinc-950 hover:bg-amber-400">
          Continuar para checkout
        </Link>
      </aside>
    </div>
  );
}
