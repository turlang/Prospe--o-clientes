import React from 'react';
import { audience } from '../content.js';

export default function Audience() {
  return (
    <section id="para-quem" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <span className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Para quem é</span>
          <h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            Para quem entrega tecnologia e quer vender com processo.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            O LeadHunter Pro não é um CRM genérico. Ele foi pensado em torno dos serviços que profissionais de tecnologia realmente vendem.
          </p>
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <strong className="text-sm font-black text-blue-950">Mais contexto. Menos abordagem fria.</strong>
            <p className="mt-2 text-sm leading-6 text-blue-900/70">Cada contato começa com sinais reais do negócio, ajudando você a apresentar uma solução relevante em vez de enviar uma mensagem genérica.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {audience.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
              <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-cyan-300"><Icon size={20} /></span><span className="text-xs font-black text-slate-300">0{index + 1}</span></div>
              <h3 className="mt-4 font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
