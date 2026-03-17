# Chat Virtual Scroll Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement virtual scrolling for chat messages with fixed window size (40 + overscan 20), fast first paint, and stable scroll anchoring.

**Architecture:** Use a virtualized list with top/bottom spacers and total height based on cumulative measured heights (fallback to average). Range calculation uses cumulative heights (prefix sums/binary search) instead of pure avg height. Preserve anchor when not at bottom.

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

- [ ] **Step 2: Compute cumulative heights**

Implement prefix sum using measured heights with avg fallback:

```js
function getItemHeight(idx, items) {
  const id = items[idx]?.id
  return _virtualHeights.get(id) || _virtualAvgHeight
}

function buildPrefixHeights(items) {
  const prefix = [0]
  for (let i = 0; i < items.length; i++) {
    prefix[i + 1] = prefix[i] + getItemHeight(i, items)
  }
  return prefix
}
```

- [ ] **Step 3: Range calculation by cumulative heights**

```js
function findStartIndex(prefix, scrollTop) {
  let lo = 0, hi = prefix.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (prefix[mid] <= scrollTop) lo = mid + 1
    else hi = mid
  }
  return Math.max(0, lo - 1)
}

function computeVirtualRange(items, scrollTop, viewportHeight) {
  const prefix = buildPrefixHeights(items)
  const start = Math.max(0, findStartIndex(prefix, scrollTop) - VIRTUAL_OVERSCAN)
  let end = start
  const maxY = scrollTop + viewportHeight
  while (end < items.length && prefix[end] < maxY + _virtualAvgHeight * VIRTUAL_OVERSCAN) end++
  return { start, end, prefix }
}
```

- [ ] **Step 4: Spacer heights + total height**

```js
function getSpacerHeights(prefix, start, end) {
  const top = prefix[start]
  const total = prefix[prefix.length - 1]
  const bottom = Math.max(0, total - prefix[end])
  return { top, bottom, total }
}
```

- [ ] **Step 5: Measure heights**

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
