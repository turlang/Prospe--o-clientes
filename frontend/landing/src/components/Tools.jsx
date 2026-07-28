import React from 'react';
import { ArrowUpRight, Bot, CheckCircle2, Clock3, DollarSign } from 'lucide-react';
import { showcase } from '../content.js';

const kanban = [
  { title: 'Novos', count: 12, leads: [['Clínica Horizonte', 'Site + automação'], ['Atlas Contábil', 'Redesign web']] },
  { title: 'Contatados', count: 7, leads: [['Vitta Estética', 'Landing page'], ['Rota Logística', 'Sistema interno']] },
  { title: 'Proposta', count: 3, leads: [['Nova Forma', 'R$ 4.800'], ['Solaris Energia', 'R$ 7.200']] }
];

export default function Tools() {
  return (
    <section id="ferramentas" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Ferramentas do sistema</span>
          <h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            Veja o que acontece depois que um lead é encontrado.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            O sistema transforma dados dispersos em prioridade, abordagem e próxima ação comercial.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.28fr_.72fr]">
          <article className="relative overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/40 sm:p-7 lg:p-8">
            <div className="absolute right-0 top-0 h-64 w-64 bg-blue-500/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">CRM visual</span>
                <h3 className="mt-2 text-2xl font-black tracking-[-.03em] sm:text-3xl">Seu funil comercial em um único lugar.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Acompanhe cada oportunidade do primeiro contato ao fechamento, sem planilhas soltas ou tarefas esquecidas.</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-300"><Clock3 size={13} /> Atualizado agora</span>
            </div>

            <div className="relative mt-7 grid gap-3 md:grid-cols-3">
              {kanban.map((column, columnIndex) => (
                <div key={column.title} className="rounded-2xl border border-white/10 bg-white/[.055] p-3.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[.12em] text-slate-400"><span>{column.title}</span><span>{column.count}</span></div>
                  <div className="mt-3 space-y-2.5">
                    {column.leads.map(([name, service], leadIndex) => (
                      <div key={name} className="rounded-xl bg-white p-3 text-slate-950 shadow-lg shadow-black/10">
                        <div className="flex items-start justify-between gap-2"><strong className="text-xs">{name}</strong>{columnIndex === 2 && leadIndex === 0 ? <DollarSign size={13} className="text-emerald-500" /> : <ArrowUpRight size={13} className="text-blue-500" />}</div>
                        <span className="mt-1 block text-[10px] text-slate-500">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-lg font-black text-blue-600">92</span><CheckCircle2 size={20} className="text-emerald-500" /></div>
              <h3 className="mt-5 text-xl font-black text-slate-950">Lead Score</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Priorize empresas com maior probabilidade de precisar da solução que você vende.</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" /></div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><Bot size={21} /></span>
              <h3 className="mt-5 text-xl font-black text-slate-950">Copiloto comercial</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Receba mensagem sugerida, próxima ação e alertas para manter cada oportunidade em movimento.</p>
              <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-xs leading-5 text-violet-900">“Use o problema de agendamento como ponto de entrada e proponha uma demonstração curta.”</div>
            </article>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {showcase.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-cyan-300"><Icon size={19} /></span>
              <h3 className="mt-4 font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
