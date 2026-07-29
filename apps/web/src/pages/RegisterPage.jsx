import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <h1 className="text-3xl font-black">Criar conta</h1>
      <p className="mt-2 text-zinc-400">O cadastro cria um usuário com papel de cliente.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Nome
          <input required minLength={3} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="block text-sm font-semibold">E-mail
          <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="block text-sm font-semibold">Senha
          <input required type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-500" />
          <span className="mt-2 block text-xs font-normal text-zinc-500">Use pelo menos oito caracteres, maiúscula, minúscula e número.</span>
        </label>
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button disabled={submitting} className="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-60">
          {submitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-400">
        Já possui conta? <Link to="/login" className="font-semibold text-amber-400">Entrar</Link>
      </p>
    </section>
  );
}
