import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Brand from './Brand.jsx';

const links = [
  ['#recursos', 'Recursos'],
  ['#para-quem', 'Para quem é'],
  ['#ferramentas', 'Ferramentas'],
  ['#planos', 'Planos']
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {links.map(([href, label]) => <a key={href} href={href} className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">{label}</a>)}
          <a href="/app" className="text-sm font-bold text-slate-800 transition hover:text-blue-600">Entrar no sistema</a>
          <a href="/app" className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500">
            Testar grátis <ArrowRight size={16} />
          </a>
        </nav>
        <button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-800 lg:hidden" aria-label="Abrir menu" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden" aria-label="Navegação mobile">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">{label}</a>)}
            <a href="/app" className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white">Entrar / Testar grátis</a>
          </div>
        </nav>
      )}
    </header>
  );
}
