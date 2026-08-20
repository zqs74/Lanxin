/**
 * 通用右侧抽屉：从右滑入，遮罩半透明
 * @param {Object} props
 * @param {boolean} props.open
 * @param {()=>void} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 */
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function DetailDrawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: 'drawer-fade-in 220ms ease-out both' }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed top-0 right-0 bottom-0 w-[480px] max-w-[92vw] z-50 flex flex-col"
        style={{
          backgroundColor: 'var(--surface)',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
          animation: 'drawer-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1) both'
        }}
      >
        <header
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-bold text-[var(--text-primary)] truncate pr-3">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-[var(--brand)]/10 text-[var(--text-secondary)] hover:text-[var(--brand)]"
            aria-label="关闭"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>
        <div
          className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-custom"
          style={{ scrollbarWidth: 'thin' }}
        >
          {children}
        </div>
      </aside>
      <style>{`
        @keyframes drawer-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
