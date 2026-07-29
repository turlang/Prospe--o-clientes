import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/http.js";
import { browserStorage } from "../utils/storage.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "deliveryBurger.token";
const USER_KEY = "deliveryBurger.user";

function readStoredUser() {
  const storedUser = browserStorage.get(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.warn("[auth] Usuário armazenado era inválido e foi descartado.", error);
    browserStorage.remove(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(() => Boolean(browserStorage.get(TOKEN_KEY)));

  function persistSession(session) {
    if (!session?.token || !session?.user) {
      throw new Error("A API retornou uma sessão de autenticação inválida.");
    }

    browserStorage.set(TOKEN_KEY, session.token);
    browserStorage.set(USER_KEY, JSON.stringify(session.user));
    setUser(session.user);
  }

  async function login(credentials) {
    const session = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    persistSession(session);
    return session.user;
  }

  async function register(data) {
    const session = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });

    persistSession(session);
    return session.user;
  }

  function logout() {
    browserStorage.remove(TOKEN_KEY);
    browserStorage.remove(USER_KEY);
    setUser(null);
  }

  useEffect(() => {
    const token = browserStorage.get(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/auth/me")
      .then(({ user: currentUser }) => {
        if (!currentUser) {
          throw new Error("A API não retornou o usuário autenticado.");
        }

        browserStorage.set(USER_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
