const { extractSocialLinks, estimateEngagement } = require('./socialAnalyzer');
const { fetchPublicHttpUrl, normalizeHttpUrl, readResponseTextLimited } = require('./security/publicUrl');

function normalizeUrl(url) {
  try {
    return normalizeHttpUrl(url).toString();
  } catch {
    return '';
  }
}


function hasOwnDomain(url) {
  try {
    const host = new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
    const freeHosts = ['facebook.com', 'instagram.com', 'linktr.ee', 'wa.me', 'sites.google.com', 'business.site'];
    return Boolean(host && !freeHosts.some((free) => host.includes(free)));
  } catch {
    return false;
  }
}

async function auditWebsite(site) {
  const url = normalizeUrl(site);
  const empty = {
    analisado: false,
    url: site || '',
    https: false,
    dominioProprio: hasOwnDomain(site),
    responsivo: false,
    metaDescription: false,
    titulo: false,
    whatsapp: false,
    formulario: false,
    analytics: false,
    pixelMeta: false,
    instagram: false,
    redesSociais: [],
    engajamentoSocial: { score: 0, nivel: 'Não analisado', redesDetectadas: [], sinais: [], alertas: ['sem site para analisar redes sociais'] },
    seoBasico: 0,
    problemas: ['sem site para auditar'],
    oportunidades: ['criar site ou landing page com WhatsApp, mapa e formulário']
  };

  if (!url) return empty;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const started = Date.now();
    const response = await fetchPublicHttpUrl(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 LeadProspector/1.0 (+public website auditor)'
      }
    });
    const html = await readResponseTextLimited(response);
    const lower = html.toLowerCase();
    const loadMs = Date.now() - started;

    const socialLinks = extractSocialLinks(html);
    const socialEngagement = estimateEngagement({ html, socialLinks });

    const checks = {
      analisado: true,
      url: response.url || url,
      httpStatus: response.status,
      tempoRespostaMs: loadMs,
      https: (response.url || url).startsWith('https://'),
      dominioProprio: hasOwnDomain(response.url || url),
      responsivo: /<meta[^>]+name=["']viewport["']/i.test(html),
      metaDescription: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{30,}/i.test(html),
      titulo: /<title>[^<]{10,}<\/title>/i.test(html),
      whatsapp: lower.includes('wa.me') || lower.includes('api.whatsapp.com') || lower.includes('whatsapp'),
      formulario: /<form[\s>]/i.test(html) || lower.includes('type="submit"') || lower.includes("type='submit'"),
      analytics: lower.includes('gtag(') || lower.includes('google-analytics') || lower.includes('googletagmanager.com'),
      pixelMeta: lower.includes('connect.facebook.net') || lower.includes('fbq(') || lower.includes('facebook-pixel'),
      instagram: socialLinks.some((item) => item.chave === 'instagram'),
      redesSociais: socialLinks,
      engajamentoSocial: socialEngagement,
      tamanhoHtmlKb: Math.round(Buffer.byteLength(html, 'utf8') / 1024)
    };

    let seoBasico = 0;
    if (checks.titulo) seoBasico += 25;
    if (checks.metaDescription) seoBasico += 25;
    if (checks.responsivo) seoBasico += 25;
    if (checks.https) seoBasico += 15;
    if (checks.formulario || checks.whatsapp) seoBasico += 10;

    const problemas = [];
    const oportunidades = [];

    if (!checks.https) problemas.push('site sem HTTPS');
    if (!checks.responsivo) problemas.push('site sem sinal claro de responsividade');
    if (!checks.metaDescription) problemas.push('sem meta description forte para SEO');
    if (!checks.formulario) problemas.push('sem formulário de contato detectado');
    if (!checks.whatsapp) problemas.push('sem WhatsApp visível no site');
    if (!checks.analytics) problemas.push('sem Google Analytics/Tag Manager detectado');
    if (!checks.pixelMeta) problemas.push('sem Pixel Meta detectado');
    if (!checks.redesSociais.length) problemas.push('sem redes sociais públicas detectadas no site');
    if (loadMs > 5000) problemas.push('resposta lenta do site');

    if (!checks.formulario || !checks.whatsapp) oportunidades.push('criar captação de leads com formulário e WhatsApp');
    if (!checks.metaDescription || !checks.titulo) oportunidades.push('melhorar SEO local');
    if (!checks.analytics || !checks.pixelMeta) oportunidades.push('configurar métricas e remarketing');
    if (checks.engajamentoSocial?.nivel === 'Baixo' || checks.engajamentoSocial?.nivel === 'Muito baixo') oportunidades.push('melhorar conexão entre redes sociais, site e WhatsApp');
    if (!checks.responsivo) oportunidades.push('modernizar site para celular');

    return { ...checks, seoBasico, problemas, oportunidades };
  } catch (error) {
    return {
      ...empty,
      analisado: true,
      url,
      erro: error.name === 'AbortError'
        ? 'tempo limite ao acessar o site'
        : error.code === 'UNSAFE_URL'
          ? error.message
          : 'não foi possível acessar o site',
      problemas: [error.code === 'UNSAFE_URL' ? error.message : 'site não respondeu bem à auditoria automática'],
      oportunidades: ['oferecer diagnóstico técnico e melhoria de performance/estrutura']
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { auditWebsite, hasOwnDomain, normalizeUrl };
