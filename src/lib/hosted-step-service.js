import { HOSTED_DEFAULTS, HOSTED_STATUS } from './hosted-agent.js'

export function validateHostedStepStart(config, runtime, gatewayReady, boundKey) {
  const prompt = String(config?.prompt || '').trim()
  if (!config?.enabled || !prompt) return { ok: false, reason: 'skip' }
  if (!gatewayReady || !boundKey) {
    runtime.status = HOSTED_STATUS.PAUSED
    runtime.lastError = 'Gateway 未就绪或 sessionKey 缺失'
    runtime.lastAction = 'paused'
    return { ok: false, reason: 'gateway' }
  }
  if ((runtime.errorCount || 0) >= (config.retryLimit || 0)) {
    runtime.status = HOSTED_STATUS.ERROR
    return { ok: false, reason: 'retry-limit' }
  }
  if ((runtime.stepCount || 0) >= (config.maxSteps || 0)) {
    runtime.status = HOSTED_STATUS.IDLE
    runtime.lastAction = ''
    return { ok: false, reason: 'max-steps' }
  }
  return { ok: true, prompt }
}

export function beginHostedStep(runtime, createId) {
  runtime.pending = true
  runtime.status = HOSTED_STATUS.RUNNING
  runtime.lastRunAt = Date.now()
  runtime.lastRunId = createId()
  runtime.lastAction = ''
  return runtime.lastRunId
}

export function getHostedStepDelay(config) {
  return config?.stepDelayMs || HOSTED_DEFAULTS.stepDelayMs
}

export function markHostedGenerating(runtime) {
  runtime.lastAction = 'generating-reply'
}

export function applyHostedTemplateError(runtime) {
  runtime.errorCount = (runtime.errorCount || 0) + 1
  runtime.lastError = '托管 Agent 输出未符合模板'
  runtime.pending = false
  runtime.status = HOSTED_STATUS.ERROR
  runtime.lastAction = 'error'
}

export function applyHostedStepSuccess(runtime) {
  runtime.stepCount += 1
  runtime.errorCount = 0
  runtime.lastError = ''
  runtime.status = HOSTED_STATUS.WAITING
  runtime.pending = false
}

export function applyHostedSelfStop(runtime) {
  runtime.status = HOSTED_STATUS.IDLE
  runtime.lastAction = 'stopped'
}

export function applyHostedStepFailure(runtime, retryLimit) {
  runtime.errorCount = (runtime.errorCount || 0) + 1
  runtime.lastError = runtime.lastError || '执行失败'
  runtime.pending = false
  if ((runtime.errorCount || 0) >= (retryLimit || 0)) {
    runtime.status = HOSTED_STATUS.ERROR
    return { terminal: true }
  }
  return { terminal: false, retryDelayMs: null }
}
