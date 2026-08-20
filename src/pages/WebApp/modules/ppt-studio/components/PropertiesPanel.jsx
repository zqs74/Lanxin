import React from 'react'
import { Palette, Settings2, SlidersHorizontal } from 'lucide-react'

function PanelSection({ icon: SectionIcon, title, children }) {
  const iconNode = React.createElement(SectionIcon, {
    className: 'h-4 w-4 text-[var(--brand)]',
  })

  return (
    <section className="rounded-[20px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,246,242,0.96))] p-3">
      <div className="mb-3 flex items-center gap-2">
        {iconNode}
        <div className="text-[13px] font-black text-[var(--text-primary)]">{title}</div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  )
}

function Input({ value, onChange, type = 'text', min, max, step }) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
    />
  )
}

function TextArea({ value, onChange, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      className="w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
    />
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="h-10 w-12 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-1"
        />
        <Input value={value} onChange={onChange} />
      </div>
    </Field>
  )
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <span className="text-[12px] font-medium text-[var(--text-primary)]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[var(--brand)]' : 'bg-[var(--surface-muted)]'}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </label>
  )
}

function GenericRows({ fields, value, onChange }) {
  return (
    <div className="grid gap-3">
      {fields.map((field) => {
        if (field.kind === 'number') {
          return (
            <Field key={field.key} label={field.label}>
              <Input
                type="number"
                value={value[field.key] ?? ''}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                onChange={(event) => onChange(field.key, Number(event.target.value))}
              />
            </Field>
          )
        }

        if (field.kind === 'textarea') {
          return (
            <Field key={field.key} label={field.label}>
              <TextArea value={value[field.key] ?? ''} onChange={(event) => onChange(field.key, event.target.value)} />
            </Field>
          )
        }

        return (
          <Field key={field.key} label={field.label}>
            <Input value={value[field.key] ?? ''} onChange={(event) => onChange(field.key, event.target.value)} />
          </Field>
        )
      })}
    </div>
  )
}

const DATA_FIELDS = {
  playerCard: [
    { key: 'name', label: '姓名' },
    { key: 'number', label: '号码' },
    { key: 'role', label: '位置' },
    { key: 'team', label: '球队' },
    { key: 'footerTag', label: '底部标签' },
    { key: 'photoUrl', label: '照片链接' },
  ],
  titleText: [{ key: 'text', label: '文本内容', kind: 'textarea' }],
  bodyText: [{ key: 'text', label: '文本内容', kind: 'textarea' }],
  badge: [{ key: 'text', label: '文本内容' }],
  imageFrame: [
    { key: 'caption', label: '说明文字' },
    { key: 'imageUrl', label: '图片链接' },
  ],
}

