import React from 'react';
import {
  ArrowUpRight,
  Bot,
  Building2,
  ChevronRight,
  CircleCheck,
  Globe2,
  LayoutDashboard,
  Search,
  Target
} from 'lucide-react';

const leads = [
  { name: 'Clínica Horizonte', signal: 'Sem agendamento online', score: 92, service: 'Site + automação' },
  { name: 'Atlas Contábil', signal: 'Site não responsivo', score: 86, service: 'Redesign web' },
  { name: 'Nova Forma Móveis', signal: 'Sem presença digital', score: 81, service: 'Site institucional' }
];

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-2xl lg:max-w-none">
      <div className="absolute -inset-8 -z-10 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0b1527] shadow-[0_28px_90px_rgba(0,0,0,.48)] ring-1 ring-white/10">
        <div className="flex h-11 items-center justify-between border-b border-white/10 bg-slate-950/55 px-3.5 sm:px-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden items-center gap-2 text-[10px] font-semibold text-slate-400 sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Operação comercial ativa
          </div>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-bold text-slate-300">LeadHunter Pro</span>
        </div>

        <div className="grid grid-cols-[42px_minmax(0,1fr)] sm:grid-cols-[56px_minmax(0,1fr)]">
          <aside className="flex flex-col items-center gap-4 border-r border-white/10 bg-slate-950/45 py-4 text-slate-500 sm:gap-5 sm:py-5">
            <span className="grid size-7 place-items-center rounded-lg bg-blue-500 text-white"><LayoutDashboard size={14} /></span>
            <Search size={16} />
            <Globe2 size={16} />
            <Target size={16} />
            <Bot size={16} />
          </aside>

          <div className="min-w-0 p-3 sm:p-4 lg:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-cyan-300">Radar de oportunidades</p>
                <h2 className="mt-1 truncate text-sm font-black text-white sm:text-base">Empresas prontas para receber sua proposta</h2>
              </div>
              <button type="button" tabIndex="-1" className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-[10px] font-black text-white sm:inline-flex">
                Nova varredura <Search size={12} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
              {[
                ['Leads encontrados', '186', '+24%'],
                ['Alta prioridade', '42', 'Score 80+'],
                ['Potencial', 'R$ 18,4k', '9 propostas']
              ].map(([label, value, note]) => (
                <article key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/[.055] p-2.5 sm:p-3">
                  <span className="block truncate text-[8px] text-slate-400 sm:text-[10px]">{label}</span>
                  <strong className="mt-1 block truncate text-sm font-black text-white sm:text-xl">{value}</strong>
                  <small className="mt-1 block truncate text-[8px] font-bold text-emerald-300 sm:text-[9px]">{note}</small>
                </article>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.22fr_.78fr]">
              <article className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[.055]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                  <div className="flex items-center gap-2"><Building2 size={13} className="text-cyan-300" /><span className="text-[10px] font-black text-slate-200">Leads recomendados</span></div>
                  <span className="text-[9px] text-slate-500">Hoje</span>
                </div>
                <div className="divide-y divide-white/8">
                  {leads.map((lead) => (
                    <div key={lead.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5"><strong className="truncate text-[10px] text-white sm:text-[11px]">{lead.name}</strong><CircleCheck size={11} className="shrink-0 text-emerald-300" /></div>
                        <p className="mt-0.5 truncate text-[8px] text-slate-500 sm:text-[9px]">{lead.signal} · {lead.service}</p>
                      </div>
                      <span className="rounded-md bg-emerald-400/12 px-1.5 py-1 text-[9px] font-black text-emerald-300">{lead.score}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/14 to-cyan-400/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="grid size-8 place-items-center rounded-lg bg-violet-400/15 text-violet-300"><Bot size={16} /></span>
                  <ArrowUpRight size={14} className="text-cyan-300" />
                </div>
                <p className="mt-3 text-[9px] font-bold uppercase tracking-[.14em] text-violet-300">Abordagem com IA</p>
                <strong className="mt-1 block text-[11px] text-white">Mensagem personalizada pronta</strong>
                <p className="mt-2 text-[9px] leading-4 text-slate-400">“Notei que o agendamento da clínica ainda depende de contato manual...”</p>
                <button type="button" tabIndex="-1" className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[9px] font-bold text-slate-200">
                  Revisar mensagem <ChevronRight size={12} />
                </button>
              </article>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-2 hidden items-center gap-3 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur sm:flex lg:-left-8">
        <span className="grid size-9 place-items-center rounded-lg bg-emerald-400/12 text-emerald-300"><ArrowUpRight size={17} /></span>
        <div><strong className="block text-[11px] text-white">Lead qualificado</strong><span className="text-[9px] text-slate-400">Score 92 · alta prioridade</span></div>
      </div>
    </div>
  );
}
