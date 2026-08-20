/**
 * 应急预案详情页主模块
 */
import { useState, useMemo } from 'react'
import { useEmergencyMock } from '../hooks/useMockApi.js'
import EmergencySidebar from '../components/EmergencySidebar.jsx'
import EmergencyCard from '../components/EmergencyCard.jsx'
import EmergencyFlow from '../components/EmergencyFlow.jsx'
import DetailDrawer from '../components/DetailDrawer.jsx'
import StatusPill from '../components/StatusPill.jsx'

export default function EmergencyPlan() {
  const [category, setCategory] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [drillModeOn, setDrillModeOn] = useState(false)
  const [doneMap, setDoneMap] = useState(() => new Map())

  const { plans, incidents } = useEmergencyMock({
    category: category || undefined,
    keyword: keyword.trim() || undefined
  })

  const counts = useMemo(() => {
    const c = { 全部: plans.length, 医疗: 0, 安保: 0, 消防: 0, 天气: 0, 设备故障: 0 }
    for (const p of plans) {
      if (c[p.category] !== undefined) c[p.category]++
    }
    return c
  }, [plans])

  const filteredPlans = useMemo(() => {
    let list = [...plans]
    if (category != null) list = list.filter((p) => p.category === category)
    const kw = keyword.trim().toLowerCase()
    if (kw) {
      list = list.filter((p) => {
        if (p.title.toLowerCase().includes(kw)) return true
        if (p.triggerCondition.toLowerCase().includes(kw)) return true
        if (Array.isArray(p.contacts)) {
          for (const c of p.contacts) {
            if (c.name && c.name.toLowerCase().includes(kw)) return true
          }
        }
        return false
      })
    }
    return list
  }, [plans, category, keyword])

  const severityCounts = useMemo(() => {
    return {
      high: plans.filter((p) => p.severity === 'high').length,
      medium: plans.filter((p) => p.severity === 'medium').length,
      low: plans.filter((p) => p.severity === 'low').length
    }
  }, [plans])

  const toggleStep = (stepId, done) => {
    if (!selectedPlan) return
    setDoneMap((prev) => {
      const next = new Map(prev)
      next.set(`${selectedPlan.id}:${stepId}`, done)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2 px-1"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            🛡️ 应急预案中心
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            CBA 场馆五库联动 · {plans.length}+ 标准处置流程
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill variant="danger">高危 {severityCounts.high}</StatusPill>
          <StatusPill variant="warn">中危 {severityCounts.medium}</StatusPill>
          <StatusPill variant="info">低危 {severityCounts.low}</StatusPill>
          <span
            className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border"
            style={{
              backgroundColor: 'var(--surface-muted)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            历史事件 {incidents.length} 条
          </span>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <EmergencySidebar
          category={category}
          setCategory={setCategory}
          keyword={keyword}
          setKeyword={setKeyword}
          counts={counts}
        />

        <div className="flex-1 min-w-0">
          {filteredPlans.length === 0 ? (
            <div className="card-base card-solid p-10 rounded-xl text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-[var(--text-muted)]">当前条件无预案</p>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gridAutoRows: '1fr'
              }}
            >
              {filteredPlans.map((plan) => (
                <EmergencyCard
                  key={plan.id}
                  plan={plan}
                  onClick={() => setSelectedPlan(plan)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DetailDrawer
        open={selectedPlan != null}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan?.title ?? ''}
      >
        {selectedPlan && (
          <EmergencyFlow
            plan={selectedPlan}
            doneMap={doneMap}
            toggleStep={toggleStep}
            drillModeOn={drillModeOn}
            setDrillModeOn={setDrillModeOn}
          />
        )}
      </DetailDrawer>
    </div>
  )
}
