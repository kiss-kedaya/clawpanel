export function createAssistantPendingImage({ dataUrl, name, width, height, idFactory }) {
  return {
    id: typeof idFactory === 'function' ? idFactory() : Date.now().toString() + Math.random().toString(36).slice(2, 6),
    dataUrl,
    name: name || 'image.jpg',
    width,
    height,
  }
}

export function removeAssistantPendingImage(images, id) {
  return (Array.isArray(images) ? images : []).filter(img => img.id !== id)
}

export function clearAssistantPendingImages() {
  return []
}

export function buildAssistantImagePreviewHtml(images, escapeHtml, deleteSvg) {
  return (Array.isArray(images) ? images : []).map(img => `
    <div class="ast-img-thumb" data-img-id="${img.id}">
      <img src="${img.dataUrl}" alt="${escapeHtml(img.name)}"/>
      <button class="ast-img-thumb-del" data-img-del="${img.id}" title="移除">${deleteSvg}</button>
    </div>
  `).join('')
}

export function buildAssistantMessageContent(text, images) {
  if (!images || images.length === 0) return text
  const parts = []
  if (text) parts.push({ type: 'text', text })
  for (const img of images) {
    parts.push({
      type: 'image_url',
      image_url: { url: img.dataUrl, detail: 'auto' },
    })
  }
  return parts
}
