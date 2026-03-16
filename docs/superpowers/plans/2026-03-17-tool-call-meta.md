# Tool Call Meta Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show tool call time in the tool card header and ensure expanded sections display input/output placeholders when data is empty.

**Architecture:** Update tool rendering in `src/pages/chat.js` to compute display time and placeholders; optional minor CSS tweaks if needed.

**Tech Stack:** Vanilla JS, CSS, Vite build

---

## Chunk 1: Tool header time + placeholders

### Task 1: Add tool time display

**Files:**
- Modify: `src/pages/chat.js`

- [ ] **Step 0: Checkpoint（PowerShell）**

```powershell
git status -sb
git commit --allow-empty -m "chore: checkpoint before tool meta"
```

Note: This checkpoint is required by policy; final functional commit occurs after build.

- [ ] **Step 1: Add helper to get tool time**

Add a function (near tool helpers):

```js
function getToolTime(tool) {
  return tool?.end_time || tool?.endTime || tool?.timestamp || tool?.time || tool?.started_at || tool?.startedAt || null
}
```

- [ ] **Step 2: Render header with time**

Update tool header to include time:

```js
const time = getToolTime(tool)
const timeText = time ? formatTime(new Date(time)) : '时间未知'
summary.innerHTML = `${escapeHtml(tool.name || '工具')} · ${status} · ${timeText}`
```

- [ ] **Step 3: Add placeholders**

Ensure placeholders show when empty:

```js
const input = inputJson ? `<div ...>...</div>` : `<div class="msg-tool-block"><div class="msg-tool-title">参数</div><pre>无参数</pre></div>`
const output = outputJson ? `<div ...>...</div>` : `<div class="msg-tool-block"><div class="msg-tool-title">结果</div><pre>无结果</pre></div>`
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 5: Commit（PowerShell）**

```powershell
git add src/pages/chat.js
git commit -m "fix: show tool time and placeholders"
```

- [ ] **Step 6: Push（PowerShell）**

```powershell
git push
```
