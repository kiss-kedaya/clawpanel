export const HOSTED_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  WAITING: 'waiting_reply',
  PAUSED: 'paused',
  ERROR: 'error',
}

export const HOSTED_SESSIONS_KEY = 'clawpanel-hosted-agent-sessions'
export const HOSTED_GLOBAL_KEY = 'hostedAgent.default'

export const HOSTED_DEFAULTS = {
  enabled: false,
  prompt: '',
  systemPrompt: '',
  contextTokenLimit: 200000,
  autoRunAfterTarget: true,
  stopPolicy: 'self',
  maxSteps: 50,
  stepDelayMs: 1200,
  retryLimit: 2,
  toolPolicy: 'inherit',
}

export const HOSTED_FIXED_SYSTEM_PROMPT = `你是托管 Agent 的轻量指挥层。

目标：理解用户意图，给对面 Agent 下达清晰、短小、可执行的指令，并给用户一个简短进度回复。

规则：
1. 回复要简约，优先短句，不要长篇解释。
2. 你负责指引、拆解、验收，不负责展开大段分析。
3. 不要要求用户重复确认；能继续就继续。
4. 缺少关键信息时，只指出最小缺口并停止，不输出 ask_user 或 confirm。
5. 对面 Agent 负责所有实际执行、工具调用、文件修改和验证。
6. 如发现可复用经验，要求对面 Agent 同步写入 docs 和 memory。

固定输出结构：
[目标]
一句话说明当前要完成什么。

[给对面Agent]
直接写清楚要做的事、顺序和验收标准，保持精炼。

[给用户]
只做简短汇报：当前进度、下一步、是否已完成。

要求：
- 少废话
- 少重复
- 少客套
- 面向执行
- 默认输出简短版本
`

export const HOSTED_RUNTIME_DEFAULT = {
  status: HOSTED_STATUS.IDLE,
  stepCount: 0,
  lastRunAt: 0,
  lastRunId: '',
  lastError: '',
  pending: false,
  errorCount: 0,
  contextTokens: 0,
  lastTrimAt: 0,
  lastAction: '',
  lastSpecialText: '',
  lastSpecialTs: 0,
}

export function parseHostedResponse(raw) {
  const text = String(raw || '').trim()
  if (!text) {
    return { goal: '', suggestions: [], risks: [] }
  }

  const lines = text.split(/\r?\n/).map(line => line.trim())
  const goals = []
  const suggestions = []
  const risks = []
  let section = ''

  lines.forEach(line => {
    if (!line) return
    if (/^目标[:：]/.test(line)) {
      section = 'goal'
      goals.push(line.replace(/^目标[:：]\s*/, '').trim())
      return
    }
    if (/^建议[:：]/.test(line)) {
      section = 'suggestions'
      const value = line.replace(/^建议[:：]\s*/, '').trim()
      if (value) suggestions.push(value)
      return
    }
    if (/^风险[:：]/.test(line)) {
      section = 'risks'
      const value = line.replace(/^风险[:：]\s*/, '').trim()
      if (value) risks.push(value)
      return
    }
    if (/^-\s+/.test(line)) {
      const value = line.replace(/^-\s+/, '').trim()
      if (!value) return
      if (section === 'risks') risks.push(value)
      else suggestions.push(value)
      return
    }
    if (section === 'goal') goals.push(line)
    else if (section === 'risks') risks.push(line)
    else suggestions.push(line)
  })

  if (!goals.length && !suggestions.length) {
    return {
      goal: '',
      suggestions: [text],
      risks: [],
    }
  }

  return {
    goal: goals.join(' '),
    suggestions: suggestions.filter(Boolean).length ? suggestions.filter(Boolean) : [text],
    risks: risks.filter(Boolean),
  }
}

export function renderHostedTemplate(parsed) {
  const parts = []
  if (parsed.goal) parts.push(`目标: ${parsed.goal}`)
  const suggestText = (parsed.suggestions || []).map(s => `- ${s}`).join('\n') || '- 暂无'
  parts.push(`建议:\n${suggestText}`)
  if (parsed.risks && parsed.risks.length) {
    const riskText = parsed.risks.map(r => `- ${r}`).join('\n')
    parts.push(`风险:\n${riskText}`)
  }
  return parts.join('\n')
}

export function extractHostedInstruction(text) {
  if (!text) return ''
  const raw = String(text)
  const withoutPrefix = raw.replace(/^\[托管 Agent\]\s*/g, '')
  const markerIndex = withoutPrefix.indexOf('@OpenClaw-Agent')
  if (markerIndex < 0) return ''
  const tail = withoutPrefix.slice(markerIndex)
  const stopMatch = tail.match(/\n\s*(\*\*\s*)?给用户的回复|\n\s*(\*\*\s*)?给用户回复|\n\s*(\*\*\s*)?给用户的回复（最终输出给用户）/)
  if (!stopMatch) return tail.trim()
  return tail.slice(0, stopMatch.index).trim()
}

export function extractHostedAskUser(text) {
  if (!text) return { text: '', askUser: null }
  const raw = String(text)
  const match = raw.match(/\[ASK_USER\]([\s\S]*?)\[\/ASK_USER\]/i)
  if (!match) return { text: raw, askUser: null }
  const jsonRaw = (match[1] || '').trim()
  let askUser = null
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw)
      if (parsed && typeof parsed === 'object') askUser = parsed
    } catch {
      askUser = null
    }
  }
  if (!askUser) askUser = { question: jsonRaw || '请提供信息' }
  const cleaned = raw.replace(match[0], '').trim()
  return { text: cleaned, askUser }
}

export function formatHostedActionLabel(action) {
  const map = {
    '': '',
    'generating-reply': '生成回复中',
    'resume-latest-target': '从最新回复恢复',
    'waiting-target': '等待目标回复',
    paused: '手动暂停',
    disconnected: '等待重连',
    stopped: '已停止',
    error: '异常中断',
  }
  return map[action] || action || ''
}
