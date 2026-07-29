import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { browserStorage } from "../utils/storage.js";

const CartContext = createContext(null);
const STORAGE_KEY = "deliveryBurger.cart";
const FREE_DELIVERY_THRESHOLD = 70;
const STANDARD_DELIVERY_FEE = 7.9;

function readStoredCart() {
  const storedCart = browserStorage.get(STORAGE_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.warn("[cart] Carrinho armazenado era inválido e foi descartado.", error);
    browserStorage.remove(STORAGE_KEY);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [deliveryMode, setDeliveryMode] = useState("DELIVERY");

  useEffect(() => {
    browserStorage.set(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product) {
    if (!product?.id) {
      console.warn("[cart] Produto inválido ignorado.", product);
      return;
    }

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);

      if (existing) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(Number(item.quantity || 0) + 1, 20) }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, quantity) {
    const numericQuantity = Number(quantity);
    const normalizedQuantity = Number.isFinite(numericQuantity)
      ? Math.max(0, Math.min(numericQuantity, 20))
      : 0;

    setItems((currentItems) =>
      normalizedQuantity === 0
        ? currentItems.filter((item) => item.id !== productId)
        : currentItems.map((item) =>
            item.id === productId ? { ...item, quantity: normalizedQuantity } : item
          )
    );
  }

  function removeItem(productId) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        return sum + (Number.isFinite(price) ? price : 0) * (Number.isFinite(quantity) ? quantity : 0);
      }, 0),
    [items]
  );

  const deliveryFee =
    deliveryMode === "PICKUP" || subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : STANDARD_DELIVERY_FEE;

  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const value = useMemo(
    () => ({
      items,
      deliveryMode,
      setDeliveryMode,
      addItem,
      changeQuantity,
      removeItem,
      clearCart,
      subtotal,
      deliveryFee,
      total,
      itemCount
    }),
    [items, deliveryMode, subtotal, deliveryFee, total, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}
