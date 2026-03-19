## [ERR-20260319-001] vite-build-chat-js

**Logged**: 2026-03-19T03:53:00Z
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
`npm run build` failed after chat history / hosted delivery hardening edits due to invalid JS syntax near the end of `src/pages/chat.js`.

### Error
```
[vite:build-import-analysis] src/pages/chat.js (3786:0): Failed to parse source for import analysis because the content contains invalid JS syntax.
3784: }
3785: ssionStates.clear()
3786: }
```

### Context
- Operation attempted: `npm run build`
- Branch/worktree: `C:\Users\34438\.openclaw\workspace\tools\clawpanel`
- Related change: hosted delivery + history scroll hardening

### Suggested Fix
Inspect the trailing cleanup block in `src/pages/chat.js` and repair the truncated/garbled statement before re-running build.

### Metadata
- Reproducible: yes
- Related Files: src/pages/chat.js

---
