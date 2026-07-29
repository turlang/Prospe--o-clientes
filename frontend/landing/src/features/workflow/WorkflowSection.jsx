/**
 * @fileoverview Seção que explica o fluxo operacional do produto.
 *
 * @module landing/features/workflow/WorkflowSection
 */

import React from 'react';
import { WORKFLOW_STEPS } from '../../data/content.js';
import SectionHeading from '../../shared/ui/SectionHeading.jsx';

export default function WorkflowSection() {
  return (
    <section id="como-funciona" className="bg-white py-18 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="O fluxo de prospecção tech"
          title="Da oportunidade encontrada ao contrato fechado."
          description="Uma operação comercial criada para quem vende sites, sistemas, automações e agentes de IA."
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
                <span className="absolute right-5 top-4 text-4xl font-black text-slate-100" aria-hidden="true">0{index + 1}</span>
                <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/15"><Icon size={22} /></span>
                <h3 className="mt-6 text-xl font-black tracking-[-.025em] text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
