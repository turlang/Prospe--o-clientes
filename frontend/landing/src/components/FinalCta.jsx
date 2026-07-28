import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 px-6 py-10 text-center text-white shadow-2xl shadow-blue-500/20 sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.28),transparent_32%)]" />
          <div className="relative mx-auto max-w-3xl"><span className="text-xs font-black uppercase tracking-[.18em] text-blue-100">Pronto para testar?</span><h2 className="mt-3 text-3xl font-black tracking-[-.035em] sm:text-4xl">Transforme prospecção em um processo comercial previsível.</h2><p className="mt-4 text-blue-50">Encontre oportunidades para sites, sistemas, automações e agentes de IA — e acompanhe tudo em um único lugar.</p><a href="/app" className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-blue-700 transition hover:-translate-y-0.5">Criar conta gratuita <ArrowRight size={17} /></a></div>
        </div>
      </div>
    </section>
  );
}
