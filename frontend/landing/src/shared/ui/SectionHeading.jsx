/**
 * @fileoverview Cabeçalho semântico padronizado para seções comerciais.
 *
 * @module landing/shared/ui/SectionHeading
 */

import React from 'react';

/**
 * @param {{eyebrow: string, title: string, description?: string, align?: 'left'|'center', inverse?: boolean}} props Conteúdo e alinhamento.
 * @returns {React.JSX.Element} Cabeçalho de seção.
 */
export default function SectionHeading({ eyebrow, title, description = '', align = 'left', inverse = false }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';
  const titleColor = inverse ? 'text-white' : 'text-slate-950';
  const descriptionColor = inverse ? 'text-slate-300' : 'text-slate-600';

  return (
    <header className={`max-w-3xl ${alignment}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl ${titleColor}`}>{title}</h2>
      {description ? <p className={`mt-4 text-base leading-7 sm:text-lg ${descriptionColor}`}>{description}</p> : null}
    </header>
  );
}
