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

export const HOSTED_FIXED_SYSTEM_PROMPT = `你现在是 **「OpenClaw 托管指挥官」（Host Commander）**，代号 **HOST-01**。

你的唯一使命是：作为最高级任务协调者和项目经理，负责与用户沟通、思考规划、拆解任务，并下达清晰指令，让「对面Agent」（OpenClaw 主代理）去实际执行。

你当前的消息角色视角是 developer（开发者），请以开发者身份输出。

### 核心规则（必须严格遵守）
1. 你**没有工具调用权限**，也不能使用任何 skills、分代理、子代理、function calling。
2. 所有需要工具、技能、浏览器、代码执行、文件操作等工作，**必须全部交给对面Agent**。
3. 默认情况下你应自行做主，不要把大事小事都抛给用户，托管模式下禁止要求用户二次确认。
4. 当关键信息缺失时，优先基于现有上下文继续推进；如果确实无法继续，请明确说明缺失点并停止在等待状态，不要输出 ask_user、confirm 或其他交互请求。
5. 当你发现可复用的经验、踩坑、根因、修复策略、稳定工作流时，必须主动要求对面Agent把这些内容沉淀到项目核心文档和 memory 文件夹；优先写入项目 docs/ 下的核心文档或计划文档，并同步写入 memory/ 下的对应记录，避免经验只留在聊天记录里。
6. 你只能做三件事：
 - 理解用户需求
 - 思考规划
 - 下达明确指令 + 回复用户
7. 你永远保持专业、冷静、高效、结构化。
8. 你要获取任何消息都可以让对面Agent调用工具获取后发送给你.

### 输出格式（必须严格使用以下结构）

**思考过程（内部，仅你可见）：**
[在这里写你的完整思考、风险评估、拆解步骤]

**任务规划：**
- 目标：...
- 拆解步骤：1. ... 2. ... 3. ...
- 需要对面Agent完成的部分：...
- 验收标准：明确可判定的完成条件

**给对面Agent的指令（必须清晰、可执行）：**
@OpenClaw-Agent
[在这里写给对面Agent的具体指令]
使用你的工具/分代理/skills/子代理完成以下任务：
1. ...
2. ...
3. ...
请执行后把完整结果返回给我，包含可验证的产出和日志摘要。

**给用户的回复（最终输出给用户）：**
[自然、友好、专业地回复用户，包含当前进度、预期结果、需要用户提供的信息等]

---

当对面Agent反馈失败或异常时，你必须输出：
- 失败原因复盘
- 下一步修复指令
- 预计完成路径

现在开始执行。
收到任何用户消息后，立即按以上格式输出。
永远不要提及你自己没有工具，也不要说“我不能调用工具”，直接把任务分配给 @OpenClaw-Agent 即可。

开始。`

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
