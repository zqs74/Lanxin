import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Layers, PanelRight, Plus, X } from 'lucide-react'
import AssetLibraryPanel from './ppt-studio/components/AssetLibraryPanel.jsx'
import PropertiesPanel from './ppt-studio/components/PropertiesPanel.jsx'
import StudioCanvas from './ppt-studio/components/StudioCanvas.jsx'
import StudioToolbar from './ppt-studio/components/StudioToolbar.jsx'
import {
  STUDIO_ASSET_LIBRARY,
  cloneStudioDocument,
  createDefaultStudioDocument,
  createEmptyStudioPage,
  getActivePage,
  getNextZIndex,
  insertElementAtCenter,
  normalizeElementOrder,
  normalizeNumber,
} from './ppt-studio/data/studioDocument.js'
import {
  loadStudioDocument,
  saveStudioDocument,
} from './ppt-studio/data/studioStorage.js'

function clampSize(value, fallback) {
  return Math.max(24, normalizeNumber(value, fallback))
}

function cloneSelection(page, selectedElementId) {
  if (!page || !selectedElementId) return null
  return page.elements.find((element) => element.id === selectedElementId) ?? null
}

function createHistoryBundle(document) {
  return [cloneStudioDocument(document)]
}

function createEmptyPageName(pages) {
  return `画布 ${pages.length + 1}`
}

