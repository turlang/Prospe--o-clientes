import { randomInt } from "node:crypto";

/**
 * Gera um código curto para comunicação com o cliente.
 * A coluna unique do banco continua sendo a garantia final de unicidade.
 */
export function generateOrderCode() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = randomInt(1000, 9999);
  return `DB${day}${month}${random}`;
}
