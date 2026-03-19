# Learnings

## [LRN-20260319-001] correction

**Logged**: 2026-03-19T13:18:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
A claim that assistant settings access, hosted-agent toggle removal, and global select styling were already fixed was incorrect; these required direct source verification before reporting completion.

### Details
User reported three regressions still visible in the live UI: assistant settings could not be opened reliably, the hosted-agent enable toggle was still present in chat UI, and native select styling remained visually broken. The fix was to re-read the live source and patch the actual UI code instead of relying on partial earlier assumptions.

### Suggested Action
Before claiming UI fixes are complete, verify the rendered source locations that own the feature trigger, the visible markup, and the final shared CSS path used by the control.

### Metadata
- Source: conversation
- Related Files: src/pages/assistant.js, src/pages/chat.js, src/style/reset.css
- Tags: correction, ui, verification

### Resolution
- **Resolved**: 2026-03-19T13:19:00+08:00
- **Commit/PR**: pending
- **Notes**: fixed by removing hosted-agent enable toggle markup/state, strengthening assistant settings button click handling/z-index, and tightening global select styling in reset.css.

---
