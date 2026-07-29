/**
 * @fileoverview Bento visual das ferramentas centrais da operação comercial.
 *
 * @module landing/features/tools/ToolsSection
 */

import React from 'react';
import { ArrowUpRight, Bot, CalendarClock, ChartNoAxesCombined, Check, Globe2, KanbanSquare, Radar, Send, Sparkles } from 'lucide-react';

function MiniLead({ name, detail, score }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.045] px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500/15 text-blue-200"><Globe2 size={14} /></span>
      <div className="min-w-0 flex-1"><strong className="block truncate text-[10px] text-white sm:text-xs">{name}</strong><span className="block truncate text-[8px] text-slate-500 sm:text-[10px]">{detail}</span></div>
      <b className="rounded-md bg-emerald-300/10 px-2 py-1 text-[9px] text-emerald-300">{score}</b>
    </div>
  );
}

export default function ToolsSection() {
  return (
    <section id="ferramentas" className="bg-[#050812] py-20 text-white sm:py-28">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Dentro da operação</p>
            <h2 className="mt-4 max-w-[14ch] text-[clamp(2.35rem,4.4vw,4.25rem)] font-black leading-[.96] tracking-[-.055em]">Não é mais um CRM. É seu sistema operacional de prospecção.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-400 sm:text-base">Cada ferramenta compartilha o mesmo contexto. O diagnóstico vira argumento, o argumento vira tarefa e a tarefa avança no funil.</p>
        </div>

        <div className="mt-12 grid auto-rows-[minmax(220px,auto)] gap-4 lg:grid-cols-12">
          <article className="group relative overflow-hidden rounded-[2rem] border border-white/[.09] bg-gradient-to-br from-blue-600/25 via-[#0b1222] to-[#07101d] p-5 lg:col-span-7 lg:row-span-2 sm:p-7">
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300"><Radar size={22} /></span><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">Descoberta + score</span></div>
            <h3 className="relative mt-8 max-w-md text-2xl font-black tracking-[-.04em] sm:text-3xl">Radar de oportunidades que mostra onde existe dinheiro parado.</h3>
            <p className="relative mt-3 max-w-xl text-sm leading-6 text-slate-400">Pesquise por nicho e região, identifique problemas digitais e priorize os leads com maior aderência ao que você vende.</p>
            <div className="relative mt-8 grid gap-2 sm:grid-cols-2">
              <MiniLead name="Clínica Horizonte" detail="Agendamento manual" score="92" />
              <MiniLead name="Atlas Contábil" detail="Site não responsivo" score="86" />
              <MiniLead name="Nova Forma" detail="Sem presença digital" score="81" />
              <div className="flex items-center justify-center rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[.035] px-3 py-2.5 text-[10px] font-black text-cyan-300">+ 183 sinais encontrados</div>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-[2rem] border border-violet-300/10 bg-gradient-to-br from-violet-500/15 to-[#0b1020] p-5 lg:col-span-5 sm:p-7">
            <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-violet-400/15 text-violet-200"><Bot size={22} /></span><Sparkles size={18} className="text-violet-300" /></div>
            <h3 className="mt-7 text-2xl font-black tracking-[-.04em]">Copiloto que escreve com contexto, não com frases prontas.</h3>
            <div className="mt-6 rounded-2xl border border-white/[.08] bg-black/20 p-4">
              <p className="text-xs leading-6 text-slate-300">“Vi que o agendamento ainda depende do WhatsApp. Uma página integrada pode reduzir o atendimento manual e facilitar novos horários.”</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[.08] pt-3"><span className="text-[9px] font-black uppercase tracking-[.12em] text-violet-200">Tom consultivo</span><Send size={14} className="text-violet-300" /></div>
            </div>
          </article>

          <article className="group rounded-[2rem] border border-white/[.09] bg-[#0a101d] p-5 lg:col-span-5 sm:p-7">
            <div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-amber-300/10 text-amber-200"><KanbanSquare size={22} /></span><span className="text-[9px] font-black uppercase tracking-[.14em] text-slate-500">Pipeline vivo</span></div>
            <h3 className="mt-7 text-2xl font-black tracking-[-.04em]">CRM Kanban sem burocracia.</h3>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[['Novos', '12', 'bg-blue-500'], ['Proposta', '04', 'bg-violet-500'], ['Fechados', '03', 'bg-emerald-400']].map(([label, count, color]) => (
                <div key={label} className="rounded-xl border border-white/[.07] bg-white/[.035] p-3"><span className="text-[8px] font-black uppercase tracking-[.1em] text-slate-500">{label}</span><strong className="mt-2 block text-xl text-white">{count}</strong><span className={`mt-3 block h-1.5 rounded-full ${color}`} /></div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/[.09] bg-[#0a101d] p-5 lg:col-span-4 sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300"><CalendarClock size={22} /></span>
            <h3 className="mt-7 text-2xl font-black tracking-[-.04em]">Follow-up no momento certo.</h3>
            <ul className="mt-5 space-y-3 text-xs text-slate-400">
              {['Retomar Clínica Horizonte às 14h30', 'Revisar proposta Atlas Contábil', 'Enviar case de automação'].map((item, index) => <li key={item} className="flex items-start gap-2"><span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><Check size={9} /></span><span>{item}</span>{index === 0 ? <span className="ml-auto rounded-full bg-amber-300/10 px-2 py-0.5 text-[8px] font-black text-amber-200">HOJE</span> : null}</li>)}
            </ul>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-white/[.09] bg-gradient-to-br from-cyan-400/10 to-[#0a101d] p-5 lg:col-span-4 sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300"><ChartNoAxesCombined size={22} /></span>
            <h3 className="mt-7 text-2xl font-black tracking-[-.04em]">Veja o que está virando receita.</h3>
            <div className="mt-6 flex items-end gap-2" aria-label="Gráfico demonstrativo">
              {[38, 52, 44, 68, 61, 86].map((height, index) => <span key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-300" style={{ height: `${height}px`, opacity: .45 + index * .09 }} />)}
            </div>
            <div className="mt-4 flex items-center justify-between"><span className="text-[9px] uppercase tracking-[.12em] text-slate-500">Conversão no período</span><strong className="inline-flex items-center gap-1 text-sm text-emerald-300">+24% <ArrowUpRight size={14} /></strong></div>
          </article>
        </div>
      </div>
    </section>
  );
}
