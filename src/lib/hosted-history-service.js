export function normalizeHostedRole(role) {
  if (role === 'assistant' || role === 'user') return role
  if (role === 'developer') return 'assistant'
  return 'user'
}

export function shouldCaptureHostedTarget(payload, options) {
  const {
    hostedSessionConfig,
    hostedRuntime,
    boundSessionKey,
    extractChatContent,
    buildHostedTargetHash,
    lastTargetHash,
  } = options

  if (!hostedSessionConfig?.enabled) return { capture: false }
  if (payload?.sessionKey && boundSessionKey && payload.sessionKey !== boundSessionKey) return { capture: false }
  if (hostedRuntime.status === 'paused' || hostedRuntime.status === 'error') return { capture: false }
  if (payload?.message?.role && payload.message.role !== 'assistant') return { capture: false }

  const text = String(extractChatContent(payload.message, payload.sessionKey || boundSessionKey)?.text || '').trim()
  if (!text) return { capture: false }

  const ts = Number(payload?.timestamp || Date.now())
  const hash = buildHostedTargetHash(text, ts)
  if (hash === lastTargetHash) return { capture: false }

  return { capture: true, text, ts, hash }
}

export function pushHostedHistoryEntry(history, role, content, ts = Date.now(), options = {}) {
  const normalizedRole = role || 'assistant'
  const normalizedContent = String(content || '').trim()
  if (!normalizedContent) return { changed: false, history }

  const list = Array.isArray(history) ? history : []
  const nextTs = Number(ts || Date.now())
  const last = list[list.length - 1]
  const allowReplace = options.allowReplaceTail !== false

  if (allowReplace && last?.role === normalizedRole && String(last.content || '').trim() === normalizedContent) {
    if (!last.ts || nextTs >= Number(last.ts || 0)) last.ts = nextTs
    return { changed: false, history: list }
  }

  list.push({ role: normalizedRole, content: normalizedContent, ts: nextTs })
  return { changed: true, history: list }
}

export function buildHostedMessages(history, systemPrompt, contextMax = 100) {
  const trimmed = (Array.isArray(history) ? history : [])
    .filter(item => item && item.content)
    .slice(-(contextMax || 100))

  const compacted = []
  trimmed.forEach(item => {
    const role = normalizeHostedRole(item.role)
    const content = String(item.content || '').trim()
    if (!content) return
    const prev = compacted[compacted.length - 1]
    if (prev && prev.role === role && prev.rawRole === (item.role || role) && prev.content === content) return
    compacted.push({ role, rawRole: item.role || role, content })
  })

  const mapped = compacted.map(item => ({
    role: item.role,
    content: `[${String(item.rawRole || item.role).toUpperCase()}] ${item.content}`,
  }))

  if (systemPrompt) mapped.unshift({ role: 'system', content: systemPrompt })
  return mapped
}

export function buildSeededHostedHistory(messages, contextMax = 100) {
  return (Array.isArray(messages) ? messages : [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-(contextMax || 100))
    .map(m => ({
      role: m.role,
      content: m.text || '',
      ts: m.timestamp || Date.now(),
    }))
    .filter(m => m.content)
}
