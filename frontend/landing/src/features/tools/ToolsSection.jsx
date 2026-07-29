/**
 * @fileoverview Vitrine das ferramentas disponíveis no sistema.
 *
 * @module landing/features/tools/ToolsSection
 */

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { TOOL_CARDS } from '../../data/content.js';
import SectionHeading from '../../shared/ui/SectionHeading.jsx';

export default function ToolsSection() {
  return (
    <section id="ferramentas" className="bg-slate-50 py-18 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Ferramentas do sistema"
          title="Seu funil comercial em um único lugar."
          description="Visualize o produto antes de criar a conta: descoberta, diagnóstico, abordagem, agenda, propostas e relatórios conectados ao mesmo lead."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {TOOL_CARDS.map((tool) => {
            const Icon = tool.icon;
            return (
              <article key={tool.title} className="group flex min-h-72 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-950/5">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-cyan-300"><Icon size={21} /></span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-blue-700">{tool.eyebrow}</span>
                </div>
                <h3 className="mt-6 text-xl font-black tracking-[-.025em] text-slate-950">{tool.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{tool.text}</p>
                <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <strong className="text-sm text-slate-900">{tool.metric}</strong>
                  <ArrowUpRight size={17} className="text-blue-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
