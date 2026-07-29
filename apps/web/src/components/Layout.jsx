import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";

function navigationClass({ isActive }) {
  return isActive
    ? "font-semibold text-amber-400"
    : "text-zinc-300 hover:text-white";
}

export function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <NavLink to="/" className="text-xl font-black tracking-tight text-amber-400">
            DELIVERY BURGER
          </NavLink>

          <nav className="flex flex-wrap items-center justify-end gap-4 text-sm">
            <NavLink to="/" className={navigationClass}>Cardápio</NavLink>
            <NavLink to="/carrinho" className={navigationClass}>Carrinho ({itemCount})</NavLink>
            {user && <NavLink to="/meus-pedidos" className={navigationClass}>Pedidos</NavLink>}
            {user?.role === "ADMIN" && (
              <NavLink to="/admin/pedidos" className={navigationClass}>Administração</NavLink>
            )}
            {user ? (
              <button type="button" onClick={logout} className="rounded-lg border border-zinc-700 px-3 py-2 hover:border-zinc-500">
                Sair
              </button>
            ) : (
              <NavLink to="/login" className="rounded-lg bg-amber-500 px-3 py-2 font-semibold text-zinc-950 hover:bg-amber-400">
                Entrar
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
        Projeto acadêmico full stack — React, Express, Prisma e PostgreSQL.
      </footer>
    </div>
  );
}
