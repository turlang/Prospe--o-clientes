import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/http.js";
import { OrderSummary } from "../components/OrderSummary.jsx";
import { useCart } from "../contexts/CartContext.jsx";

const emptyAddress = {
  street: "",
  number: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  complement: ""
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, deliveryMode, subtotal, deliveryFee, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [address, setAddress] = useState(emptyAddress);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) return <Navigate to="/carrinho" replace />;

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const body = {
      deliveryMode,
      paymentMethod,
      notes,
      items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      ...(deliveryMode === "DELIVERY" ? { address } : {})
    };

    try {
      const { order } = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(body)
      });
      clearCart();
      navigate("/meus-pedidos", { state: { createdOrderCode: order.code } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">Checkout</h1>
          <p className="mt-2 text-zinc-400">Revise os dados antes de enviar o pedido.</p>
        </div>

        {deliveryMode === "DELIVERY" && (
          <fieldset className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:grid-cols-2">
            <legend className="px-2 font-bold">Endereço de entrega</legend>
            {[
              ["street", "Rua", "text"],
              ["number", "Número", "text"],
              ["district", "Bairro", "text"],
              ["city", "Cidade", "text"],
              ["state", "UF", "text"],
              ["zipCode", "CEP", "text"],
              ["complement", "Complemento", "text"]
            ].map(([field, label, type]) => (
              <label key={field} className={`text-sm font-semibold ${field === "street" || field === "complement" ? "sm:col-span-2" : ""}`}>
                {label}
                <input
                  type={type}
                  required={field !== "complement"}
                  maxLength={field === "state" ? 2 : undefined}
                  value={address[field]}
                  onChange={(event) => updateAddress(field, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-500"
                />
              </label>
            ))}
          </fieldset>
        )}

        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <legend className="px-2 font-bold">Pagamento simulado</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {[['PIX', 'Pix'], ['CARD', 'Cartão'], ['CASH', 'Dinheiro']].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 p-4">
                <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm font-semibold">
          Observações
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} rows={4} placeholder="Ex.: sem cebola" className="mt-2 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-amber-500" />
        </label>

        {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
      </section>

      <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:sticky lg:top-24">
        <h2 className="mb-5 text-xl font-bold">Total do pedido</h2>
        <OrderSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} />
        <button disabled={submitting} className="mt-6 w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-60">
          {submitting ? "Enviando..." : "Enviar pedido"}
        </button>
      </aside>
    </form>
  );
}
