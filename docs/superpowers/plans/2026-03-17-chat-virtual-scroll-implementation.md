# Chat Virtual Scroll Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement virtual scrolling for chat messages with fixed window size (40 + overscan 20), fast first paint, and stable scroll anchoring.

**Architecture:** Use a virtualized list with top/bottom spacers, measured row heights cached by message id, and average height fallback. Update range on scroll, and preserve anchor when not at bottom.

**Tech Stack:** JS, Vite

---

## Chunk 1: Virtual list core

### Task 1: Add virtual list state + helpers

**Files:**
- Modify: `src/pages/chat.js`

- [ ] **Step 0: Checkpoint（PowerShell）**

```powershell
git status -sb
git commit --allow-empty -m "chore: checkpoint before chat virtual scroll"
```

- [ ] **Step 1: Add state**

Add:
- `const VIRTUAL_WINDOW = 40`
- `const VIRTUAL_OVERSCAN = 20`
- `let _virtualEnabled = true`
- `let _virtualHeights = new Map()`
- `let _virtualAvgHeight = 64`
- `let _virtualRange = { start: 0, end: 0 }`

- [ ] **Step 2: Compute range**

Implement function:

```js
function computeVirtualRange(total, scrollTop, viewportHeight) {
  const approxStart = Math.max(0, Math.floor(scrollTop / _virtualAvgHeight) - VIRTUAL_OVERSCAN)
  const approxEnd = Math.min(total, approxStart + VIRTUAL_WINDOW + VIRTUAL_OVERSCAN * 2)
  return { start: approxStart, end: approxEnd }
}
```

- [ ] **Step 3: Spacer heights**

Implement:

```js
function getSpacerHeight(start, end, total) {
  const top = start * _virtualAvgHeight
  const bottom = (total - end) * _virtualAvgHeight
  return { top, bottom }
}
```

- [ ] **Step 4: Measure heights**

After render, measure visible message nodes and update `_virtualHeights` and `_virtualAvgHeight`.

### Task 2: Integrate into render pipeline

**Files:**
- Modify: `src/pages/chat.js`

- [ ] **Step 1: Wrap message list**

Insert top spacer, visible messages, bottom spacer.

- [ ] **Step 2: Scroll handler**

On scroll, recompute range and re-render if changed.

- [ ] **Step 3: Anchor**

If user at bottom, auto scroll to bottom on new message; else keep position.

## Chunk 2: Build + Commit

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 2: Commit**

```powershell
git add src\pages\chat.js
git commit -m "feat: chat virtual scroll"
```

- [ ] **Step 3: Push**

```powershell
git push
```
