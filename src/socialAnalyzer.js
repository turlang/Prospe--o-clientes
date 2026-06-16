/**
 * socialAnalyzer.js
 * -----------------------------------------------------------------------------
 * Módulo acadêmico de análise de presença social.
 *
 * Objetivo:
 * - Identificar links públicos de redes sociais encontrados no site do lead.
 * - Estimar o nível de engajamento digital com base em sinais públicos e éticos.
 *
 * Importante:
 * Esta análise NÃO invade perfis, NÃO burla bloqueios e NÃO coleta métricas
 * privadas. Para números reais de curtidas, seguidores e alcance seria necessário
 * usar APIs oficiais das plataformas, com autorização e respeito aos termos de uso.
 */

const SOCautomacaoL_PATTERNS = [
  { nome: 'Instagram', key: 'instagram', regex: /https?:\/\/(?:www\.)?instagram\.com\/[^\s"'<>]+/gi },
  { nome: 'Facebook', key: 'facebook', regex: /https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+/gi },
  { nome: 'LinkedIn', key: 'linkedin', regex: /https?:\/\/(?:www\.)?linkedin\.com\/[^\s"'<>]+/gi },
  { nome: 'TikTok', key: 'tiktok', regex: /https?:\/\/(?:www\.)?tiktok\.com\/[^\s"'<>]+/gi },
  { nome: 'YouTube', key: 'youtube', regex: /https?:\/\/(?:www\.)?(youtube\.com|youtu\.be)\/[^\s"'<>]+/gi },
  { nome: 'WhatsApp', key: 'whatsapp', regex: /https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^\s"'<>]+/gi }
];

function extractSocialLinks(html = '') {
  const found = [];

  for (const platform of SOCautomacaoL_PATTERNS) {
    const matches = html.match(platform.regex) || [];
    const urls = unique(matches.map(cleanUrl));

    if (urls.length) {
      found.push({
        plataforma: platform.nome,
        chave: platform.key,
        urls
      });
    }
  }

  return found;
}

function estimateEngagement({ html = '', socialLinks = [], lead = {} }) {
  const lower = html.toLowerCase();
  let score = 0;
  const sinais = [];
  const alertas = [];

  if (socialLinks.length >= 3) {
    score += 28;
    sinais.push('possui presença em várias redes sociais');
  } else if (socialLinks.length === 2) {
    score += 20;
    sinais.push('possui presença em duas redes sociais');
  } else if (socialLinks.length === 1) {
    score += 12;
    sinais.push('possui ao menos uma rede social pública');
  } else {
    alertas.push('nenhuma rede social pública detectada no site');
  }

  if (socialLinks.some((item) => item.chave === 'instagram')) {
    score += 18;
    sinais.push('Instagram encontrado, bom canal para negócios locais');
  }

  if (socialLinks.some((item) => item.chave === 'facebook')) {
    score += 8;
    sinais.push('Facebook encontrado');
  }

  if (socialLinks.some((item) => item.chave === 'linkedin')) {
    score += 10;
    sinais.push('LinkedIn encontrado, sinal útil para negócios B2B');
  }

  if (socialLinks.some((item) => item.chave === 'tiktok' || item.chave === 'youtube')) {
    score += 10;
    sinais.push('canal de vídeo encontrado');
  }

  if (lower.includes('instagram-media') || lower.includes('embed')) {
    score += 8;
    sinais.push('conteúdo social incorporado ao site');
  }

  if (lower.includes('siga-nos') || lower.includes('siga nos') || lower.includes('follow us')) {
    score += 5;
    sinais.push('chamada para acompanhamento social no site');
  }

  if ((lead.avaliacoes || 0) >= 300) {
    score += 12;
    sinais.push('muitas avaliações no Google indicam movimento local forte');
  } else if ((lead.avaliacoes || 0) >= 100) {
    score += 8;
    sinais.push('boa quantidade de avaliações no Google');
  } else if ((lead.avaliacoes || 0) < 20) {
    alertas.push('poucas avaliações no Google podem indicar baixa prova social');
  }

  score = Math.max(0, Math.min(100, score));

  const nivel = score >= 75 ? 'Alto' : score >= 50 ? 'Médio' : score >= 25 ? 'Baixo' : 'Muito baixo';
  const oportunidade = defineOportunidade(nivel, socialLinks.length);

  return {
    score,
    nivel,
    redesDetectadas: socialLinks,
    sinais: unique(sinais),
    alertas: unique(alertas),
    oportunidade
  };
}

function defineOportunidade(nivel, totalRedes) {
  if (nivel === 'Alto') return 'bom candidato para campanhas, landing pages e mensuração de conversões';
  if (nivel === 'Médio') return 'bom candidato para organizar funil entre redes sociais, site e WhatsApp';
  if (totalRedes > 0) return 'oportunidade para profissionalizar a presença social e conectar com site';
  return 'oportunidade para criar presença digital básica e canais de contato';
}

function cleanUrl(url) {
  return String(url || '')
    .replace(/&amp;/g, '&')
    .replace(/[),.;]+$/g, '')
    .trim();
}

function unique(list) {
  return [...new Set((list || []).filter(Boolean))];
}

module.exports = { extractSocialLinks, estimateEngagement };