function ChartSeriesEditor({ element, onSeriesChange, onCategoryChange }) {
  if (element.type === 'growthChart') {
    return (
      <div className="space-y-3">
        {element.data.series.map((series, seriesIndex) => (
          <div key={series.name} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
            <div className="text-[12px] font-bold text-[var(--text-primary)]">{series.name}</div>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {series.values.map((value, valueIndex) => (
                <Input
                  key={`${series.name}-${valueIndex}`}
                  type="number"
                  value={value}
                  onChange={(event) => onSeriesChange(seriesIndex, valueIndex, Number(event.target.value))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (element.type === 'radarChart') {
    return (
      <div className="space-y-3">
        {element.data.metrics.map((metric, metricIndex) => (
          <div key={metric.label} className="grid grid-cols-[1fr_78px_78px] items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
            <div className="text-[12px] font-bold text-[var(--text-primary)]">{metric.label}</div>
            <Input
              type="number"
              value={metric.previous}
              onChange={(event) => onSeriesChange(metricIndex, 'previous', Number(event.target.value))}
            />
            <Input
              type="number"
              value={metric.current}
              onChange={(event) => onSeriesChange(metricIndex, 'current', Number(event.target.value))}
            />
          </div>
        ))}
      </div>
    )
  }

  if (element.type === 'barChart') {
    return (
      <div className="space-y-3">
        {element.data.groups.map((group, groupIndex) => (
          <div key={group.label} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
            <div className="text-[12px] font-bold text-[var(--text-primary)]">{group.label}</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {group.values.map((value, valueIndex) => (
                <Input
                  key={`${group.label}-${valueIndex}`}
                  type="number"
                  value={value}
                  step="0.1"
                  onChange={(event) => onSeriesChange(groupIndex, valueIndex, Number(event.target.value))}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2">
          {element.data.categories.map((label, index) => (
            <Input key={label} value={label} onChange={(event) => onCategoryChange(index, event.target.value)} />
          ))}
        </div>
      </div>
    )
  }

  if (element.type === 'dataTable') {
    return (
      <div className="space-y-2">
        {element.data.rows.map((row, rowIndex) => (
          <TextArea
            key={`row-${rowIndex}`}
            rows={2}
            value={row.join(' | ')}
            onChange={(event) => onCategoryChange(rowIndex, event.target.value)}
          />
        ))}
      </div>
    )
  }

  return null
}

export default function PropertiesPanel({
  element,
  selectedChildKey,
  onFrameChange,
  onStyleChange,
  onDataFieldChange,
  onSeriesChange,
  onCategoryChange,
  onLegendChange,
  onSubLayoutChange,
  className = '',
}) {
  if (!element) {
    return (
      <aside
        className={`flex h-full min-h-0 flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)] ${className}`}
      >
        <div className="text-[14px] font-black text-[var(--text-primary)]">属性面板</div>
        <div className="mt-3 flex-1 rounded-[18px] border border-dashed border-[var(--border)] px-4 py-10 text-center text-[12px] text-[var(--text-muted)]">
          选中画布中的组件后，在这里修改尺寸、配色、文案和数据。
        </div>
      </aside>
    )
  }

  const currentSubLayout = selectedChildKey ? element.subLayout?.[selectedChildKey] : null
  const genericFields = DATA_FIELDS[element.type] ?? []

  return (
    <aside
      className={`flex h-full min-h-0 flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div>
        <div className="text-[14px] font-black text-[var(--text-primary)]">属性面板</div>
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">{element.name} · {element.type}</div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto scrollbar-custom">
        <PanelSection icon={Settings2} title="通用属性">
          <Field label="名称">
            <Input value={element.name} onChange={(event) => onDataFieldChange('name', event.target.value, { target: 'meta' })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="X">
              <Input type="number" value={element.frame.x} onChange={(event) => onFrameChange('x', Number(event.target.value))} />
            </Field>
            <Field label="Y">
              <Input type="number" value={element.frame.y} onChange={(event) => onFrameChange('y', Number(event.target.value))} />
            </Field>
            <Field label="宽度">
              <Input type="number" value={element.frame.w} onChange={(event) => onFrameChange('w', Number(event.target.value))} />
            </Field>
            <Field label="高度">
              <Input type="number" value={element.frame.h} onChange={(event) => onFrameChange('h', Number(event.target.value))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="圆角">
              <Input type="number" value={element.style.radius ?? 0} onChange={(event) => onStyleChange('radius', Number(event.target.value))} />
            </Field>
            <Field label="边框宽">
              <Input type="number" value={element.style.borderWidth ?? 0} onChange={(event) => onStyleChange('borderWidth', Number(event.target.value))} />
            </Field>
          </div>
          <Field label="透明度">
            <Input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={element.style.opacity ?? 1}
              onChange={(event) => onStyleChange('opacity', Number(event.target.value))}
            />
          </Field>
        </PanelSection>

        <PanelSection icon={Palette} title="颜色属性">
          <ColorField label="背景色" value={element.style.background ?? '#ffffff'} onChange={(event) => onStyleChange('background', event.target.value)} />
          <ColorField label="边框色" value={element.style.borderColor ?? '#cbd5e1'} onChange={(event) => onStyleChange('borderColor', event.target.value)} />
          <ColorField label="主文字色" value={element.style.textColor ?? '#1f2937'} onChange={(event) => onStyleChange('textColor', event.target.value)} />
          {element.style.accentColor ? (
            <ColorField label="主强调色" value={element.style.accentColor} onChange={(event) => onStyleChange('accentColor', event.target.value)} />
          ) : null}
          {element.style.secondaryColor ? (
            <ColorField label="辅色" value={element.style.secondaryColor} onChange={(event) => onStyleChange('secondaryColor', event.target.value)} />
          ) : null}
          {element.style.gridColor ? (
            <ColorField label="网格色" value={element.style.gridColor} onChange={(event) => onStyleChange('gridColor', event.target.value)} />
          ) : null}
        </PanelSection>

        {genericFields.length ? (
          <PanelSection icon={SlidersHorizontal} title="数据 / 文案">
            <GenericRows fields={genericFields} value={element.data} onChange={(key, nextValue) => onDataFieldChange(key, nextValue)} />
          </PanelSection>
        ) : null}

        {['growthChart', 'radarChart', 'barChart', 'dataTable'].includes(element.type) ? (
          <PanelSection icon={SlidersHorizontal} title="图表数据">
            <ChartSeriesEditor
              element={element}
              onSeriesChange={onSeriesChange}
              onCategoryChange={onCategoryChange}
              onLegendChange={onLegendChange}
            />
          </PanelSection>
        ) : null}

        {currentSubLayout ? (
          <PanelSection icon={SlidersHorizontal} title={`子元素 · ${selectedChildKey}`}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="偏移 X">
                <Input
                  type="number"
                  value={currentSubLayout.x ?? 0}
                  onChange={(event) => onSubLayoutChange(selectedChildKey, 'x', Number(event.target.value))}
                />
              </Field>
              <Field label="偏移 Y">
                <Input
                  type="number"
                  value={currentSubLayout.y ?? 0}
                  onChange={(event) => onSubLayoutChange(selectedChildKey, 'y', Number(event.target.value))}
                />
              </Field>
            </div>
            {'fontSize' in currentSubLayout ? (
              <Field label="字号">
                <Input
                  type="number"
                  value={currentSubLayout.fontSize ?? 14}
                  onChange={(event) => onSubLayoutChange(selectedChildKey, 'fontSize', Number(event.target.value))}
                />
              </Field>
            ) : null}
            {'color' in currentSubLayout ? (
              <ColorField
                label="颜色"
                value={currentSubLayout.color ?? '#1f2937'}
                onChange={(event) => onSubLayoutChange(selectedChildKey, 'color', event.target.value)}
              />
            ) : null}
            <ToggleField
              label="显示"
              checked={currentSubLayout.visible !== false}
              onChange={(value) => onSubLayoutChange(selectedChildKey, 'visible', value)}
            />
          </PanelSection>
        ) : null}
      </div>
    </aside>
  )
}
