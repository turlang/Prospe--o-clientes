import { formatCurrency } from "../utils/currency.js";

export function OrderSummary({ subtotal, deliveryFee, total }) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between text-zinc-400">
        <dt>Subtotal</dt>
        <dd>{formatCurrency(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-zinc-400">
        <dt>Frete</dt>
        <dd>{deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)}</dd>
      </div>
      <div className="flex justify-between border-t border-zinc-700 pt-3 text-lg font-bold">
        <dt>Total</dt>
        <dd className="text-amber-400">{formatCurrency(total)}</dd>
      </div>
    </dl>
  );
}
