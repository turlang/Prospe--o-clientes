import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/http.js";
import { ProductCard } from "../components/ProductCard.jsx";

const categories = [
  { value: "ALL", label: "Todos" },
  { value: "BURGER", label: "Burgers" },
  { value: "SIDE", label: "Acompanhamentos" },
  { value: "DRINK", label: "Bebidas" }
];

export function MenuPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (search.trim()) params.set("search", search.trim());

    apiRequest(`/products?${params.toString()}`)
      .then((payload) => {
        if (!active) return;
        if (!Array.isArray(payload?.products)) {
          throw new Error("A API retornou um formato inválido para o cardápio.");
        }
        setProducts(payload.products);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, search]);

  const featuredCount = useMemo(
    () => products.filter((product) => product?.featured).length,
    [products]
  );

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 p-8 md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">Delivery artesanal</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
          Lanches preparados para chegar quentes e bem montados.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-zinc-300">
          Escolha uma categoria, monte o carrinho e envie o pedido pelo checkout simulado.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          {featuredCount} oferta(s) em destaque na seleção atual.
        </p>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                category === item.value
                  ? "bg-amber-500 text-zinc-950"
                  : "border border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar no cardápio"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-amber-500 md:max-w-sm"
        />
      </section>

      {loading && <p className="py-20 text-center text-zinc-400">Carregando cardápio...</p>}
      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="py-20 text-center text-zinc-400">Nenhum produto encontrado.</p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
