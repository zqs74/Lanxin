import { useMemo } from 'react'
import { TOURNAMENTS, TEAMS, VENUES, MATCHES } from '../data/scheduleMock.js'
import { RESOURCE_CATEGORIES, RESOURCES, ALLOCATIONS } from '../data/resourceUsageMock.js'
import { EMERGENCY_PLANS, INCIDENTS, LOGS } from '../data/emergencyMock.js'
import { VENUE_ROWS, HR_ROWS, ACTIVITY_TYPES, SCHEDULE_ITEMS, CONFLICTS } from '../data/visualScheduleMock.js'
import { VIDEO_BASIC, KPI_DATA, TREND_7DAY, TREND_30DAY, USER_DEMOGRAPHICS, AI_SUGGESTIONS, BRAND_INFO, BRAND_KPI, REVENUE_15DAY, ANNUAL_REVENUE, FINANCIAL_BRIEF, MARKETING_OVERVIEW_KPI, GROWTH_30DAY_TRACK, CHANNEL_REVENUE_MONTHLY, CHANNEL_ROI, TOP_CAMPAIGNS } from '../data/marketingMock.js'
import { ANALYSIS_REPORT } from '../data/analysisReportMock.js'
import { JOINT_ANGLE_DATA } from '../data/biomechanicsMock.js'
import { DATABASES, TOURNAMENTS as MATCHING_TOURNAMENTS, REQUIREMENT_TEMPLATE, MATCH_PROGRESS, MATCH_RESULTS, CONFLICTS as MATCHING_CONFLICTS, MATCH_STATS, EVENT_INFO, OUTPUT_SUMMARY, CATEGORY_SUMMARY, COST_BREAKDOWN, TIMELINE } from '../data/resourceMatchingMock.js'

/**
 * 赛制与赛程 Mock 钩子（未来替换真实 API）
 * @param {Object} [filter]
 * @param {string} [filter.tournamentId]
 * @param {string} [filter.status]
 * @returns {{ tournaments, teams, venues, matches, filteredMatches }}
 */
// TODO: 未来替换为 fetch('/api/v1/webapp/schedule?tournamentId=...')
export function useScheduleMock(filter = {}) {
  const filteredMatches = useMemo(() => {
    let list = [...MATCHES]
    if (filter.tournamentId) list = list.filter(m => m.tournamentId === filter.tournamentId)
    if (filter.status)       list = list.filter(m => m.status === filter.status)
    return list
  }, [filter.tournamentId, filter.status])
  return { tournaments: TOURNAMENTS, teams: TEAMS, venues: VENUES, matches: MATCHES, filteredMatches }
}

/**
 * 资源使用清单 Mock 钩子（未来替换真实 API）
 */
// TODO: 未来替换为 fetch('/api/v1/webapp/resources?category=...')
export function useResourceUsageMock() {
  return { categories: RESOURCE_CATEGORIES, resources: RESOURCES, allocations: ALLOCATIONS }
}

/**
 * 应急预案 Mock 钩子（未来替换真实 API）
 * @param {Object} [filter]
 * @param {string} [filter.category]   按类别过滤：医疗/安保/消防/天气/设备故障
 * @param {string} [filter.severity]   按严重等级过滤：high/medium/low
 * @param {string} [filter.keyword]    按标题/触发条件关键词模糊搜索
 */
// TODO: 未来替换为 fetch('/api/v1/webapp/emergency-plans')
export function useEmergencyMock(filter = {}) {
  const filteredPlans = useMemo(() => {
    let list = [...EMERGENCY_PLANS]
    if (filter.category) list = list.filter(p => p.category === filter.category)
    if (filter.severity) list = list.filter(p => p.severity === filter.severity)
    if (filter.keyword) {
      const kw = filter.keyword.trim().toLowerCase()
      if (kw) list = list.filter(p =>
        p.title.toLowerCase().includes(kw) ||
        p.triggerCondition.toLowerCase().includes(kw)
      )
    }
    return list
  }, [filter.category, filter.severity, filter.keyword])

  const filteredLogs = useMemo(() => {
    if (!filter.incidentId) return LOGS
    return LOGS.filter(l => l.incidentId === filter.incidentId)
  }, [filter.incidentId])

  return { plans: EMERGENCY_PLANS, incidents: INCIDENTS, logs: LOGS, filteredPlans, filteredLogs }
}

