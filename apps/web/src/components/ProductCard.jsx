import { useCart } from "../contexts/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";

/**
 * Componente reutilizável de apresentação e inclusão no carrinho.
 */
export function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/10">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-52 w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-4 p-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            {product.category === "BURGER" ? "Burger" : product.category === "DRINK" ? "Bebida" : "Acompanhamento"}
          </span>
          <h2 className="mt-1 text-xl font-bold">{product.name}</h2>
        </div>
        <p className="min-h-12 text-sm leading-6 text-zinc-400">{product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <strong className="text-xl text-amber-400">{formatCurrency(product.price)}</strong>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-zinc-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
