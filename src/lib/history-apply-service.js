export function updateHistoryApplyState(state, messages, hasExisting, helpers) {
  const appliedTs = helpers.maxHistoryTimestamp(messages)
  state.lastHistoryAppliedTs = Math.max(Number(state.lastHistoryAppliedTs || 0), appliedTs)

  const hash = helpers.buildHistoryHash(messages)
  const shouldSkip = hash === state.lastHistoryHash && hasExisting
  state.lastHistoryHash = hash

  return {
    appliedTs,
    hash,
    shouldSkip,
  }
}

export function seedHostedHistoryIfNeeded(options) {
  const {
    sessionKey,
    hostedBoundSessionKey,
    hostedSeeded,
    hostedSessionConfig,
    deduped,
    toHostedSeedHistory,
    trimHostedHistoryByTokens,
    persistHostedRuntime,
  } = options

  if (sessionKey !== hostedBoundSessionKey) return hostedSeeded
  if (hostedSeeded) return hostedSeeded
  if (!hostedSessionConfig) return hostedSeeded
  if (hostedSessionConfig.history && hostedSessionConfig.history.length > 0) return true

  const seeded = toHostedSeedHistory(deduped)
  if (seeded.length) {
    hostedSessionConfig.history = seeded
    trimHostedHistoryByTokens()
    persistHostedRuntime()
  }
  return true
}
