export const HISTORY_OMITTED_IMAGES_NOTICE = '部分历史图片无法显示（Gateway 不保留图片原始数据，仅当前会话内可见）'

export function toUserHistoryAttachments(msg) {
  if (!msg?.images?.length) return []
  return msg.images.map(i => ({
    mimeType: i.mediaType || i.media_type || 'image/png',
    content: i.data || i.source?.data || '',
    category: 'image',
  })).filter(item => item.content)
}

export function hasRenderableHistoryMessage(msg) {
  return !!(msg && (msg.text || msg.images?.length || msg.videos?.length || msg.audios?.length || msg.files?.length || msg.tools?.length))
}

export function toHostedSeedHistory(messages = []) {
  return messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-200)
    .map(m => ({
      role: m.role,
      content: m.text || '',
      ts: m.timestamp || Date.now(),
    }))
    .filter(m => m.content)
}

export function toStoredHistoryMessages(messages = [], sessionKey, extractContent, createId) {
  return messages.map(m => {
    const c = extractContent(m, sessionKey)
    const role = (m.role === 'tool' || m.role === 'toolResult') ? 'assistant' : m.role
    return {
      id: m.id || createId(),
      sessionKey,
      role,
      content: c?.text || '',
      timestamp: m.timestamp || Date.now(),
    }
  })
}

export function toLocalAssistantImages(attachments = []) {
  return attachments
    .filter(a => a.category === 'image')
    .map(a => ({ mediaType: a.mimeType, data: a.content, url: a.url }))
}
