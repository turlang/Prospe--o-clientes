import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Brand from './Brand.jsx';

const links = [
  ['#recursos', 'Como funciona'],
  ['#ferramentas', 'Ferramentas'],
  ['#para-quem', 'Para quem é'],
  ['#planos', 'Planos']
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/92 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 lg:px-8">
        <Brand inverse />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-semibold text-slate-300 transition hover:text-white">
              {label}
            </a>
          ))}
          <a href="/app" className="text-sm font-bold text-slate-200 transition hover:text-white">
            Entrar
          </a>
          <a
            href="/app"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
          >
            Testar grátis <ArrowRight size={15} />
          </a>
        </nav>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-slate-950 px-4 py-4 lg:hidden" aria-label="Navegação mobile">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/5"
              >
                {label}
              </a>
            ))}
            <a href="/app" className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-blue-500 px-5 text-sm font-black text-white">
              Entrar / Testar grátis
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
