export function prepareAssistantRunContext({
  session,
  currentSessionId,
  messagesEl,
  renderMessages,
  renderSessionList,
  sendBtn,
  stopIcon,
  startStreamRefresh,
  getEnabledTools,
  typingText,
}) {
  if (currentSessionId === session.id) {
    if (sendBtn) sendBtn.innerHTML = stopIcon()
    startStreamRefresh(session.id)
  }
  renderSessionList()

  if (currentSessionId === session.id) renderMessages()
  const aiBubbles = currentSessionId === session.id ? messagesEl?.querySelectorAll('.ast-msg-bubble-ai') : null
  const lastBubble = aiBubbles?.[aiBubbles.length - 1]
  if (lastBubble) lastBubble.innerHTML = `<span class="ast-typing">${typingText}</span>`

  return {
    lastBubble,
    toolsEnabled: getEnabledTools().length > 0,
  }
}
