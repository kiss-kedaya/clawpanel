export function readHostedSessionData(storage, storageKey) {
  try {
    return JSON.parse(storage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

export function writeHostedSessionConfig(storage, storageKey, sessionKey, nextConfig) {
  const data = readHostedSessionData(storage, storageKey)
  data[sessionKey] = nextConfig
  storage.setItem(storageKey, JSON.stringify(data))
  return data
}

export function buildHostedState({ sessionKey, storedConfig, hostedDefaults, runtimeDefault }) {
  const config = { ...hostedDefaults, ...storedConfig }
  if (!config.boundSessionKey) config.boundSessionKey = sessionKey
  if (!config.systemPrompt && config.prompt) config.systemPrompt = config.prompt
  if (!config.prompt && config.systemPrompt) config.prompt = config.systemPrompt
  if (!config.contextTokenLimit) config.contextTokenLimit = hostedDefaults?.contextTokenLimit || runtimeDefault.contextTokenLimit
  if (!config.state) config.state = { ...runtimeDefault }
  if (!config.history) config.history = []
  config.history = config.history.filter(m => m.role !== 'system')
  const runtime = { ...runtimeDefault, ...config.state }
  return {
    sessionKey,
    config,
    runtime,
    seeded: config.history.length > 0,
    busy: false,
    lastTargetTs: 0,
    lastTargetHash: '',
    lastSentHash: '',
    lastCompletionRunId: '',
  }
}

export function snapshotHostedGlobals(values) {
  return { ...values }
}
