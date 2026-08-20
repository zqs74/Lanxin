import React, { useState } from 'react';
import {
  Cpu, AlertTriangle, Lightbulb, Check, Star, ArrowLeft, ArrowRight,
  Users, Building2, Package, Megaphone, Clock
} from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import StepFlowIndicator from './StepFlowIndicator.jsx';

/**
 * 资源智能匹配 · Step2 自动匹配
 * 左栏匹配进度+冲突预警 + 右栏四库标签切换结果 + 底部确认/返回
 * @param {Object} props
 * @param {Object} props.data
 * @param {Object[]} props.data.matchProgress            - 4库匹配进度
 * @param {Object}   props.data.matchResults             - 4库匹配结果详情
 * @param {Object[]} props.data.conflicts                - 冲突预警列表
 * @param {Object}   props.data.stats                    - 匹配统计
 * @param {string}   [props.step='matching']             - 当前步骤 key（顶部圆点高亮）
 * @param {Function} [props.onStepChange]                - 步骤切换回调
 * @param {Function} [props.onPrev]                      - 返回修改需求
 * @param {Function} [props.onNext]                      - 确认匹配·生成清单
 */
export default function AutoMatching({ data, step = 'matching', onStepChange, onPrev, onNext }) {
  const { matchProgress = [], matchResults = {}, conflicts = [], stats = {} } = data || {};
  const [selectedTab, setSelectedTab] = useState('talent');

  if (!data) return null;

  const STEPS = [
    { key: 'input', label: '输入需求' },
    { key: 'matching', label: '自动匹配' },
    { key: 'output', label: '输出清单' }
  ];

  const DB_ICON = { Users, Building2, Package, Megaphone };
  const DB_TEXT = {
    info: 'text-[var(--info)]', ok: 'text-[var(--ok)]',
    warn: 'text-[var(--warn)]', purple: 'text-[var(--purple)]'
  };
  const DB_BG = {
    info: 'bg-[var(--info)]/15', ok: 'bg-[var(--ok)]/15',
    warn: 'bg-[var(--warn)]/15', purple: 'bg-[var(--purple)]/15'
  };
  const COLOR_VAR = {
    info: 'var(--info)', ok: 'var(--ok)', warn: 'var(--warn)', purple: 'var(--purple)'
  };

  const TABS = [
    { key: 'talent', label: '人才库', color: 'info' },
    { key: 'venue', label: '场馆库', color: 'ok' },
    { key: 'material', label: '物料库', color: 'warn' },
    { key: 'media', label: '媒体库', color: 'purple' }
  ];

  const MEDIA_PILL = { 官方直播: 'brand', 自媒体直播: 'purple', 文字报道: 'info', 社媒推广: 'ok' };

  const progressMeta = (id) => matchProgress.find((p) => p.id === id);

  const pct = (matched, total) => (total > 0 ? Math.round((matched / total) * 100) : 0);

  const scoreColor = (score) =>
    score >= 95 ? 'text-[var(--ok)]' : score >= 90 ? 'text-[var(--brand)]' : 'text-[var(--warn)]';

  const scoreBarColor = (score) =>
    score >= 95 ? 'var(--ok)' : score >= 90 ? 'var(--brand)' : 'var(--warn)';

  const conflictIcon = (type) => (type === 'time' ? Clock : AlertTriangle);

  const renderTalent = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[var(--text-primary)]">人才匹配结果</span>
        <span className="text-xs text-[var(--text-muted)]">按匹配分排序</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[580px]">
          {(matchResults.talent || []).map((p) => (
            <div
              key={p.name}
              className="grid grid-cols-[80px_1fr_60px_50px_60px_56px] items-center gap-2 p-2.5 rounded-xl hover:bg-[var(--surface-muted)]/40 border-b border-[var(--border)]"
            >
              <StatusPill variant="info">{p.role}</StatusPill>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{p.level}</div>
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-[var(--brand)]" aria-hidden="true" />
                <span className="text-sm font-bold tabular-nums text-[var(--brand)]">{p.rating}</span>
              </div>
              <span className="text-xs tabular-nums text-[var(--text-muted)]">{p.experience}场</span>
              <div>
                {p.status === 'matched'
                  ? <StatusPill variant="ok">已匹配</StatusPill>
                  : <StatusPill variant="warn">备选</StatusPill>}
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-lg font-black tabular-nums ${scoreColor(p.score)}`}>{p.score}</span>
                <div className="w-full h-1 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.score}%`, backgroundColor: scoreBarColor(p.score) }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVenue = () => (
    <div className="space-y-2.5">
      {(matchResults.venue || []).map((v) => (
        <div key={v.name} className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)]">{v.name}</span>
            <div className="flex items-center gap-2">
              {v.status === 'matched'
                ? <StatusPill variant="ok">已匹配</StatusPill>
                : <StatusPill variant="warn">备选</StatusPill>}
              <span className={`text-lg font-black tabular-nums ${scoreColor(v.score)}`}>{v.score}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs mt-2 text-[var(--text-muted)]">
            <span>类型：{v.type}</span>
            <span>容量：{v.capacity}人</span>
            <span>位置：{v.location}</span>
            <span>评分：{v.rating}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(v.facilities || []).map((f) => (
              <span key={f} className="px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[10px] text-[var(--text-muted)]">{f}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMaterial = () => (
    <div>
      {(matchResults.material || []).map((m) => (
        <div key={m.name} className="grid grid-cols-[1fr_56px_80px_56px_50px] items-center gap-2 p-2.5 border-b border-[var(--border)] hover:bg-[var(--surface-muted)]/40 transition-colors">
          <div>
            <div className="text-sm text-[var(--text-primary)]">{m.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{m.supplier}</div>
          </div>
          <span className="text-sm tabular-nums text-[var(--text-primary)]">{m.qty}{m.unit}</span>
          <span className="text-xs text-[var(--text-muted)]">{m.supplier}</span>
          <div>
            {m.status === 'matched'
              ? <StatusPill variant="ok">已匹配</StatusPill>
              : <StatusPill variant="danger">缺货{m.shortageQty}</StatusPill>}
          </div>
          <span className={`text-lg font-black tabular-nums ${scoreColor(m.score)}`}>{m.score}</span>
        </div>
      ))}
    </div>
  );

  const renderMedia = () => (
    <div>
      {(matchResults.media || []).map((m) => (
        <div key={m.name} className="grid grid-cols-[1fr_80px_80px_50px] items-center gap-2 p-2.5 border-b border-[var(--border)] hover:bg-[var(--surface-muted)]/40 transition-colors">
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{m.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{m.type}</div>
          </div>
          <StatusPill variant={MEDIA_PILL[m.type] || 'info'}>{m.type}</StatusPill>
          <span className="text-sm tabular-nums text-[var(--brand)]">{m.reach}</span>
          <span className={`text-lg font-black tabular-nums ${scoreColor(m.score)}`}>{m.score}</span>
        </div>
      ))}
    </div>
  );

  const renderResult = () => {
    switch (selectedTab) {
      case 'talent': return renderTalent();
      case 'venue': return renderVenue();
      case 'material': return renderMaterial();
      case 'media': return renderMedia();
      default: return renderTalent();
    }
  };

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">自动匹配</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">AI 根据需求从四库自动匹配最优资源，检测冲突并推荐替代方案</p>
        </div>
        <StepFlowIndicator steps={STEPS} current={step} onStepChange={onStepChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：匹配进度 + 冲突预警 ===== */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* AI匹配进度卡 */}
          <div className="card-solid p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-[var(--brand)]" aria-hidden="true" />
                <span className="text-sm font-bold text-[var(--text-primary)]">AI匹配进度</span>
              </div>
              <StatusPill variant="ok">匹配完成</StatusPill>
            </div>

            <div className="space-y-4">
              {matchProgress.map((p) => {
                const ProgIcon = DB_ICON[p.icon] || Package;
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${DB_BG[p.color] || 'bg-[var(--brand)]/15'}`}>
                          <ProgIcon size={14} className={DB_TEXT[p.color] || 'text-[var(--brand)]'} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs tabular-nums text-[var(--text-primary)]">{p.matched}/{p.total}</span>
                        <Check size={13} className="text-[var(--ok)]" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct(p.matched, p.total)}%`, backgroundColor: COLOR_VAR[p.color] || 'var(--brand)' }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">耗时 {p.duration}</div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[var(--border)] pt-4 mt-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">总匹配</div>
                  <div className="text-lg font-black tabular-nums text-[var(--brand)]">{stats.totalMatched}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">总需求</div>
                  <div className="text-lg font-black tabular-nums text-[var(--text-muted)]">{stats.totalRequired}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">匹配率</div>
                  <div className="text-lg font-black tabular-nums text-[var(--ok)]">{stats.matchRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">平均分</div>
                  <div className="text-lg font-black tabular-nums text-[var(--brand)]">{stats.avgScore}</div>
                </div>
              </div>
              <div className="text-xs text-[var(--text-muted)] text-center mt-2">总耗时 {stats.duration}</div>
            </div>
          </div>

          {/* 冲突预警卡 */}
          <div className="card-solid p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-[var(--warn)]" aria-hidden="true" />
                <span className="text-sm font-bold text-[var(--text-primary)]">冲突与异常预警</span>
              </div>
              <StatusPill variant="warn">{conflicts.length}项需处理</StatusPill>
            </div>
            <div className="space-y-3">
              {conflicts.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-[var(--ok)]">
                  <Check size={14} aria-hidden="true" />
                  无冲突，全部资源匹配成功
                </div>
              )}
              {conflicts.map((c, i) => {
                const Icon = conflictIcon(c.type);
                return (
                  <div key={i} className={`border-l-[3px] pl-3 ${c.severity === 'danger' ? 'border-l-[var(--danger)]' : 'border-l-[var(--warn)]'}`}>
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={c.severity === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--warn)]'} aria-hidden="true" />
                      <span className="text-xs text-[var(--text-primary)]">{c.desc}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Lightbulb size={12} className="text-[var(--brand)] shrink-0" aria-hidden="true" />
                      <span className="text-xs text-[var(--text-muted)]">{c.solution}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== 右栏：四库匹配结果 ===== */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {TABS.map((t) => {
              const active = selectedTab === t.key;
              const count = progressMeta(t.key)?.matched;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    active ? '' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  style={active ? { backgroundColor: COLOR_VAR[t.color], color: 'white' } : undefined}
                >
                  {t.label}({count !== undefined ? count : 0})
                </button>
              );
            })}
          </div>

          <div className="card-solid p-5">
            {renderResult()}
          </div>

          {/* 底部操作栏 */}
          <div className="card-solid p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Check size={16} className="text-[var(--ok)]" aria-hidden="true" />
              <span className="text-sm font-bold text-[var(--text-primary)]">
                匹配完成 · {stats.totalMatched}/{stats.totalRequired}项已匹配
              </span>
              <span className="text-xs text-[var(--text-muted)]">{conflicts.length}项需人工确认</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onPrev && (
                <button type="button" onClick={onPrev} className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
                  <ArrowLeft size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
                  返回修改需求
                </button>
              )}
              {onNext && (
                <button type="button" onClick={onNext} className="btn btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                  确认匹配·生成清单
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}