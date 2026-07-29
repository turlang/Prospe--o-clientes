/**
 * @fileoverview Chamada final de conversão da landing page.
 *
 * @module landing/features/cta/FinalCtaSection
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import ActionLink from '../../shared/ui/ActionLink.jsx';

export default function FinalCtaSection() {
  return (
    <section className="bg-slate-50 px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl shadow-blue-900/15 sm:p-12 lg:flex-row lg:items-center">
        <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-blue-100">Pronto para testar?</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Transforme prospecção em uma rotina comercial organizada.</h2><p className="mt-4 text-base leading-7 text-blue-100">Crie sua conta, encontre os primeiros leads e acompanhe cada oportunidade até o fechamento.</p></div>
        <ActionLink href="/app" variant="light" className="w-full shrink-0 sm:w-auto">Acessar o LeadHunter <ArrowRight size={17} /></ActionLink>
      </div>
    </section>
  );
}
