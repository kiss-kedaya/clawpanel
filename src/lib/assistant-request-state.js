export function ensureAssistantRequestState(stateMap, sessionId) {
  if (!sessionId) return null
  if (!stateMap.has(sessionId)) {
    stateMap.set(sessionId, {
      streaming: false,
      abortController: null,
      status: 'idle',
      queue: [],
      requestId: 0,
    })
  }
  return stateMap.get(sessionId)
}

export function patchAssistantRequestState(stateMap, sessionId, patch = {}) {
  const state = ensureAssistantRequestState(stateMap, sessionId)
  if (!state) return null
  Object.assign(state, patch)
  return state
}

export function getAssistantStreaming(stateMap, sessionId) {
  return ensureAssistantRequestState(stateMap, sessionId)?.streaming === true
}

export function setAssistantStreaming(stateMap, sessionId, value) {
  if (!sessionId) return null
  return patchAssistantRequestState(stateMap, sessionId, { streaming: value === true })
}

export function getAssistantAbortController(stateMap, sessionId) {
  return ensureAssistantRequestState(stateMap, sessionId)?.abortController || null
}

export function setAssistantAbortController(stateMap, sessionId, controller) {
  if (!sessionId) return null
  return patchAssistantRequestState(stateMap, sessionId, { abortController: controller || null })
}

export function nextAssistantRequestId(stateMap, sessionId) {
  const state = ensureAssistantRequestState(stateMap, sessionId)
  if (!state) return 0
  state.requestId = (state.requestId || 0) + 1
  return state.requestId
}

export function getAssistantRequestId(stateMap, sessionId) {
  return ensureAssistantRequestState(stateMap, sessionId)?.requestId || 0
}

export function isAssistantActiveRequest(stateMap, sessionId, requestId) {
  const state = ensureAssistantRequestState(stateMap, sessionId)
  return !!state && state.requestId === requestId
}

export function getAssistantQueue(stateMap, sessionId) {
  return ensureAssistantRequestState(stateMap, sessionId)?.queue || []
}

export function setAssistantQueue(stateMap, sessionId, queue) {
  if (!sessionId) return null
  return patchAssistantRequestState(stateMap, sessionId, { queue: Array.isArray(queue) ? queue : [] })
}
