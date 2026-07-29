import { useEffect, useState } from "react";
import { apiRequest } from "../api/http.js";
import { formatCurrency } from "../utils/currency.js";

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED"
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadOrders() {
    try {
      const payload = await apiRequest("/admin/orders");
      setOrders(payload.orders);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(orderId, status) {
    setUpdatingId(orderId);
    setError("");

    try {
      const { order: updatedOrder } = await apiRequest(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setOrders((current) => current.map((order) => order.id === orderId ? updatedOrder : order));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-amber-400">Painel administrativo</p>
          <h1 className="mt-1 text-3xl font-black">Gerenciamento de pedidos</h1>
        </div>
        <button type="button" onClick={loadOrders} className="rounded-xl border border-zinc-700 px-4 py-2 hover:border-zinc-500">Atualizar</button>
      </div>

      {error && <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800 bg-zinc-900 text-sm">
          <thead className="bg-zinc-950/70 text-left text-zinc-400">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Recebimento</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-4 font-bold text-amber-400">{order.code}</td>
                <td className="px-4 py-4">
                  <div>{order.user.name}</div>
                  <div className="text-xs text-zinc-500">{order.user.email}</div>
                </td>
                <td className="px-4 py-4">{order.deliveryMode === "DELIVERY" ? "Entrega" : "Retirada"}</td>
                <td className="px-4 py-4">{formatCurrency(order.total)}</td>
                <td className="px-4 py-4">
                  <select
                    value={order.status}
                    disabled={updatingId === order.id || ["DELIVERED", "CANCELED"].includes(order.status)}
                    onChange={(event) => changeStatus(order.id, event.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 disabled:opacity-60"
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
