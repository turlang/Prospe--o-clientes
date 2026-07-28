import React from 'react';
import Brand from './Brand.jsx';

export default function Footer() {
  return <footer className="border-t border-slate-200 bg-slate-50 py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8"><Brand /><p className="text-center text-xs text-slate-500">© 2026 LeadHunter Pro. Prospecção comercial para profissionais de tecnologia.</p><a href="/app" className="text-xs font-bold text-blue-600 hover:text-blue-500">Entrar no sistema</a></div></footer>;
}
