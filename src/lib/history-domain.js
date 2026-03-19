export function extractHistoryMessages(source) {
  if (!source) return null
  if (Array.isArray(source)) return source
  if (Array.isArray(source.messages)) return source.messages
  if (Array.isArray(source.result?.messages)) return source.result.messages
  if (Array.isArray(source.value?.messages)) return source.value.messages
  if (Array.isArray(source.data?.messages)) return source.data.messages
  if (Array.isArray(source.messages?.value)) return source.messages.value
  if (Array.isArray(source.messages?.data)) return source.messages.data
  if (Array.isArray(source.result)) return source.result
  if (Array.isArray(source.value)) return source.value
  if (Array.isArray(source.data)) return source.data
  if (Array.isArray(source.payload)) return source.payload
  return null
}

export function normalizeHistoryPayload(payload, fallbackKey, normalizeSessionKey) {
  const key = normalizeSessionKey(payload?.sessionKey || payload?._req?.sessionKey || fallbackKey)
  const messages = extractHistoryMessages(payload)
  if (!messages || !messages.length) return { sessionKey: key, result: null }
  return { sessionKey: key, result: { messages } }
}

export function maxHistoryTimestamp(messages = []) {
  return messages.reduce((max, msg) => Math.max(max, Number(msg?.timestamp || 0)), 0)
}

export function buildHistoryHash(messages) {
  if (!messages || !messages.length) return ''
  return messages.map(m => {
    const role = m.role || ''
    const id = m.id || m.messageId || m.msgId || m.runId || ''
    const ts = m.timestamp || m.time || m.ts || ''
    let size = 0
    if (typeof m.content === 'string') {
      size = m.content.length
    } else if (Array.isArray(m.content)) {
      m.content.forEach(block => {
        if (block?.type === 'text' && typeof block.text === 'string') size += block.text.length
        else if (block) size += 1
      })
    } else if (typeof m.text === 'string') {
      size = m.text.length
    }
    return `${role}:${id}:${ts}:${size}`
  }).join('|')
}

export function buildHistoryEntryKey(msg) {
  const role = msg?.role || 'system'
  const ts = Number(msg?.timestamp || 0)
  const text = (msg?.text || '').trim()
  const mediaCount = (msg?.images?.length || 0) + (msg?.videos?.length || 0) + (msg?.audios?.length || 0) + (msg?.files?.length || 0)
  const toolCount = msg?.tools?.length || 0
  const statusTag = role === 'system' ? (msg?.statusKey || msg?.statusType || '') : ''
  return `${role}:${statusTag}:${ts}:${text}:${mediaCount}:${toolCount}`
}
