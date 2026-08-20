import React from 'react'
import { LayoutTemplate, Plus } from 'lucide-react'

export default function AssetLibraryPanel({ groups, onInsert, className = '' }) {
  return (
    <aside
      className={`flex h-full min-h-0 flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_36px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <LayoutTemplate className="h-4 w-4 text-[var(--brand)]" />
        <div>
          <div className="text-[14px] font-black text-[var(--text-primary)]">素材库</div>
          <div className="text-[11px] text-[var(--text-muted)]">点击或拖入到画布中心</div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 scrollbar-custom">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="px-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {group.title}
            </div>
            <div className="mt-2 grid gap-2">
              {group.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/studio-element', item.type)
                  }}
                  onClick={() => onInsert(item.type)}
                  className="group rounded-[18px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,246,242,0.96))] p-3 text-left transition hover:border-[var(--brand)] hover:shadow-[0_12px_22px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-black text-[var(--text-primary)]">{item.label}</div>
                      <div className="mt-1 text-[11px] text-[var(--text-muted)]">{item.description}</div>
                    </div>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/85 text-[var(--brand)] transition group-hover:border-[var(--brand)]">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
