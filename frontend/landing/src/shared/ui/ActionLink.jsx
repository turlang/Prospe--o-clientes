/**
 * @fileoverview Link de ação reutilizável com variantes visuais consistentes.
 *
 * @module landing/shared/ui/ActionLink
 */

import React from 'react';

const VARIANT_CLASSES = Object.freeze({
  primary:
    'bg-blue-500 text-white shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-400 focus-visible:outline-blue-300',
  secondary:
    'border border-white/15 bg-white/5 text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-cyan-300',
  light:
    'border border-slate-200 bg-white text-slate-950 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-blue-500'
});

/**
 * @param {{href: string, children: React.ReactNode, variant?: keyof typeof VARIANT_CLASSES, className?: string}} props Propriedades do link.
 * @returns {React.JSX.Element} Link estilizado.
 */
export default function ActionLink({ href, children, variant = 'primary', className = '' }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition duration-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
