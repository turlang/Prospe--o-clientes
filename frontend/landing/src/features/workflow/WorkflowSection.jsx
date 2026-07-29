/**
 * @fileoverview Fluxo visual que conecta sinal, diagnóstico, abordagem e venda.
 *
 * @module landing/features/workflow/WorkflowSection
 */

import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { WORKFLOW_STEPS } from '../../data/content.js';

export default function WorkflowSection() {
  return (
    <section id="como-funciona" className="relative overflow-hidden bg-[#f4f7fb] py-20 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,.09),transparent_42%)]" />
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Do sinal ao contrato</p>
            <h2 className="mt-4 max-w-[12ch] text-[clamp(2.3rem,4.2vw,4rem)] font-black leading-[.96] tracking-[-.055em] text-slate-950">Uma operação comercial que pensa antes de abordar.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-600">Em vez de entregar uma lista fria, o LeadHunter conecta descoberta, contexto e execução em uma única trilha de decisão.</p>
            <div className="mt-8 rounded-2xl border border-blue-200/70 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
              <strong className="flex items-center gap-2"><CheckCircle2 size={17} className="text-blue-600" /> Resultado esperado</strong>
              <span className="mt-1 block text-blue-800/75">Menos tempo pesquisando, mais conversas relevantes e um funil sempre organizado.</span>
            </div>
          </div>

          <ol className="relative space-y-4 before:absolute before:bottom-10 before:left-[27px] before:top-10 before:w-px before:bg-gradient-to-b before:from-blue-500 before:via-cyan-300 before:to-transparent sm:before:left-[35px]">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="group relative grid grid-cols-[56px_minmax(0,1fr)] gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_28px_65px_rgba(37,99,235,.1)] sm:grid-cols-[72px_minmax(0,1fr)] sm:p-6">
                  <div className="relative z-10 grid size-14 place-items-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/20 sm:size-[4.5rem]"><Icon size={23} /></div>
                  <div className="min-w-0 sm:pt-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-black uppercase tracking-[.18em] text-blue-600">Etapa 0{index + 1}</span>
                      <ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
                    </div>
                    <h3 className="mt-2 text-xl font-black tracking-[-.035em] text-slate-950 sm:text-2xl">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
