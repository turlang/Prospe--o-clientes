function createMemoryEvent({ leadId, type, channel = 'CRM', content = '', metadata = {}, createdAt = new Date() } = {}) {
  if (!leadId) throw new Error('leadId obrigatório.');
  if (!type) throw new Error('type obrigatório.');
  return {
    leadId: String(leadId),
    type: String(type).trim().toUpperCase(),
    channel: String(channel || 'CRM').trim().toUpperCase(),
    content: String(content || '').trim(),
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
    createdAt: new Date(createdAt).toISOString()
  };
}

function buildLeadMemory(events = [], leadId, limit = 20) {
  return (Array.isArray(events) ? events : [])
    .filter((event) => String(event.leadId) === String(leadId))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, Math.max(1, Number(limit || 20)));
}

module.exports = { createMemoryEvent, buildLeadMemory };
