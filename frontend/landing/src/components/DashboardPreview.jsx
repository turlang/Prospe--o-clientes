import React from 'react';
import { ArrowUpRight, Bot, Globe2, Layers3, Search, Sparkles } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-10 -z-10 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/80 shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur">
        <div className="flex h-11 items-center justify-between border-b border-white/10 px-4">
          <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
          <span className="text-[11px] font-semibold text-slate-400">Radar comercial</span>
          <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Operação ativa</span>
        </div>
        <div className="grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[64px_minmax(0,1fr)]">
          <aside className="flex flex-col items-center gap-5 border-r border-white/10 bg-slate-950/70 py-5 text-slate-500">
            <Sparkles size={18} className="text-cyan-300" /><Search size={18} /><Globe2 size={18} /><Bot size={18} /><Layers3 size={18} />
          </aside>
          <div className="min-w-0 space-y-3 p-3 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-300">Visão geral</p><h3 className="mt-1 text-sm font-extrabold text-white sm:text-base">Oportunidades para serviços tech</h3></div>
              <button type="button" tabIndex="-1" className="hidden rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white sm:block">Nova varredura</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['Leads', '186', '+24%'], ['Alta prioridade', '42', 'Score 80+'], ['Em proposta', '9', 'R$ 18,4 mil']].map(([label, value, note]) => (
                <article key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/[.06] p-2.5 sm:p-3">
                  <span className="block truncate text-[9px] text-slate-400 sm:text-[10px]">{label}</span><strong className="mt-1 block text-base font-black text-white sm:text-xl">{value}</strong><small className="mt-1 block truncate text-[8px] font-bold text-emerald-300 sm:text-[9px]">{note}</small>
                </article>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
              <article className="rounded-xl border border-white/10 bg-white/[.06] p-3">
                <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-300">Diagnóstico de oportunidades</span><ArrowUpRight size={14} className="text-cyan-300" /></div>
                <div className="mt-4 space-y-3">
                  {[['Sem site', '88%'], ['Site desatualizado', '64%'], ['Automação', '47%'], ['Agente de IA', '31%']].map(([label, width]) => <div key={label}><div className="flex justify-between text-[9px] text-slate-400"><span>{label}</span><span>{width}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700"><span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width }} /></div></div>)}
                </div>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/[.06] p-3">
                <span className="text-[10px] font-bold text-slate-300">Próxima abordagem</span>
                <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/50 p-3"><strong className="text-xs text-white">Clínica Horizonte</strong><p className="mt-1 text-[9px] leading-relaxed text-slate-400">Site lento, sem agendamento e baixa conversão mobile.</p></div>
                <div className="mt-3 flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-violet-500/20 text-violet-300"><Bot size={14} /></span><p className="text-[9px] leading-relaxed text-slate-300">Mensagem personalizada pronta para revisão.</p></div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
