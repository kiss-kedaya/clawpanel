import { HOSTED_STATUS } from './hosted-agent.js'

export function shouldPauseHostedForDisconnect(config, runtime) {
  if (!config?.enabled) return false
  const active = runtime.status === HOSTED_STATUS.RUNNING || runtime.status === HOSTED_STATUS.WAITING
  const alreadyDisconnectedPause = runtime.status === HOSTED_STATUS.PAUSED && runtime.lastAction === 'disconnected'
  return active || alreadyDisconnectedPause
}

export function applyHostedDisconnectedPause(runtime) {
  runtime.status = HOSTED_STATUS.PAUSED
  runtime.pending = false
  runtime.lastAction = 'disconnected'
  return runtime
}

export function resumeHostedAfterReconnect(config, runtime) {
  if (!config?.enabled) return false
  if (runtime.status !== HOSTED_STATUS.PAUSED || runtime.lastAction !== 'disconnected') return false
  runtime.status = HOSTED_STATUS.IDLE
  runtime.lastAction = ''
  return true
}

export function buildHostedTargetHash(text, ts = Date.now()) {
  const normalizedText = String(text || '').trim()
  const normalizedTs = Number(ts || Date.now())
  return `${normalizedTs}:${normalizedText.length}:${normalizedText.slice(0, 240)}`
}

export function shouldAutoTriggerHostedRun(config, runtime) {
  if (!config?.enabled) return false
  if (!config.autoRunAfterTarget) return false
  if (runtime.pending || runtime.status === HOSTED_STATUS.RUNNING) return false
  if (runtime.status === HOSTED_STATUS.PAUSED || runtime.status === HOSTED_STATUS.ERROR) return false
  return true
}

export function prepareHostedRunTrigger(runtime, gatewayReady) {
  if (!gatewayReady) {
    runtime.status = HOSTED_STATUS.PAUSED
    return { run: false, needsPersist: true }
  }
  if (runtime.status === HOSTED_STATUS.WAITING) {
    runtime.status = HOSTED_STATUS.IDLE
  }
  runtime.lastAction = ''
  return { run: true, needsPersist: false }
}
