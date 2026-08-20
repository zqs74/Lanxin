/**
 * 应急模块左侧 200px 分类导航 + 关键词搜索
 * @param {Object} props
 * @param {string|null} props.category - 当前选中类 ('全部'|'医疗'|'安保'|'消防'|'天气'|'设备故障')
 * @param {(cat:string|null)=>void} props.setCategory
 * @param {string} props.keyword
 * @param {(kw:string)=>void} props.setKeyword
 * @param {Object} props.counts - {全部:N, 医疗:N, 安保:N, 消防:N, 天气:N, 设备故障:N}
 */
import { Search, ShieldAlert, Heart, Shield, Flame, CloudRain, Cpu } from 'lucide-react'
import StatusPill from './StatusPill.jsx'

const CATEGORIES = [
  { key: null, name: '全部', icon: ShieldAlert, iconColor: 'var(--brand)' },
  { key: '医疗', name: '医疗', icon: Heart, iconColor: 'var(--danger)' },
  { key: '安保', name: '安保', icon: Shield, iconColor: 'var(--brand)' },
  { key: '消防', name: '消防', icon: Flame, iconColor: 'var(--warn)' },
  { key: '天气', name: '天气', icon: CloudRain, iconColor: 'var(--info)' },
  { key: '设备故障', name: '设备故障', icon: Cpu, iconColor: 'var(--purple)' }
]

export default function EmergencySidebar({ category, setCategory, keyword, setKeyword, counts }) {
  const handleKeyDown = (e, cat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setCategory(cat)
    }
  }

  return (
    <aside
      className="w-[200px] shrink-0 card-base card-solid p-3 h-fit sticky top-0 rounded-xl"
      aria-label="应急预案分类导航"
    >
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜预案/触发条件/联系人"
          className="input-base w-full pl-9 pr-3 py-2 rounded-lg text-sm"
          aria-label="搜索应急预案"
        />
      </div>

      <h3 className="text-sm font-semibold mb-2 text-[var(--text-primary)]">分类导航</h3>

      <nav role="listbox" aria-label="应急预案分类列表">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.key
          const IconNode = cat.icon
          return (
            <div
              key={cat.name}
              role="button"
              tabIndex={0}
              aria-selected={isSelected}
              onClick={() => setCategory(cat.key)}
              onKeyDown={(e) => handleKeyDown(e, cat.key)}
              className={[
                'flex justify-between items-center px-2.5 py-2 rounded-lg mb-1 cursor-pointer transition-all duration-200',
                isSelected
                  ? 'bg-[var(--brand)] text-[var(--text-primary)] font-medium'
                  : 'hover:bg-[var(--brand)]/10 text-[var(--text-secondary)]'
              ].join(' ')}
            >
              <span className="flex items-center gap-2 min-w-0">
                {IconNode && (
                  <IconNode
                    className="w-4 h-4 shrink-0"
                    style={{ color: isSelected ? 'var(--text-primary)' : cat.iconColor }}
                    aria-hidden="true"
                  />
                )}
                <span className="text-sm truncate">{cat.name}</span>
              </span>
              <span className="text-xs ml-1 shrink-0">
                ({counts[cat.name] ?? 0})
              </span>
            </div>
          )
        })}
      </nav>

      <div
        className="mt-4 p-2.5 rounded-lg"
        style={{ backgroundColor: 'var(--surface-muted)' }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--text-muted)]">待响应高危事件</span>
        </div>
        <StatusPill variant="warn">2 条待处置</StatusPill>
      </div>
    </aside>
  )
}
