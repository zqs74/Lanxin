import React from 'react'
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Eye,
  Grip,
  Layers,
  PanelRight,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
} from 'lucide-react'

function ToolbarButton({
  icon: ButtonIcon,
  label,
  onClick,
  disabled = false,
  active = false,
  tone = 'default',
}) {
  const iconNode = React.createElement(ButtonIcon, {
    className: 'h-4 w-4',
  })

  const toneClass = {
    default:
      'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
    accent:
      'border-[var(--brand)] bg-[var(--brand)]/12 text-[var(--brand)] hover:bg-[var(--brand)]/16',
    danger:
      'border-[rgba(220,38,38,0.24)] bg-[rgba(220,38,38,0.08)] text-[#dc2626] hover:bg-[rgba(220,38,38,0.12)]',
  }[tone]

  const activeClass = active
    ? 'border-[var(--brand)] bg-[var(--brand)]/14 text-[var(--brand)]'
    : toneClass

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[12px] font-semibold transition ${activeClass} ${
        disabled ? 'cursor-not-allowed opacity-45' : ''
      }`}
    >
      {iconNode}
      {label}
    </button>
  )
}

export default function StudioToolbar({
  mode,
  onModeChange,
  onSave,
  onReset,
  onClear,
  onUndo,
  onRedo,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleLayers,
  onToggleProperties,
  showLayers,
  showProperties,
  canUndo,
  canRedo,
  hasSelection,
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,246,242,0.94))] px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[26px] font-black tracking-tight text-[var(--text-primary)]">
              PPT 内容绘制区
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-secondary)]">
              多画布本地草稿
            </div>
          </div>

          <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-muted)]/60 p-1">
            {[
              { key: 'edit', label: '编辑模式', icon: Grip },
              { key: 'preview', label: '预览模式', icon: Eye },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onModeChange(item.key)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold transition ${
                  mode === item.key
                    ? 'bg-[var(--brand)] text-white shadow-[0_10px_18px_rgba(15,23,42,0.16)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton icon={Save} label="保存草稿" onClick={onSave} tone="accent" />
          <ToolbarButton icon={RotateCcw} label="恢复默认" onClick={onReset} />
          <ToolbarButton icon={Trash2} label="清空画布" onClick={onClear} tone="danger" />
          <ToolbarButton icon={RotateCcw} label="撤销" onClick={onUndo} disabled={!canUndo} />
          <ToolbarButton icon={RotateCw} label="重做" onClick={onRedo} disabled={!canRedo} />
          <ToolbarButton icon={Copy} label="复制组件" onClick={onDuplicate} disabled={!hasSelection} />
          <ToolbarButton
            icon={Trash2}
            label="删除组件"
            onClick={onDelete}
            disabled={!hasSelection}
            tone="danger"
          />
          <ToolbarButton
            icon={Layers}
            label="上移一层"
            onClick={onBringForward}
            disabled={!hasSelection}
          />
          <ToolbarButton
            icon={Layers}
            label="下移一层"
            onClick={onSendBackward}
            disabled={!hasSelection}
          />
          <ToolbarButton
            icon={ArrowUpToLine}
            label="置于顶层"
            onClick={onBringToFront}
            disabled={!hasSelection}
          />
          <ToolbarButton
            icon={ArrowDownToLine}
            label="置于底层"
            onClick={onSendToBack}
            disabled={!hasSelection}
          />
          <ToolbarButton
            icon={Layers}
            label="图层窗格"
            onClick={onToggleLayers}
            active={showLayers}
          />
          <ToolbarButton
            icon={PanelRight}
            label="属性面板"
            onClick={onToggleProperties}
            active={showProperties}
          />
        </div>
      </div>
    </div>
  )
}
