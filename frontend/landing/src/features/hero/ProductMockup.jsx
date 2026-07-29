/**
 * @fileoverview Mockup visual do produto exibido no hero.
 *
 * O componente usa dados demonstrativos e não representa métricas reais do
 * usuário. Ele comunica as principais capacidades sem depender da API.
 *
 * @module landing/features/hero/ProductMockup
 */

import React from 'react';
import { Bot, ChartNoAxesCombined, CircleDot, Search, Send, Sparkles } from 'lucide-react';

const LEADS = Object.freeze([
  { name: 'Clínica Horizonte', need: 'Site + automação', score: 92 },
  { name: 'Atlas Contábil', need: 'Redesign web', score: 86 },
  { name: 'Nova Forma Móveis', need: 'Site institucional', score: 81 }
]);

export default function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:mx-0" aria-label="Demonstração visual do radar comercial">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900 shadow-2xl shadow-blue-950/50">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex gap-2" aria-hidden="true"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 sm:text-xs"><CircleDot size={11} className="text-emerald-400" /> Operação comercial ativa</span>
          <span className="rounded-md border border-white/10 px-2 py-1 text-[9px] font-black text-slate-300 sm:text-[10px]">LeadHunter Pro</span>
        </div>

        <div className="grid min-h-[390px] grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[58px_minmax(0,1fr)]">
          <aside className="border-r border-white/10 px-2 py-4" aria-hidden="true">
            {[ChartNoAxesCombined, Search, Sparkles, Bot].map((Icon, index) => (
              <span key={Icon.displayName || Icon.name} className={`mb-3 grid aspect-square place-items-center rounded-lg ${index === 0 ? 'bg-blue-500 text-white' : 'text-slate-500'}`}><Icon size={15} /></span>
            ))}
          </aside>

          <div className="min-w-0 p-3 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300 sm:text-[10px]">Radar de oportunidades</p>
                <h2 className="mt-1 text-sm font-black text-white sm:text-lg">Empresas prontas para receber sua proposta</h2>
              </div>
              <button type="button" tabIndex={-1} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 text-[10px] font-black text-white sm:text-xs"><Search size={13} /> Nova varredura</button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[['Leads', '186', '+24%'], ['Prioridade', '42', 'Score 80+'], ['Potencial', 'R$ 18,4k', '9 propostas']].map(([label, value, note]) => (
                <div key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/[.045] p-2.5 sm:p-3">
                  <span className="block truncate text-[8px] font-semibold text-slate-500 sm:text-[10px]">{label}</span>
                  <strong className="mt-1 block truncate text-sm font-black text-white sm:text-xl">{value}</strong>
                  <small className="mt-1 block truncate text-[7px] font-bold text-emerald-300 sm:text-[9px]">{note}</small>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-xl border border-white/10 bg-white/[.035] p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-300">Leads recomendados</p>
                <div className="mt-2 divide-y divide-white/10">
                  {LEADS.map((lead) => (
                    <article key={lead.name} className="flex items-center gap-2 py-2.5">
                      <div className="min-w-0 flex-1"><strong className="block truncate text-[10px] text-white sm:text-xs">{lead.name}</strong><span className="block truncate text-[8px] text-slate-500 sm:text-[10px]">{lead.need}</span></div>
                      <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[8px] font-black text-emerald-300 sm:text-[10px]">{lead.score}</span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-violet-300/15 bg-gradient-to-b from-blue-500/15 to-violet-500/10 p-3">
                <span className="grid size-8 place-items-center rounded-lg bg-violet-400/15 text-violet-200"><Sparkles size={16} /></span>
                <p className="mt-3 text-[8px] font-black uppercase tracking-[0.12em] text-violet-200 sm:text-[9px]">Abordagem com IA</p>
                <strong className="mt-1 block text-[10px] text-white sm:text-xs">Mensagem personalizada pronta</strong>
                <p className="mt-2 text-[8px] leading-4 text-slate-400 sm:text-[10px] sm:leading-5">“Notei que o agendamento da clínica ainda depende de contato manual...”</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[8px] font-black text-slate-200 sm:text-[10px]">Revisar mensagem <Send size={11} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
