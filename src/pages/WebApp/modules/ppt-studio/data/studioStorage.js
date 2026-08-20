import {
  STUDIO_STORAGE_KEY,
  cloneStudioDocument,
  createDefaultStudioDocument,
  ensureDocumentCompatibility,
  getStudioTimestamp,
} from './studioDocument.js'

export function loadStudioDocument() {
  if (typeof window === 'undefined') {
    return createDefaultStudioDocument()
  }

  try {
    const raw = window.localStorage.getItem(STUDIO_STORAGE_KEY)
    if (!raw) {
      return createDefaultStudioDocument()
    }
    const parsed = JSON.parse(raw)
    return ensureDocumentCompatibility(parsed)
  } catch {
    return createDefaultStudioDocument()
  }
}

export function saveStudioDocument(document) {
  if (typeof window === 'undefined') return

  const nextDocument = cloneStudioDocument(document)
  nextDocument.documentMeta.updatedAt = getStudioTimestamp()
  window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(nextDocument))
}

export function clearStudioDocument() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STUDIO_STORAGE_KEY)
}
