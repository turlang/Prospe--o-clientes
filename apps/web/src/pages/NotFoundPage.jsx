import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-400">Erro 404</p>
      <h1 className="mt-3 text-5xl font-black">Página não encontrada</h1>
      <Link to="/" className="mt-7 inline-block rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950">Voltar ao cardápio</Link>
    </section>
  );
}
