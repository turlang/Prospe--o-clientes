import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="bg-white py-14 sm:py-18 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-5 py-10 text-white shadow-2xl shadow-blue-500/20 sm:px-10 sm:py-14 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.30),transparent_34%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[.18em] text-blue-100">Comece hoje</span>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl lg:text-5xl">Transforme prospecção em contratos de tecnologia.</h2>
              <p className="mt-4 text-base leading-7 text-blue-50 sm:text-lg">Encontre oportunidades para sites, sistemas, automações e IA e acompanhe tudo em um único lugar.</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-blue-50">
                {['10 leads gratuitos', 'Sem cartão de crédito', 'Acesso imediato'].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check size={14} /> {item}</span>)}
              </div>
            </div>
            <a href="/app" className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-blue-700 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50">Criar conta gratuita <ArrowRight size={17} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
