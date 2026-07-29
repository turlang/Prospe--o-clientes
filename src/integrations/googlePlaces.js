/**
 * @fileoverview Integração com provedores de busca de estabelecimentos e normalização de resultados.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/integrations/googlePlaces
 */

const PLACES_TEXT_SEARCH_NEW_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const PLACES_DETAILS_NEW_ENDPOINT = 'https://places.googleapis.com/v1/places/';

const LEGACY_TEXT_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const LEGACY_DETAILS_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/details/json';

const NEW_SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.primaryType',
  'places.types',
  'places.location'
].join(',');

const NEW_DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'googleMapsUri',
  'rating',
  'userRatingCount',
  'businessStatus',
  'primaryType',
  'types',
  'location'
].join(',');

function requireApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;

  if (!key || key.includes('cole_sua') || key.length < 20) {
    const error = new Error('Configure uma GOOGLE_PLACES_API_KEY válida no arquivo .env.');
    error.statusCode = 400;
    throw error;
  }

  return key.trim();
}

async function searchPlaces({ segmento, regiao, limite = 20 }) {
  const provider = (process.env.PLACES_PROVIDER || 'new').toLowerCase();

  if (provider === 'legacy') {
    return searchPlacesLegacy({ segmento, regiao, limite });
  }

  return searchPlacesNew({ segmento, regiao, limite });
}

async function searchPlacesNew({ segmento, regiao, limite = 20 }) {
  const key = requireApiKey();
  const textQuery = `${segmento} em ${regiao}`.trim();
  const max = Math.min(Number(limite) || 20, 20);

  const response = await fetch(PLACES_TEXT_SEARCH_NEW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': NEW_SEARCH_FIELD_MASK
    },
    body: JSON.stringify({
      textQuery,
      languageCode: 'pt-BR',
      regionCode: 'BR',
      maxResultCount: max
    })
  });

  const data = await safeJson(response);

  if (!response.ok) {
    throwGoogleNewError(data, response.status, 'Text Search New');
  }

  const places = data.places || [];
  return places.map(normalizeNewPlace);
}

async function getPlaceDetailsNew(placeId, key) {
  if (!placeId) return null;

  const response = await fetch(`${PLACES_DETAILS_NEW_ENDPOINT}${encodeURIComponent(placeId)}?languageCode=pt-BR`, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': NEW_DETAILS_FIELD_MASK
    }
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return null;
  }

  return normalizeNewPlace(data);
}

async function searchPlacesLegacy({ segmento, regiao, limite = 20 }) {
  const key = requireApiKey();
  const query = `${segmento} em ${regiao}`.trim();
  const max = Math.min(Number(limite) || 20, 20);

  const url = new URL(LEGACY_TEXT_ENDPOINT);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('region', 'br');
  url.searchParams.set('key', key);

  const response = await fetch(url);
  const data = await safeJson(response);

  if (!response.ok || data.status !== 'OK') {
    throwGoogleLegacyError(data, response.status, 'Text Search Legacy');
  }

  const baseResults = (data.results || []).slice(0, max);
  const detailed = [];

  for (const place of baseResults) {
    const details = await getLegacyDetails(place.place_id, key);
    detailed.push(normalizeLegacyPlace({ ...place, details }));
  }

  return detailed;
}

async function getLegacyDetails(placeId, key) {
  if (!placeId) return {};

  const url = new URL(LEGACY_DETAILS_ENDPOINT);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,business_status,type,geometry');
  url.searchParams.set('key', key);

  const response = await fetch(url);
  const data = await safeJson(response);

  if (!response.ok || !['OK', 'ZERO_RESULTS'].includes(data.status)) {
    return {};
  }

  return data.result || {};
}

function normalizeLegacyPlace(place) {
  const details = place.details || {};
  const location = details.geometry?.location || place.geometry?.location || {};

  return {
    fonte: 'Google Places API Legacy',
    placeId: place.place_id,
    nome: details.name || place.name || 'Sem nome',
    endereco: details.formatted_address || place.formatted_address || '',
    telefone: details.formatted_phone_number || details.international_phone_number || '',
    site: details.website || '',
    maps: details.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    nota: details.rating || place.rating || null,
    avaliacoes: details.user_ratings_total || place.user_ratings_total || 0,
    status: details.business_status || place.business_status || '',
    tipo: Array.isArray(details.types) ? details.types[0] : Array.isArray(place.types) ? place.types[0] : '',
    latitude: location.lat || null,
    longitude: location.lng || null,
    coletadoEm: new Date().toISOString()
  };
}

function normalizeNewPlace(place) {
  return {
    fonte: 'Google Places API New',
    placeId: place.id || '',
    nome: place.displayName?.text || 'Sem nome',
    endereco: place.formattedAddress || '',
    telefone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
    site: place.websiteUri || '',
    maps: place.googleMapsUri || (place.id ? `https://www.google.com/maps/place/?q=place_id:${place.id}` : ''),
    nota: place.rating || null,
    avaliacoes: place.userRatingCount || 0,
    status: place.businessStatus || '',
    tipo: place.primaryType || (place.types || [])[0] || '',
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    coletadoEm: new Date().toISOString()
  };
}

async function testGoogleConnection() {
  const key = requireApiKey();
  const provider = (process.env.PLACES_PROVIDER || 'new').toLowerCase();
  const result = await searchPlaces({ segmento: 'pizzaria', regiao: 'Perus, São Paulo', limite: 1 });

  return {
    ok: true,
    provider,
    totalTeste: result.length,
    exemplo: result[0] || null,
    keyFinal: key.slice(-4)
  };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (_error) {
    return {};
  }
}

function throwGoogleNewError(data, httpStatus, apiName) {
  const googleError = data?.error || {};
  const status = googleError.status || httpStatus || 'UNKNOWN';
  const message = googleError.message || 'Erro ao consultar a Places API New.';

  const hints = {
    PERMISSION_DENIED: 'Ative a Places API no Google Cloud, confira o faturamento e verifique se a chave permite chamadas de servidor. Para teste local, deixe a chave sem restrição ou restrinja por IP depois.',
    INVALID_ARGUMENT: 'Confira os campos enviados e o X-Goog-FieldMask. Este projeto já envia FieldMask obrigatório.',
    RESOURCE_EXHAUSTED: 'Sua cota foi excedida ou o billing/faturamento não está ativo.',
    UNAUTHENTICATED: 'A chave de API está ausente, inválida ou bloqueada.'
  };

  const error = new Error(`${apiName}: ${status} - ${message}. ${hints[status] || ''}`.trim());
  error.statusCode = httpStatus || 502;
  throw error;
}

function throwGoogleLegacyError(data, httpStatus, apiName) {
  const status = data.status || httpStatus || 'UNKNOWN';
  const googleMessage = data.error_message ? ` - ${data.error_message}` : '';
  const hints = {
    REQUEST_DENIED: 'Seu projeto não está com a API Legacy habilitada. Use PLACES_PROVIDER=new no .env e habilite Places API no Google Cloud.',
    INVALID_REQUEST: 'Confira se o segmento e a região foram enviados corretamente.',
    OVER_QUERY_LIMIT: 'Sua cota foi excedida ou o billing/faturamento não está ativo.',
    ZERO_RESULTS: 'A busca não encontrou empresas para esse segmento/região.'
  };

  const error = new Error(`${apiName}: ${status}${googleMessage}. ${hints[status] || ''}`.trim());
  error.statusCode = status === 'ZERO_RESULTS' ? 404 : 502;
  throw error;
}

module.exports = { searchPlaces, testGoogleConnection };
