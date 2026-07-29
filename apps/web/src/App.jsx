import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { AdminOrdersPage } from "./pages/AdminOrdersPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { MenuPage } from "./pages/MenuPage.jsx";
import { MyOrdersPage } from "./pages/MyOrdersPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MenuPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="cadastro" element={<RegisterPage />} />
        <Route path="carrinho" element={<CartPage />} />
        <Route
          path="checkout"
          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
        />
        <Route
          path="meus-pedidos"
          element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>}
        />
        <Route
          path="admin/pedidos"
          element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
