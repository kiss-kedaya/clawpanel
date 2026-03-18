export function renderAssistantSettingsModal({
  config,
  assistantName,
  apiTypes,
  providerPresets,
  qtcool,
  defaultName,
  defaultPersonality,
  normalizeApiType,
  apiBasePlaceholder,
  apiKeyPlaceholder,
  apiHintText,
  escHtml,
  icon,
}) {
  const c = config
  const soulIsOpenClaw = !!c.soulSource?.startsWith('openclaw:')
  const assistantDisplayName = assistantName || defaultName
  const toolCount = [c.tools?.terminal !== false, c.tools?.fileOps !== false, c.tools?.webSearch !== false].filter(Boolean).length
  const knowledgeCount = Array.isArray(c.knowledgeFiles) ? c.knowledgeFiles.length : 0
  const providerPresetOptions = providerPresets
    .filter(p => !p.hidden)
    .map(p => `<option value="${p.key}" data-url="${escHtml(p.baseUrl)}" data-api="${p.api}">${p.label}${p.badge ? ' · ' + p.badge : ''}</option>`)
    .join('')

  return `
    <div class="modal ast-settings-modal-shell" style="max-width:920px">
      <div class="modal-title ast-settings-modal-title">${assistantDisplayName} — 设置</div>
      <div class="ast-settings-overview">
        <div class="ast-settings-overview-card">
          <span class="ast-settings-overview-label">当前模型</span>
          <strong class="ast-settings-overview-value">${escHtml(c.model || '未配置')}</strong>
        </div>
        <div class="ast-settings-overview-card">
          <span class="ast-settings-overview-label">身份来源</span>
          <strong class="ast-settings-overview-value">${soulIsOpenClaw ? 'OpenClaw Agent' : '默认身份'}</strong>
        </div>
        <div class="ast-settings-overview-card">
          <span class="ast-settings-overview-label">知识文件</span>
          <strong class="ast-settings-overview-value">${knowledgeCount} 个</strong>
        </div>
        <div class="ast-settings-overview-card">
          <span class="ast-settings-overview-label">启用工具</span>
          <strong class="ast-settings-overview-value">${toolCount} / 3</strong>
        </div>
      </div>
      <div class="ast-settings-tabs ast-settings-tabs-5">
        <button class="ast-tab active" data-tab="basic">基础</button>
        <button class="ast-tab" data-tab="model">模型</button>
        <button class="ast-tab" data-tab="tools">工具</button>
        <button class="ast-tab" data-tab="advanced">高级</button>
        <button class="ast-tab" data-tab="status">状态</button>
      </div>
      <div class="modal-body ast-settings-body">
        <div class="ast-settings-form">
          <div class="ast-tab-panel active" data-panel="basic">
            <section class="ast-settings-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">助手身份</div>
                  <div class="ast-settings-section-desc">先定义这个助手是谁、以什么身份和你交流。</div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">身份来源</label>
                <div class="ast-radio-stack">
                  <label class="ast-radio-row">
                    <input type="radio" name="ast-soul-source" value="default" ${!soulIsOpenClaw ? 'checked' : ''}>
                    <span>
                      <strong>ClawPanel 默认身份</strong>
                      <small>适合日常对话，直接配置名称与性格即可。</small>
                    </span>
                  </label>
                  <label class="ast-radio-row">
                    <input type="radio" name="ast-soul-source" value="openclaw" ${soulIsOpenClaw ? 'checked' : ''}>
                    <span>
                      <strong>OpenClaw Agent 身份</strong>
                      <small>继承 Agent 的人格、记忆和偏好，用于“借尸还魂”模式。</small>
                    </span>
                  </label>
                </div>
              </div>
              <div id="ast-soul-default" style="${soulIsOpenClaw ? 'display:none' : ''}">
                <div class="ast-settings-grid ast-settings-grid-2">
                  <div class="form-group">
                    <label class="form-label">助手名称</label>
                    <input class="form-input" id="ast-name" value="${escHtml(c.assistantName || defaultName)}" placeholder="${defaultName}">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">助手性格</label>
                  <textarea class="form-input" id="ast-personality" rows="4" placeholder="${defaultPersonality}" style="resize:vertical">${escHtml(c.assistantPersonality || defaultPersonality)}</textarea>
                  <div class="form-hint">描述助手的说话方式、行为边界和执行风格。</div>
                </div>
              </div>
            </section>
          </div>

          <div class="ast-tab-panel" data-panel="model">
            <section class="ast-settings-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">模型连接</div>
                  <div class="ast-settings-section-desc">主流程只保留必要配置，快捷接入降级到次级块。</div>
                </div>
                <button class="btn btn-sm btn-secondary" id="ast-import-openclaw">从 openclaw 导入</button>
              </div>
              <div class="form-group" style="margin-bottom:8px">
                <label class="form-label">快捷选择</label>
                <select class="form-input" id="ast-provider-presets">
                  <option value="">请选择服务商预设...</option>
                  ${providerPresetOptions}
                </select>
                <div id="ast-preset-detail" class="ast-inline-note" style="display:none"></div>
              </div>
              <div class="ast-settings-grid ast-settings-grid-api">
                <div class="form-group">
                  <label class="form-label">API Base URL</label>
                  <input class="form-input" id="ast-baseurl" value="${escHtml(c.baseUrl)}" placeholder="${escHtml(apiBasePlaceholder(c.apiType))}">
                </div>
                <div class="form-group ast-settings-grid-narrow">
                  <label class="form-label">API 类型</label>
                  <select class="form-input" id="ast-apitype">
                    ${apiTypes.map(t => `<option value="${t.value}" ${normalizeApiType(c.apiType) === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="ast-settings-inline-actions">
                <div class="form-group ast-settings-inline-grow" style="margin-bottom:0">
                  <label class="form-label">API Key</label>
                  <input class="form-input" id="ast-apikey" type="password" value="${escHtml(c.apiKey)}" placeholder="${escHtml(apiKeyPlaceholder(c.apiType))}">
                </div>
                <div class="ast-settings-inline-buttons">
                  <button class="btn btn-sm btn-secondary" id="ast-btn-test" title="测试连通性">测试</button>
                  <button class="btn btn-sm btn-secondary" id="ast-btn-models" title="从 API 获取可用模型">拉取</button>
                  <button class="btn btn-sm btn-secondary" id="ast-btn-import" title="从 OpenClaw 导入模型配置">${icon('download', 14)} 导入</button>
                </div>
              </div>
              <div id="ast-test-result" class="ast-inline-note"></div>
              <div class="ast-settings-grid ast-settings-grid-model">
                <div class="form-group">
                  <label class="form-label">模型</label>
                  <div style="position:relative">
                    <input class="form-input" id="ast-model" value="${escHtml(c.model)}" placeholder="gpt-4o / deepseek-chat" autocomplete="off">
                    <div id="ast-model-dropdown" class="ast-model-dropdown" style="display:none"></div>
                  </div>
                </div>
                <div class="form-group ast-settings-grid-temp">
                  <label class="form-label">温度</label>
                  <input class="form-input" id="ast-temp" type="number" value="${c.temperature || 0.7}" min="0" max="2" step="0.1">
                </div>
              </div>
              <div class="form-hint" id="ast-api-hint">${apiHintText(c.apiType)}</div>
            </section>

            <section class="ast-settings-section ast-settings-subdued-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">晴辰云快捷接入</div>
                  <div class="ast-settings-section-desc">作为推荐方案保留，但不再占据主流程中心。</div>
                </div>
              </div>
              <div id="ast-qtcool-promo" class="ast-qtcool-card">
                <div class="ast-qtcool-copy">
                  <div class="ast-qtcool-title-row">
                    <span class="ast-qtcool-icon">${icon('zap', 16)}</span>
                    <strong>低成本接入顶级模型</strong>
                    <span class="ast-qtcool-badge">推荐</span>
                  </div>
                  <div class="ast-qtcool-desc">面板用户免费使用部分模型，付费用户享全系列顶级模型，全部低至 2-3 折。</div>
                </div>
                <div class="ast-qtcool-controls">
                  <select id="ast-qtcool-model" class="form-input ast-qtcool-model-select">
                    <option value="" disabled selected>加载模型列表...</option>
                  </select>
                  <div class="ast-settings-inline-buttons">
                    <button class="btn btn-sm btn-secondary" id="ast-qtcool-test">${icon('search', 12)} 测试</button>
                    <button class="btn btn-sm btn-primary" id="ast-qtcool-apply">${icon('zap', 12)} 接入</button>
                  </div>
                </div>
                <div id="ast-qtcool-status" class="ast-inline-note"></div>
                <div class="ast-qtcool-footer">
                  <label class="ast-checkbox-note">
                    <input type="checkbox" id="ast-qtcool-customkey">
                    <span>使用自定义密钥</span>
                  </label>
                  <div class="ast-qtcool-links">
                    <a id="ast-qtcool-usage" href="${qtcool.usageUrl}${qtcool.defaultKey}" target="_blank">${icon('external-link', 12)} 用量查询</a>
                    <a href="${qtcool.site}" target="_blank">${icon('external-link', 12)} 了解更多</a>
                  </div>
                </div>
                <div id="ast-qtcool-keyrow" style="display:none">
                  <input class="form-input" id="ast-qtcool-key" placeholder="粘贴你的密钥">
                </div>
              </div>
            </section>
          </div>

          <div class="ast-tab-panel" data-panel="tools">
            <section class="ast-settings-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">能力与安全</div>
                  <div class="ast-settings-section-desc">决定 AI 能做什么，而不是 AI 是谁。</div>
                </div>
              </div>
              <div class="form-hint" style="margin-bottom:10px">工具开关优先级高于模式设置，关闭后在任何模式下都不可用。</div>
              <label class="ast-switch-row">
                <span>终端工具 <span style="color:var(--text-tertiary);font-size:11px">— 允许执行 Shell 命令</span></span>
                <input type="checkbox" id="ast-tool-terminal" ${c.tools?.terminal !== false ? 'checked' : ''}>
                <span class="ast-switch-track"></span>
              </label>
              <label class="ast-switch-row">
                <span>文件工具 <span style="color:var(--text-tertiary);font-size:11px">— 允许读写文件和浏览目录</span></span>
                <input type="checkbox" id="ast-tool-fileops" ${c.tools?.fileOps !== false ? 'checked' : ''}>
                <span class="ast-switch-track"></span>
              </label>
              <label class="ast-switch-row">
                <span>联网搜索 <span style="color:var(--text-tertiary);font-size:11px">— 允许搜索互联网和抓取网页</span></span>
                <input type="checkbox" id="ast-tool-websearch" ${c.tools?.webSearch !== false ? 'checked' : ''}>
                <span class="ast-switch-track"></span>
              </label>
              <div class="ast-settings-grid ast-settings-grid-2" style="margin-top:16px">
                <div class="ast-settings-metric-card">
                  <span class="ast-settings-metric-label">连续执行轮次</span>
                  <select class="form-input" id="ast-auto-rounds" style="width:100%">
                    <option value="0" ${(c.autoRounds ?? 8) === 0 ? 'selected' : ''}>∞ 无限制（一直执行）</option>
                    <option value="8" ${(c.autoRounds ?? 8) === 8 ? 'selected' : ''}>8 轮（默认）</option>
                    <option value="15" ${(c.autoRounds ?? 8) === 15 ? 'selected' : ''}>15 轮</option>
                    <option value="30" ${(c.autoRounds ?? 8) === 30 ? 'selected' : ''}>30 轮</option>
                    <option value="50" ${(c.autoRounds ?? 8) === 50 ? 'selected' : ''}>50 轮</option>
                  </select>
                </div>
                <div class="ast-settings-metric-card">
                  <span class="ast-settings-metric-label">当前启用工具</span>
                  <strong class="ast-settings-metric-value">${toolCount} / 3</strong>
                  <span class="ast-settings-metric-note">终端、文件、联网</span>
                </div>
              </div>
              <div class="form-hint" style="margin-top:10px">设为「无限制」时 AI 将不会中断执行，适合复杂任务。随时可点停止按钮手动中止。</div>
            </section>
          </div>

          <div class="ast-tab-panel" data-panel="advanced">
            <section class="ast-settings-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">灵魂加载</div>
                  <div class="ast-settings-section-desc">高级身份能力放到这里，不再和基础人设混在一起。</div>
                </div>
              </div>
              <div id="ast-soul-openclaw" style="${soulIsOpenClaw ? '' : 'display:none'}">
                <div class="form-group">
                  <label class="form-label">选择 Agent</label>
                  <div class="ast-settings-inline-actions">
                    <select class="form-input ast-settings-inline-grow" id="ast-soul-agent" style="font-family:var(--font-mono);font-size:13px">
                      <option value="" disabled>扫描中...</option>
                    </select>
                    <div class="ast-settings-inline-buttons">
                      <button class="btn btn-sm btn-primary" id="ast-btn-load-soul">加载灵魂</button>
                      <button class="btn btn-sm btn-secondary" id="ast-btn-refresh-soul" title="重新扫描 Agent 列表">刷新</button>
                    </div>
                  </div>
                </div>
                <div id="ast-soul-status" class="ast-soul-card">
                  <div style="text-align:center;padding:16px 0;color:var(--text-tertiary);font-size:12px">选择 Agent 后点击「加载灵魂」读取身份文件</div>
                </div>
                <div class="form-hint" style="margin-top:8px">附身后助手将继承 Agent 的人格、记忆和用户偏好，同时保留 ClawPanel 的工具能力。</div>
              </div>
              <div id="ast-soul-advanced-placeholder" class="ast-inline-note" style="${soulIsOpenClaw ? 'display:none' : ''}">当前使用默认身份。如需借用 OpenClaw Agent 的人格与记忆，请切到 OpenClaw Agent 身份后在此加载。</div>
            </section>

            <section class="ast-settings-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">知识库</div>
                  <div class="ast-settings-section-desc">知识内容保留在高级区，避免挤压常用设置。</div>
                </div>
                <button class="btn btn-sm btn-primary" id="ast-kb-add">${icon('plus', 14)} 添加</button>
              </div>
              <div id="ast-kb-editor" style="display:none;margin-bottom:10px">
                <div class="form-group" style="margin-bottom:6px">
                  <input class="form-input" id="ast-kb-name" placeholder="知识名称，如：产品文档、API参考" style="font-size:13px">
                </div>
                <div class="form-group" style="margin-bottom:6px">
                  <textarea class="form-input" id="ast-kb-content" rows="6" placeholder="粘贴知识内容（支持 Markdown 格式）..." style="resize:vertical;font-size:12px;font-family:var(--font-mono)"></textarea>
                </div>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button class="btn btn-sm btn-secondary" id="ast-kb-cancel">取消</button>
                  <button class="btn btn-sm btn-primary" id="ast-kb-save">保存知识</button>
                </div>
              </div>
              <div class="ast-soul-card" id="ast-kb-list"></div>
              <div class="form-hint" style="margin-top:8px" id="ast-kb-hint"></div>
            </section>
          </div>

          <div class="ast-tab-panel" data-panel="status">
            <section class="ast-settings-section">
              <div class="ast-settings-section-head">
                <div>
                  <div class="ast-settings-section-title">当前状态</div>
                  <div class="ast-settings-section-desc">不进设置也该知道当前助手在什么配置下工作。</div>
                </div>
              </div>
              <div class="ast-settings-grid ast-settings-grid-status">
                <div class="ast-settings-metric-card">
                  <span class="ast-settings-metric-label">当前模型</span>
                  <strong class="ast-settings-metric-value">${escHtml(c.model || '未配置')}</strong>
                  <span class="ast-settings-metric-note">API 类型：${escHtml(normalizeApiType(c.apiType))}</span>
                </div>
                <div class="ast-settings-metric-card">
                  <span class="ast-settings-metric-label">身份来源</span>
                  <strong class="ast-settings-metric-value">${soulIsOpenClaw ? 'OpenClaw Agent' : '默认身份'}</strong>
                  <span class="ast-settings-metric-note">助手名称：${escHtml(c.assistantName || defaultName)}</span>
                </div>
                <div class="ast-settings-metric-card">
                  <span class="ast-settings-metric-label">知识文件</span>
                  <strong class="ast-settings-metric-value">${knowledgeCount}</strong>
                  <span class="ast-settings-metric-note">已启用：${Array.isArray(c.knowledgeFiles) ? c.knowledgeFiles.filter(file => file.enabled !== false).length : 0}</span>
                </div>
                <div class="ast-settings-metric-card">
                  <span class="ast-settings-metric-label">执行能力</span>
                  <strong class="ast-settings-metric-value">${toolCount} / 3</strong>
                  <span class="ast-settings-metric-note">自动轮次：${c.autoRounds ?? 8}</span>
                </div>
              </div>
              <div class="ast-inline-note">当前状态区只做摘要展示；真正修改请回到对应标签页操作。</div>
            </section>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary btn-sm" data-action="cancel">取消</button>
        <button class="btn btn-primary btn-sm" data-action="confirm">保存</button>
      </div>
    </div>
  `
}

export function renderAssistantKnowledgeList({ kbFiles, kbListEl, kbHintEl, escHtml }) {
  if (kbFiles.length === 0) {
    kbListEl.innerHTML = `<div style="text-align:center;padding:20px 0;color:var(--text-tertiary);font-size:12px">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:6px;opacity:0.4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      <div>点击「添加」按钮添加知识文件</div></div>`
    kbHintEl.textContent = ''
    return
  }
  const totalSize = kbFiles.reduce((sum, file) => sum + (file.content?.length || 0), 0)
  const sizeStr = totalSize > 1024 ? (totalSize / 1024).toFixed(1) + ' KB' : totalSize + ' B'
  const enabledCount = kbFiles.filter(file => file.enabled !== false).length
  kbHintEl.textContent = `共 ${kbFiles.length} 个知识文件（${enabledCount} 个启用，${sizeStr}），保存后生效。`

  let html = '<div class="ast-soul-files">'
  kbFiles.forEach((file, index) => {
    const fileSize = file.content?.length > 1024 ? (file.content.length / 1024).toFixed(1) + ' KB' : (file.content?.length || 0) + ' B'
    const enabled = file.enabled !== false
    html += `<div class="ast-soul-file ${enabled ? 'loaded' : 'missing'}" data-kb-idx="${index}" style="cursor:pointer" title="点击编辑">
      <button style="padding:2px;background:none;border:none;cursor:pointer;flex-shrink:0" data-kb-toggle="${index}" title="${enabled ? '点击禁用' : '点击启用'}">
        <div class="ast-soul-file-icon">${enabled ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>'}</div>
      </button>
      <div class="ast-soul-file-info">
        <span class="ast-soul-file-name">${escHtml(file.name)}</span>
        <span class="ast-soul-file-desc">${file.content?.split('\n').length || 0} 行 · 点击编辑</span>
      </div>
      <span class="ast-soul-file-size">${fileSize}</span>
      <button class="btn btn-sm" style="padding:2px 6px;font-size:11px;color:var(--error);background:none;border:none;cursor:pointer" data-kb-del="${index}" title="删除">✕</button>
    </div>`
  })
  html += '</div>'
  kbListEl.innerHTML = html
}

export function updateAssistantTitleFromSettings({ page, config, soulCache }) {
  const titleEl = page?.querySelector('.ast-title')
  if (!titleEl) return

  let displayName = config.assistantName
  if (config.soulSource?.startsWith('openclaw:') && soulCache?.identity) {
    const nameMatch = soulCache.identity.match(/\*\*Name:\*\*\s*(.+)/i) || soulCache.identity.match(/名[字称][:：]\s*(.+)/i)
    const extracted = nameMatch?.[1]?.trim()
    if (extracted && !extracted.startsWith('_') && !extracted.startsWith('（') && extracted.length < 30) {
      displayName = extracted
    }
  }

  titleEl.textContent = displayName
}