function Dialog({ title, description, confirmLabel, tone = 'default', onConfirm, onCancel }) {
  const confirmClass = tone === 'danger'
    ? 'border-[rgba(220,38,38,0.24)] bg-[rgba(220,38,38,0.08)] text-[#dc2626] hover:bg-[rgba(220,38,38,0.14)]'
    : 'border-[var(--brand)] bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90'

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(15,23,42,0.36)] px-4">
      <div className="w-full max-w-[420px] rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="text-[18px] font-black text-[var(--text-primary)]">{title}</div>
        <div className="mt-2 text-[13px] leading-6 text-[var(--text-secondary)]">{description}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-[12px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand)]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-[14px] border px-4 py-2 text-[12px] font-semibold transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function LayerPanel({
  open,
  page,
  selectedElementId,
  onSelect,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDelete,
}) {
  const layers = useMemo(() => {
    if (!page) return []
    return [...page.elements].sort((left, right) => right.zIndex - left.zIndex)
  }, [page])

  if (!open) return null

  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[14px] font-black text-[var(--text-primary)]">图层窗格</div>
          <div className="text-[11px] text-[var(--text-muted)]">{page?.name ?? '当前画布'}</div>
        </div>
        <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)]">
          {layers.length} 层
        </span>
      </div>

      <div className="space-y-2">
        {layers.length ? (
          layers.map((layer) => {
            const isActive = layer.id === selectedElementId
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => onSelect(layer.id, null)}
                className={`w-full rounded-[16px] border px-3 py-3 text-left transition ${
                  isActive
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-black text-[var(--text-primary)]">
                      {layer.name}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      {layer.type} · z{layer.zIndex}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onBringToFront(layer.id)
                      }}
                      className="rounded-[10px] border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--brand)]"
                    >
                      顶
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSendToBack(layer.id)
                      }}
                      className="rounded-[10px] border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--brand)]"
                    >
                      底
                    </button>
                  </div>
                </div>

                {isActive ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onBringForward(layer.id)
                      }}
                      className="rounded-[10px] border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--brand)]"
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSendBackward(layer.id)
                      }}
                      className="rounded-[10px] border border-[var(--border)] px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--brand)]"
                    >
                      下移
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(layer.id)
                      }}
                      className="rounded-[10px] border border-[rgba(220,38,38,0.24)] px-2 py-1 text-[10px] font-semibold text-[#dc2626] transition hover:bg-[rgba(220,38,38,0.08)]"
                    >
                      删除
                    </button>
                  </div>
                ) : null}
              </button>
            )
          })
        ) : (
          <div className="rounded-[18px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
            当前画布还没有图层。
          </div>
        )}
      </div>
    </section>
  )
}

function MobileSideSheet({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] bg-[rgba(15,23,42,0.28)] lg:hidden">
      <div className="absolute right-0 top-0 h-full w-full max-w-[360px] bg-[var(--surface-muted)] p-4 shadow-[-16px_0_44px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-black text-[var(--text-primary)]">{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-[var(--brand)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[calc(100%-72px)] min-h-0">{children}</div>
      </div>
    </div>
  )
}

export default function PptCanvasStudio() {
  const initialDocument = useMemo(() => loadStudioDocument(), [])
  const [documentState, setDocumentState] = useState(initialDocument)
  const [mode, setMode] = useState(initialDocument.documentMeta.mode ?? 'edit')
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [selectedChildKey, setSelectedChildKey] = useState(null)
  const [history, setHistory] = useState(() => createHistoryBundle(initialDocument))
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showLayers, setShowLayers] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  const [showMobileProperties, setShowMobileProperties] = useState(false)
  const [showMobileLibrary, setShowMobileLibrary] = useState(false)
  const [confirmState, setConfirmState] = useState(null)
  const liveDocumentRef = useRef(documentState)
  const historyIndexRef = useRef(0)

  useEffect(() => {
    liveDocumentRef.current = documentState
  }, [documentState])

  useEffect(() => {
    historyIndexRef.current = historyIndex
  }, [historyIndex])

  const activePage = useMemo(() => getActivePage(documentState), [documentState])
  const selectedElement = useMemo(
    () => cloneSelection(activePage, selectedElementId),
    [activePage, selectedElementId]
  )

  const setDocumentWithoutHistory = (nextDocument) => {
    const normalized = cloneStudioDocument(nextDocument)
    normalized.documentMeta.mode = mode
    setDocumentState(normalized)
    liveDocumentRef.current = normalized
  }

  const commitStudioState = (nextDocument, options = {}) => {
    const source = options.fromLiveDocument
      ? cloneStudioDocument(liveDocumentRef.current)
      : cloneStudioDocument(nextDocument)

    source.documentMeta.mode = mode
    setDocumentState(source)
    liveDocumentRef.current = source

    if (!options.recordHistory) {
      return
    }

    const targetIndex = historyIndexRef.current
    setHistory((currentHistory) => {
      const trimmed = currentHistory.slice(0, targetIndex + 1)
      const nextHistory = [...trimmed, cloneStudioDocument(source)]
      if (nextHistory.length > 80) {
        return nextHistory.slice(nextHistory.length - 80)
      }
      return nextHistory
    })
    setHistoryIndex((currentIndex) => {
      const nextIndex = currentIndex + 1
      return nextIndex > 79 ? 79 : nextIndex
    })
  }

  const replaceStudioState = (nextDocument, { resetHistory = false } = {}) => {
    const normalized = cloneStudioDocument(nextDocument)
    normalized.documentMeta.mode = mode
    setDocumentState(normalized)
    liveDocumentRef.current = normalized

    if (resetHistory) {
      setHistory([cloneStudioDocument(normalized)])
      setHistoryIndex(0)
      return
    }

    const targetIndex = historyIndexRef.current
    setHistory((currentHistory) => {
      const trimmed = currentHistory.slice(0, targetIndex + 1)
      const nextHistory = [...trimmed, cloneStudioDocument(normalized)]
      if (nextHistory.length > 80) {
        return nextHistory.slice(nextHistory.length - 80)
      }
      return nextHistory
    })
    setHistoryIndex((currentIndex) => {
      const nextIndex = currentIndex + 1
      return nextIndex > 79 ? 79 : nextIndex
    })
  }

  const updateActivePage = (updater, options = {}) => {
    if (!activePage) return
    const nextDocument = cloneStudioDocument(documentState)
    const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
    if (!page) return
    updater(page, nextDocument)
    page.elements = normalizeElementOrder(page.elements)
    if (options.recordHistory === false) {
      setDocumentWithoutHistory(nextDocument)
      return
    }
    commitStudioState(nextDocument, { recordHistory: true })
  }

  const updateElement = (elementId, updater, { recordHistory = true } = {}) => {
    if (!activePage) return
    const nextDocument = cloneStudioDocument(documentState)
    const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
    const target = page?.elements.find((element) => element.id === elementId)
    if (!target || !page) return
    updater(target, page, nextDocument)
    page.elements = normalizeElementOrder(page.elements)
    if (recordHistory) {
      commitStudioState(nextDocument, { recordHistory: true })
    } else {
      setDocumentWithoutHistory(nextDocument)
    }
  }

  const selectElement = (elementId, childKey = null) => {
    setSelectedElementId(elementId)
    setSelectedChildKey(childKey)
  }

  const clearSelection = () => {
    setSelectedElementId(null)
    setSelectedChildKey(null)
  }

  const saveDraft = () => {
    const nextDocument = cloneStudioDocument(documentState)
    nextDocument.documentMeta.mode = mode
    saveStudioDocument(nextDocument)
  }

  const restoreDefault = () => {
    const nextDocument = createDefaultStudioDocument()
    nextDocument.documentMeta.mode = mode
    replaceStudioState(nextDocument, { resetHistory: true })
    clearSelection()
    saveStudioDocument(nextDocument)
  }

  const confirmClearCanvas = () => {
    if (!activePage) return
    setConfirmState({
      title: '清空当前画布',
      description: `将清空 ${activePage.name} 的所有组件，此操作现在支持撤销。`,
      confirmLabel: '确认清空',
      tone: 'danger',
      onConfirm: () => {
        updateActivePage((page) => {
          page.elements = []
        })
        clearSelection()
        setConfirmState(null)
      },
    })
  }

  const requestDelete = (elementId = selectedElementId) => {
    if (!elementId || !activePage) return
    const target = activePage.elements.find((element) => element.id === elementId)
    if (!target) return
    setConfirmState({
      title: '删除当前组件',
      description: `将删除「${target.name}」，删除后可通过撤销找回。`,
      confirmLabel: '确认删除',
      tone: 'danger',
      onConfirm: () => {
        const nextDocument = cloneStudioDocument(liveDocumentRef.current)
        const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
        if (!page) {
          setConfirmState(null)
          return
        }
        page.elements = normalizeElementOrder(
          page.elements.filter((element) => element.id !== elementId)
        )
        commitStudioState(nextDocument, { recordHistory: true })
        if (selectedElementId === elementId) {
          clearSelection()
        }
        setConfirmState(null)
      },
    })
  }

  const undo = () => {
    if (historyIndex <= 0) return
    const targetIndex = historyIndex - 1
    const snapshot = cloneStudioDocument(history[targetIndex])
    setHistoryIndex(targetIndex)
    setDocumentState(snapshot)
    liveDocumentRef.current = snapshot
    const nextPage = getActivePage(snapshot)
    if (!nextPage?.elements.some((element) => element.id === selectedElementId)) {
      clearSelection()
    }
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const targetIndex = historyIndex + 1
    const snapshot = cloneStudioDocument(history[targetIndex])
    setHistoryIndex(targetIndex)
    setDocumentState(snapshot)
    liveDocumentRef.current = snapshot
    const nextPage = getActivePage(snapshot)
    if (!nextPage?.elements.some((element) => element.id === selectedElementId)) {
      clearSelection()
    }
  }

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setDocumentState((current) => ({
      ...current,
      documentMeta: {
        ...current.documentMeta,
        mode: nextMode,
      },
    }))
  }

  const handleInsertElement = (type, point = null) => {
    if (!activePage) return
    const nextDocument = cloneStudioDocument(documentState)
    const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
    if (!page) return
    const element = insertElementAtCenter(page, type)

    if (point) {
      element.frame.x = Math.round(point.x - element.frame.w / 2)
      element.frame.y = Math.round(point.y - element.frame.h / 2)
    }

    page.elements.push(element)
    page.elements = normalizeElementOrder(page.elements)
    replaceStudioState(nextDocument)
    selectElement(element.id, null)
  }

  const handleDuplicate = (elementId = selectedElementId) => {
    if (!elementId || !activePage) return
    const nextDocument = cloneStudioDocument(documentState)
    const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
    const source = page?.elements.find((element) => element.id === elementId)
    if (!source || !page) return
    const clone = cloneStudioDocument(source)
    clone.id = `${clone.type}-${Math.random().toString(36).slice(2, 10)}`
    clone.name = `${clone.name} 副本`
    clone.frame.x += 24
    clone.frame.y += 24
    clone.zIndex = getNextZIndex(page.elements)
    page.elements.push(clone)
    page.elements = normalizeElementOrder(page.elements)
    replaceStudioState(nextDocument)
    selectElement(clone.id, null)
  }

  const moveLayer = (direction, elementId = selectedElementId) => {
    if (!elementId || !activePage) return

    const nextDocument = cloneStudioDocument(documentState)
    const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
    if (!page) return
    const ordered = [...page.elements].sort((left, right) => left.zIndex - right.zIndex)
    const index = ordered.findIndex((element) => element.id === elementId)
    if (index === -1) return

    const targetIndex = direction === 'forward' ? index + 1 : index - 1
    if (targetIndex < 0 || targetIndex >= ordered.length) return

    const current = ordered[index]
    const target = ordered[targetIndex]
    const currentZ = current.zIndex
    current.zIndex = target.zIndex
    target.zIndex = currentZ
    page.elements = normalizeElementOrder(page.elements)
    replaceStudioState(nextDocument)
    selectElement(elementId, null)
  }

  const moveLayerToEdge = (direction, elementId = selectedElementId) => {
    if (!elementId || !activePage) return
    const nextDocument = cloneStudioDocument(documentState)
    const page = nextDocument.pages.find((item) => item.id === nextDocument.activePageId)
    if (!page) return

    const ordered = [...page.elements].sort((left, right) => left.zIndex - right.zIndex)
    const currentIndex = ordered.findIndex((element) => element.id === elementId)
    if (currentIndex === -1) return

    const [current] = ordered.splice(currentIndex, 1)
    if (direction === 'front') {
      ordered.push(current)
    } else {
      ordered.unshift(current)
    }

    page.elements = ordered.map((element, index) => ({
      ...element,
      zIndex: index + 1,
    }))
    replaceStudioState(nextDocument)
    selectElement(elementId, null)
  }

  const handleFrameChange = (key, value) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      target.frame[key] = key === 'w' || key === 'h'
        ? clampSize(value, target.frame[key])
        : normalizeNumber(value, target.frame[key])
    })
  }

  const handleStyleChange = (key, value) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      target.style[key] = typeof value === 'number'
        ? normalizeNumber(value, target.style[key])
        : value
    })
  }

  const handleDataFieldChange = (key, value, options = {}) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      if (options.target === 'meta') {
        target[key] = value
      } else {
        target.data[key] = value
      }
    })
  }

  const handleSeriesChange = (rowIndex, pointIndex, value) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      if (target.type === 'growthChart') {
        target.data.series[rowIndex].values[pointIndex] = normalizeNumber(value, 0)
      }
      if (target.type === 'radarChart') {
        target.data.metrics[rowIndex][pointIndex] = normalizeNumber(value, 0)
      }
      if (target.type === 'barChart') {
        target.data.groups[rowIndex].values[pointIndex] = normalizeNumber(value, 0)
      }
    })
  }

  const handleCategoryChange = (index, value) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      if (target.type === 'barChart') {
        target.data.categories[index] = value
      }
      if (target.type === 'dataTable') {
        target.data.rows[index] = value.split('|').map((item) => item.trim())
      }
    })
  }

  const handleLegendChange = (index, value) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      if (target.type === 'barChart') {
        target.data.legends[index] = value
      }
    })
  }

  const handleSubLayoutChange = (childKey, field, value) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, (target) => {
      if (!target.subLayout?.[childKey]) return
      target.subLayout[childKey][field] = value
    })
  }

  const handleDocumentChange = (nextPage, options = {}) => {
    if (!activePage || !nextPage) return

    const nextDocument = cloneStudioDocument(liveDocumentRef.current)
    const pageIndex = nextDocument.pages.findIndex((page) => page.id === nextDocument.activePageId)
    if (pageIndex === -1) return

    nextDocument.pages[pageIndex] = {
      ...cloneStudioDocument(nextPage),
      id: activePage.id,
      name: activePage.name,
      elements: normalizeElementOrder(nextPage.elements ?? []),
    }

    if (options.recordHistory) {
      commitStudioState(nextDocument, options)
      return
    }
    setDocumentWithoutHistory(nextDocument)
  }

  const switchPage = (pageId) => {
    if (pageId === documentState.activePageId) return
    const nextDocument = cloneStudioDocument(documentState)
    nextDocument.activePageId = pageId
    setDocumentWithoutHistory(nextDocument)
    clearSelection()
  }

  const addPage = () => {
    const nextDocument = cloneStudioDocument(documentState)
    const page = createEmptyStudioPage(createEmptyPageName(nextDocument.pages))
    nextDocument.pages.push(page)
    nextDocument.activePageId = page.id
    replaceStudioState(nextDocument)
    clearSelection()
  }

  useEffect(() => {
    saveStudioDocument({
      ...documentState,
      documentMeta: {
        ...documentState.documentMeta,
        mode,
      },
    })
  }, [documentState, mode])

  const rightColumn = (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <LayerPanel
        open={showLayers}
        page={activePage}
        selectedElementId={selectedElementId}
        onSelect={selectElement}
        onBringForward={(elementId) => moveLayer('forward', elementId)}
        onSendBackward={(elementId) => moveLayer('backward', elementId)}
        onBringToFront={(elementId) => moveLayerToEdge('front', elementId)}
        onSendToBack={(elementId) => moveLayerToEdge('back', elementId)}
        onDelete={requestDelete}
      />

      {showProperties ? (
        <div className="min-h-0 flex-1">
          <PropertiesPanel
            element={selectedElement}
            selectedChildKey={selectedChildKey}
            onFrameChange={handleFrameChange}
            onStyleChange={handleStyleChange}
            onDataFieldChange={handleDataFieldChange}
            onSeriesChange={handleSeriesChange}
            onCategoryChange={handleCategoryChange}
            onLegendChange={handleLegendChange}
            onSubLayoutChange={handleSubLayoutChange}
            className="h-full"
          />
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="animate-fade-in space-y-5">
      <StudioToolbar
        mode={mode}
        onModeChange={handleModeChange}
        onSave={saveDraft}
        onReset={restoreDefault}
        onClear={confirmClearCanvas}
        onUndo={undo}
        onRedo={redo}
        onDuplicate={() => handleDuplicate()}
        onDelete={() => requestDelete()}
        onBringForward={() => moveLayer('forward')}
        onSendBackward={() => moveLayer('backward')}
        onBringToFront={() => moveLayerToEdge('front')}
        onSendToBack={() => moveLayerToEdge('back')}
        onToggleLayers={() => setShowLayers((current) => !current)}
        onToggleProperties={() => setShowProperties((current) => !current)}
        showLayers={showLayers}
        showProperties={showProperties}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasSelection={Boolean(selectedElementId)}
      />

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-2">
          {documentState.pages.map((page, index) => {
            const active = page.id === documentState.activePageId
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => switchPage(page.id)}
                className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[12px] font-semibold transition ${
                  active
                    ? 'border-[var(--brand)] bg-[var(--brand)]/12 text-[var(--brand)]'
                    : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--brand)]/40'
                }`}
              >
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                  {index + 1}
                </span>
                {page.name}
              </button>
            )
          })}

          <button
            type="button"
            onClick={addPage}
            className="inline-flex items-center gap-2 rounded-[14px] border border-dashed border-[var(--brand)]/38 bg-[var(--brand)]/6 px-3 py-2 text-[12px] font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
          >
            <Plus className="h-4 w-4" />
            新建画布
          </button>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setShowLayers((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[12px] font-semibold transition ${
                showLayers
                  ? 'border-[var(--brand)] bg-[var(--brand)]/12 text-[var(--brand)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Layers className="h-4 w-4" />
              图层
            </button>
            <button
              type="button"
              onClick={() => setShowProperties((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[12px] font-semibold transition ${
                showProperties
                  ? 'border-[var(--brand)] bg-[var(--brand)]/12 text-[var(--brand)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
              }`}
            >
              <PanelRight className="h-4 w-4" />
              属性
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileLibrary(true)}
          className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[12px] font-semibold text-[var(--text-primary)] shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
        >
          <Plus className="h-4 w-4 text-[var(--brand)]" />
          素材库
        </button>
        <button
          type="button"
          onClick={() => setShowMobileProperties(true)}
          className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[12px] font-semibold text-[var(--text-primary)] shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
        >
          <PanelRight className="h-4 w-4 text-[var(--brand)]" />
          属性 / 图层
        </button>
      </div>

      <div className="hidden lg:grid lg:h-[calc(100vh-320px)] lg:min-h-[680px] lg:grid-cols-[220px_minmax(0,1fr)_320px] lg:gap-4">
        <div className="min-h-0">
          <AssetLibraryPanel groups={STUDIO_ASSET_LIBRARY} onInsert={handleInsertElement} className="h-full" />
        </div>

        <div className="min-h-0">
          <StudioCanvas
            document={activePage}
            pageName={activePage?.name}
            pageIndex={documentState.pages.findIndex((page) => page.id === documentState.activePageId)}
            pageCount={documentState.pages.length}
            mode={mode}
            selectedElementId={selectedElementId}
            selectedChildKey={selectedChildKey}
            onSelect={selectElement}
            onDocumentChange={handleDocumentChange}
            onInsertElement={handleInsertElement}
            onDuplicate={handleDuplicate}
            onDelete={requestDelete}
            className="h-full"
          />
        </div>

        <div className="min-h-0">{rightColumn}</div>
      </div>

      <div className="lg:hidden">
        <StudioCanvas
          document={activePage}
          pageName={activePage?.name}
          pageIndex={documentState.pages.findIndex((page) => page.id === documentState.activePageId)}
          pageCount={documentState.pages.length}
          mode={mode}
          selectedElementId={selectedElementId}
          selectedChildKey={selectedChildKey}
          onSelect={selectElement}
          onDocumentChange={handleDocumentChange}
          onInsertElement={handleInsertElement}
          onDuplicate={handleDuplicate}
          onDelete={requestDelete}
        />
      </div>

      <MobileSideSheet
        open={showMobileLibrary}
        title="素材库"
        onClose={() => setShowMobileLibrary(false)}
      >
        <AssetLibraryPanel
          groups={STUDIO_ASSET_LIBRARY}
          onInsert={(type, point) => {
            handleInsertElement(type, point)
            setShowMobileLibrary(false)
          }}
          className="h-full"
        />
      </MobileSideSheet>

      <MobileSideSheet
        open={showMobileProperties}
        title="属性 / 图层"
        onClose={() => setShowMobileProperties(false)}
      >
        <div className="flex h-full min-h-0 flex-col gap-4">
          <LayerPanel
            open
            page={activePage}
            selectedElementId={selectedElementId}
            onSelect={selectElement}
            onBringForward={(elementId) => moveLayer('forward', elementId)}
            onSendBackward={(elementId) => moveLayer('backward', elementId)}
            onBringToFront={(elementId) => moveLayerToEdge('front', elementId)}
            onSendToBack={(elementId) => moveLayerToEdge('back', elementId)}
            onDelete={requestDelete}
          />
          <div className="min-h-0 flex-1">
            <PropertiesPanel
              element={selectedElement}
              selectedChildKey={selectedChildKey}
              onFrameChange={handleFrameChange}
              onStyleChange={handleStyleChange}
              onDataFieldChange={handleDataFieldChange}
              onSeriesChange={handleSeriesChange}
              onCategoryChange={handleCategoryChange}
              onLegendChange={handleLegendChange}
              onSubLayoutChange={handleSubLayoutChange}
              className="h-full"
            />
          </div>
        </div>
      </MobileSideSheet>

      {confirmState ? (
        <Dialog
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          tone={confirmState.tone}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      ) : null}
    </div>
  )
}
