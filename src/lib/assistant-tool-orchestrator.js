export function createAssistantToolHistoryEntry(name, args) {
  return { name, args, result: null, approved: true, pending: true }
}

export function finalizeAssistantToolHistoryEntry(entry, execResult) {
  if (!entry) return null
  entry.result = execResult?.result ?? null
  entry.approved = execResult?.approved !== false
  entry.pending = false
  return entry
}

export async function withAssistantWaitingStatus(sessionId, helpers, task) {
  if (sessionId) helpers.setSessionStatus(sessionId, 'waiting')
  try {
    return await task()
  } finally {
    if (sessionId && helpers.getStreaming(sessionId)) helpers.setSessionStatus(sessionId, 'streaming')
  }
}
