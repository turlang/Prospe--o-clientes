/**
 * @fileoverview Radar visual de oportunidades exibido no primeiro viewport.
 *
 * O mockup usa uma linguagem de central de inteligência comercial: sinais,
 * score, diagnóstico e abordagem aparecem como uma única cadeia de decisão.
 * Os dados são demonstrativos e não representam informações reais do usuário.
 *
 * @module landing/features/hero/ProductMockup
 */

import React from 'react';
import { ArrowUpRight, Bot, Building2, CircleDot, Crosshair, MapPin, MessageSquareText, Radio, Sparkles } from 'lucide-react';

const SIGNALS = Object.freeze([
  { name: 'Clínica Horizonte', location: 'Campinas · SP', need: 'Agendamento ainda manual', score: 92, angle: '18deg', distance: '29%' },
  { name: 'Atlas Contábil', location: 'Curitiba · PR', need: 'Site não responsivo', score: 86, angle: '136deg', distance: '35%' },
  { name: 'Nova Forma Móveis', location: 'Santos · SP', need: 'Sem presença digital', score: 81, angle: '242deg', distance: '38%' }
]);

export default function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[46rem] lg:mx-0" aria-label="Radar comercial demonstrativo do LeadHunter Pro">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="signal-console relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#090e1b]/95 shadow-[0_45px_120px_rgba(0,0,0,.48)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[.08] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2" aria-hidden="true"><span className="size-2 rounded-full bg-rose-400" /><span className="size-2 rounded-full bg-amber-300" /><span className="size-2 rounded-full bg-emerald-400" /></div>
          <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[.16em] text-slate-400 sm:text-[10px]"><CircleDot size={10} className="text-emerald-400" /> Live opportunity feed</span>
          <span className="rounded-md border border-white/10 bg-white/[.03] px-2 py-1 text-[8px] font-black text-slate-300 sm:text-[9px]">LH / SIGNAL-01</span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(240px,.92fr)]">
          <div className="relative min-h-[420px] overflow-hidden border-b border-white/[.08] p-4 sm:min-h-[470px] sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[.18em] text-cyan-300"><Radio size={11} /> Varredura ativa</p>
                <h2 className="mt-1 text-base font-black tracking-[-.03em] text-white sm:text-xl">Sinais comerciais na sua região</h2>
              </div>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-[.12em] text-emerald-300">186 detectados</span>
            </div>

            <div className="radar-stage absolute left-1/2 top-[56%] aspect-square w-[78%] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15">
              <span className="radar-ring absolute inset-[14%] rounded-full border border-cyan-300/12" />
              <span className="radar-ring absolute inset-[30%] rounded-full border border-cyan-300/12" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-cyan-300/10" />
              <span className="absolute inset-x-0 top-1/2 h-px bg-cyan-300/10" />
              <span className="radar-sweep absolute inset-[2%] rounded-full" />
              <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,.25)]"><Crosshair size={20} /></span>

              {SIGNALS.map((signal, index) => (
                <span
                  key={signal.name}
                  className="signal-dot absolute left-1/2 top-1/2"
                  style={{ '--signal-angle': signal.angle, '--signal-distance': signal.distance, '--signal-delay': `${index * 0.55}s` }}
                >
                  <i />
                </span>
              ))}
            </div>

            <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 sm:inset-x-6 sm:bottom-6">
              {[['Cobertura', '12 km'], ['Nichos ativos', '08'], ['Qualidade média', '87/100']].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[.08] bg-black/25 p-2.5 backdrop-blur-md">
                  <span className="block truncate text-[7px] font-bold uppercase tracking-[.1em] text-slate-500 sm:text-[8px]">{label}</span>
                  <strong className="mt-1 block text-xs text-white sm:text-sm">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Sinal prioritário</p>
                <strong className="mt-1 block text-sm text-white sm:text-base">Clínica Horizonte</strong>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-base font-black text-emerald-300">92</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2.5"><MapPin size={13} className="text-cyan-300" /><span className="text-[10px] text-slate-300">Campinas · SP</span></div>
              <div className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2.5"><Building2 size={13} className="text-blue-300" /><span className="text-[10px] text-slate-300">Saúde · 4,7★ · 186 avaliações</span></div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[.045] p-3.5">
              <p className="text-[8px] font-black uppercase tracking-[.14em] text-amber-200">Diagnóstico encontrado</p>
              <strong className="mt-2 block text-xs leading-5 text-white">Agendamento depende de WhatsApp e atendimento manual.</strong>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.07]"><span className="block h-full w-[84%] rounded-full bg-gradient-to-r from-amber-300 to-orange-400" /></div>
              <span className="mt-1.5 block text-[8px] text-slate-500">Aderência para site + automação: 84%</span>
            </div>

            <div className="mt-4 flex-1 rounded-2xl border border-violet-300/15 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-3.5">
              <div className="flex items-center justify-between"><span className="grid size-8 place-items-center rounded-xl bg-violet-400/15 text-violet-200"><Bot size={15} /></span><span className="text-[8px] font-black uppercase tracking-[.12em] text-violet-200">IA pronta</span></div>
              <p className="mt-3 text-[10px] leading-5 text-slate-300">“Percebi que a clínica ainda centraliza os agendamentos no WhatsApp. Posso mostrar uma solução simples para reduzir o trabalho manual?”</p>
              <button type="button" tabIndex={-1} className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[.05] px-3 py-2.5 text-[9px] font-black text-white"><span className="inline-flex items-center gap-2"><MessageSquareText size={12} /> Abrir abordagem</span><ArrowUpRight size={12} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#101827]/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex">
        <span className="grid size-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300"><Sparkles size={16} /></span>
        <div><span className="block text-[8px] font-black uppercase tracking-[.12em] text-slate-500">Próxima ação</span><strong className="text-[10px] text-white">Enviar abordagem hoje, 14h30</strong></div>
      </div>
    </div>
  );
}
