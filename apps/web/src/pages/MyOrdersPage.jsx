import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../api/http.js";
import { formatCurrency } from "../utils/currency.js";

const statusLabels = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado"
};

export function MyOrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/orders/my")
      .then((payload) => setOrders(payload.orders))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-black">Meus pedidos</h1>
      {location.state?.createdOrderCode && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          Pedido {location.state.createdOrderCode} enviado com sucesso.
        </p>
      )}
      {loading && <p className="py-16 text-center text-zinc-400">Carregando pedidos...</p>}
      {error && <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
      {!loading && orders.length === 0 && <p className="mt-6 text-zinc-400">Você ainda não possui pedidos.</p>}

      <div className="mt-6 space-y-5">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Código</p>
                <h2 className="text-xl font-bold text-amber-400">{order.code}</h2>
              </div>
              <span className="rounded-full bg-zinc-800 px-3 py-2 text-sm font-semibold">{statusLabels[order.status]}</span>
            </div>
            <ul className="mt-5 divide-y divide-zinc-800">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{item.quantity}× {item.productName}</span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4 font-bold">
              <span>Total</span>
              <span className="text-amber-400">{formatCurrency(order.total)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
