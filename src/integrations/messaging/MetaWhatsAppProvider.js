/**
 * @fileoverview Adaptador oficial de mensageria para WhatsApp Cloud API.
 *
 * O adaptador é defensivo: envio real exige configuração completa e o
 * kill-switch OUTBOUND_LIVE_SEND=true. Segredos nunca são serializados em
 * respostas ou mensagens de erro.
 *
 * @module src/integrations/messaging/MetaWhatsAppProvider
 */

const crypto = require('node:crypto');
const MessagingProvider = require('../contracts/MessagingProvider');
const { normalizePhone } = require('../../domain/omnichannel/phone');

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

class MetaWhatsAppProvider extends MessagingProvider {
  constructor() { super('meta'); }

  config() {
    return {
      accessToken: String(process.env.WHATSAPP_ACCESS_TOKEN || '').trim(),
      phoneNumberId: String(process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim(),
      graphVersion: String(process.env.WHATSAPP_GRAPH_API_VERSION || '').trim(),
      verifyToken: String(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '').trim(),
      appSecret: String(process.env.WHATSAPP_APP_SECRET || '').trim()
    };
  }

  isConfigured() {
    const config = this.config();
    return Boolean(config.accessToken && config.phoneNumberId && config.graphVersion);
  }

  async testConnection() {
    return {
      ok: this.isConfigured(),
      status: this.isConfigured() ? 'configured' : 'not_configured',
      message: this.isConfigured()
        ? 'Credenciais obrigatórias do WhatsApp configuradas.'
        : 'Configure token, phone number id e versão da Graph API.'
    };
  }

  validateWebhook(input = {}) {
    const config = this.config();
    if (input.mode === 'subscribe') {
      return Boolean(config.verifyToken) && String(input.verifyToken || '') === config.verifyToken;
    }

    if (!config.appSecret || !input.rawBody || !input.signature) return false;
    const expected = `sha256=${crypto.createHmac('sha256', config.appSecret).update(input.rawBody).digest('hex')}`;
    const provided = String(input.signature || '');
    if (expected.length !== provided.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  }

  async sendMessage(input = {}) {
    if (String(process.env.OUTBOUND_LIVE_SEND || '').toLowerCase() !== 'true') {
      throw Object.assign(new Error('Envio real bloqueado por OUTBOUND_LIVE_SEND.'), {
        statusCode: 409,
        code: 'OUTBOUND_LIVE_SEND_DISABLED'
      });
    }

    const config = this.config();
    if (!this.isConfigured()) {
      throw Object.assign(new Error('WhatsApp Cloud API ainda não está configurada.'), {
        statusCode: 503,
        code: 'WHATSAPP_NOT_CONFIGURED'
      });
    }

    const to = normalizePhone(input.to);
    const text = String(input.text || '').trim().slice(0, 4000);
    if (!to || !text) throw Object.assign(new Error('Destino e mensagem são obrigatórios.'), { statusCode: 400 });

    const endpoint = `https://graph.facebook.com/${encodeURIComponent(config.graphVersion)}/${encodeURIComponent(config.phoneNumberId)}/messages`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text }
      })
    });

    const raw = await response.text();
    const payload = safeJsonParse(raw) || {};
    if (!response.ok) {
      const providerCode = payload?.error?.code ? String(payload.error.code) : 'WHATSAPP_SEND_FAILED';
      throw Object.assign(new Error('O provedor recusou o envio da mensagem.'), {
        statusCode: 502,
        code: providerCode
      });
    }

    return {
      ok: true,
      demo: false,
      providerId: this.id,
      externalMessageId: String(payload?.messages?.[0]?.id || ''),
      status: 'accepted',
      to,
      sentAt: new Date().toISOString()
    };
  }

  async processWebhook(payload = {}) {
    const events = [];
    for (const entry of Array.isArray(payload.entry) ? payload.entry : []) {
      for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
        const value = change?.value || {};
        const phoneNumberId = String(value?.metadata?.phone_number_id || '');
        const contacts = new Map((Array.isArray(value.contacts) ? value.contacts : [])
          .map((contact) => [String(contact.wa_id || ''), contact]));

        for (const message of Array.isArray(value.messages) ? value.messages : []) {
          const from = normalizePhone(message.from);
          const contact = contacts.get(String(message.from || '')) || {};
          let text = '';
          if (message.type === 'text') text = String(message?.text?.body || '');
          else if (message.type === 'button') text = String(message?.button?.text || '');
          else if (message.type === 'interactive') {
            text = String(message?.interactive?.button_reply?.title || message?.interactive?.list_reply?.title || '');
          }

          events.push({
            externalMessageId: String(message.id || ''),
            from,
            to: phoneNumberId,
            phoneNumberId,
            text: text.trim().slice(0, 4000),
            contactName: String(contact?.profile?.name || '').trim().slice(0, 240),
            channel: 'whatsapp',
            timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000) : new Date(),
            rawMetadata: { type: String(message.type || 'unknown') }
          });
        }
      }
    }
    return events;
  }
}

module.exports = MetaWhatsAppProvider;