/**
 * 可视化日程 Mock 钩子（未来替换真实 API）
 * @param {Object} [opts]
 * @param {'venue'|'hr'} [opts.dimension='venue']  按维度过滤日程项
 * @param {boolean} [opts.conflictCheck=true]       是否启用冲突扫描
 */
// TODO: 未来替换为 fetch('/api/v1/webapp/visual-schedule?date=...')
export function useVisualScheduleMock({ dimension = 'venue', conflictCheck = true } = {}) {
  const items = useMemo(
    () => SCHEDULE_ITEMS.filter(it => it.dimension === dimension),
    [dimension]
  )
  const conflictedItemIds = useMemo(() => {
    if (!conflictCheck) return []
    const ids = new Set()
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        const sameRow = dimension === 'venue'
          ? a.venueRowId === b.venueRowId
          : a.hrRowId === b.hrRowId
        if (!sameRow || a.dayOfWeek !== b.dayOfWeek) continue
        const aEnd = a.startHour + a.durationHours
        const bEnd = b.startHour + b.durationHours
        if (Math.max(a.startHour, b.startHour) < Math.min(aEnd, bEnd)) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
    }
    return [...ids]
  }, [items, conflictCheck, dimension])
  return {
    venueRows: VENUE_ROWS,
    hrRows: HR_ROWS,
    activityTypes: ACTIVITY_TYPES,
    scheduleItems: items,
    conflicts: CONFLICTS,
    conflictedItemIds
  }
}

export const useMarketingMock = () => {
  // TODO: 未来替换为 fetch('/api/v1/webapp/marketing/dashboard?videoId=...')
  return {
    videoBasic: VIDEO_BASIC,
    kpi: KPI_DATA,
    trend7: TREND_7DAY,
    trend30: TREND_30DAY,
    demographics: USER_DEMOGRAPHICS,
    ai: AI_SUGGESTIONS,
    // ======== Tab2：森耐特业绩 =========
    brand: BRAND_INFO,
    brandKpi: BRAND_KPI,
    revenue15Day: REVENUE_15DAY,
    annualRevenue: ANNUAL_REVENUE,
    financialBrief: FINANCIAL_BRIEF,
    // ======== Tab3：营销报表 =========
    overviewKpi: MARKETING_OVERVIEW_KPI,
    growth30Day: GROWTH_30DAY_TRACK,
    channelRevenue: CHANNEL_REVENUE_MONTHLY,
    channelRoi: CHANNEL_ROI,
    topCampaigns: TOP_CAMPAIGNS
  }
}

export function useAnalysisReportMock() {
  return ANALYSIS_REPORT
}

/**
 * 生物力学分析 Mock 钩子（未来替换真实 API）
 */
export const useBiomechanicsMock = () => {
  return {
    jointAngle: JOINT_ANGLE_DATA
  }
}

/**
 * 资源智能匹配 Mock 钩子（未来替换真实 API）
 * 含页面1（输入需求）+ 页面2（自动匹配）+ 页面3（输出清单）数据。
 */
export const useResourceMatchingMock = () => {
  return {
    databases: DATABASES,
    tournaments: MATCHING_TOURNAMENTS,
    requirement: REQUIREMENT_TEMPLATE,
    matchProgress: MATCH_PROGRESS,
    matchResults: MATCH_RESULTS,
    conflicts: MATCHING_CONFLICTS,
    stats: MATCH_STATS,
    eventInfo: EVENT_INFO,
    summary: OUTPUT_SUMMARY,
    categorySummary: CATEGORY_SUMMARY,
    costBreakdown: COST_BREAKDOWN,
    timeline: TIMELINE
  }
}
