export async function runAssistantResponse({
  toolsEnabled,
  session,
  contextMessages,
  requestId,
  requestController,
  aiMsg,
  lastBubble,
  messagesEl,
  currentSessionId,
  callAIWithTools,
  callAI,
  isActiveRequest,
  renderMessages,
  renderToolBlocks,
  renderMarkdown,
  escHtml,
  throttledSave,
  updateAssistantToolProgress,
  appendAssistantStreamChunk,
  finalizeAssistantStreamBubble,
  lastRenderTime,
  onLastRenderTime,
}) {
  if (toolsEnabled) {
    const aiMsgContainers = messagesEl?.querySelectorAll('.ast-msg-ai')
    const lastContainer = aiMsgContainers?.[aiMsgContainers.length - 1]

    const result = await callAIWithTools(
      session.id,
      contextMessages,
      (status) => {
        if (!isActiveRequest(session.id, requestId)) return
        if (lastBubble) lastBubble.innerHTML = `<span class="ast-typing">${escHtml(status)}</span>`
      },
      (history) => {
        if (!isActiveRequest(session.id, requestId)) return
        updateAssistantToolProgress({
          history,
          aiMsg,
          lastContainer,
          renderToolBlocks,
          throttledSave,
          messagesEl,
        })
      },
      requestController.signal
    )

    if (!isActiveRequest(session.id, requestId)) return
    aiMsg.content = result.content
    if (result.toolHistory.length > 0) aiMsg.toolHistory = result.toolHistory
    if (currentSessionId === session.id) renderMessages()
    return
  }

  await callAI(session.id, contextMessages, (chunk) => {
    if (!isActiveRequest(session.id, requestId)) return
    const nextRenderTime = appendAssistantStreamChunk({
      aiMsg,
      chunk,
      throttledSave,
      lastBubble,
      renderMarkdown,
      messagesEl,
      lastRenderTime,
    })
    if (typeof onLastRenderTime === 'function') onLastRenderTime(nextRenderTime)
  }, requestController.signal)

  if (!isActiveRequest(session.id, requestId)) return
  finalizeAssistantStreamBubble(lastBubble, aiMsg.content, renderMarkdown)
}
