import React, { useState } from 'react';
import { Link2, Play, Check, Copy, Sparkles } from 'lucide-react';
import QRCode from 'react-qr-code';
import StatusPill from './StatusPill.jsx';

/**
 * 短链生成操作界面（集锦追踪与评估 · Step1）
 * 左侧选集锦 → 右侧生成可溯源短链（二维码 + 渠道绑定 + 已生成列表）
 * @param {Object} props
 * @param {Array}  props.highlights      - 6 条集锦
 * @param {Array}  props.generatedLinks  - 已生成短链列表
 * @param {Object} props.currentLink     - 当前生成结果 { url, channels }
 * @param {string} [props.step='shortlink']   - 当前步骤 key（用于顶部圆点高亮）
 * @param {Function} [props.onStepChange]     - 步骤切换回调（提供时顶部圆点可点击）
 */
export default function ShortLinkGenerator({ highlights = [], generatedLinks = [], currentLink = {}, step = 'shortlink', onStepChange }) {
  const STEPS = [
    { key: 'evaluate', label: '评估' },
    { key: 'shortlink', label: '短链生成' },
    { key: 'source', label: '来源追踪' },
    { key: 'collection', label: '数据采集' },
    { key: 'analysis', label: '数据分析' }
  ];
  const CHANNEL_OPTIONS = ['微信', '微博', '抖音', '小红书', '视频号', '直接分享'];

  const defaultSelected = highlights.filter((h) => h.selected).map((h) => h.id);
  const [selectedIds, setSelectedIds] = useState(() => new Set(defaultSelected.length ? defaultSelected : [highlights[0]?.id]));
  const [channels, setChannels] = useState(() => [...(currentLink.channels || ['微信', '抖音'])]);
  const [generated, setGenerated] = useState(generatedLinks);
  const [currentUrl, setCurrentUrl] = useState(currentLink.url || 'https://smty.tv/s/8K2x9');
  const [copied, setCopied] = useState(false);

  const active = highlights.find((h) => selectedIds.has(h.id)) || highlights[0];

  const genCode = () => Math.random().toString(36).slice(2, 6);

  const buildLinkRows = (targets) =>
    targets.map((hl, idx) => ({
      id: `g-${Date.now()}-${idx}`,
      shortUrl: `https://smty.tv/s/${genCode()}`,
      highlight: hl.title,
      channel: channels.length ? channels.join(' / ') : '直接分享',
      status: 'active',
      clicks: 0,
      createdAt: '刚刚'
    }));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.size === highlights.length ? new Set([highlights[0]?.id]) : new Set(highlights.map((h) => h.id))));
  };

  const toggleChannel = (ch) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  };

  const handleGenerate = () => {
    const targets = highlights.filter((h) => selectedIds.has(h.id));
    if (!targets.length) return;
    const rows = buildLinkRows(targets);
    setGenerated((prev) => [...rows, ...prev]);
    setCurrentUrl(rows[0].shortUrl);
  };

  const handleBatch = () => {
    const rows = buildLinkRows(highlights);
    setGenerated((prev) => [...rows, ...prev]);
    setCurrentUrl(rows[0].shortUrl);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Link2 size={18} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">短链生成</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">为每条集锦生成唯一可溯源短链</p>
          </div>
        </div>

        {/* 步骤进度条 */}
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const isCurrent = step === s.key;
            return (
              <React.Fragment key={s.key}>
                {i > 0 && <div className="w-8 h-px bg-[var(--border)] mx-1.5" />}
                <button
                  type="button"
                  onClick={onStepChange ? () => onStepChange(s.key) : undefined}
                  disabled={!onStepChange}
                  className={['group flex flex-col items-center gap-1', onStepChange ? 'cursor-pointer' : ''].join(' ')}
                  aria-label={onStepChange ? `跳转到${s.label}页面` : s.label}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${isCurrent ? 'bg-[var(--brand)]' : 'bg-[var(--surface-muted)] group-hover:bg-[var(--brand)]/60'}`}
                  />
                  <span
                    className={`text-[10px] whitespace-nowrap transition-colors ${isCurrent ? 'text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`}
                  >
                    {s.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：集锦选择列表 ===== */}
        <div className="col-span-12 lg:col-span-5">
          <div className="card-base card-solid p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">选择集锦</h3>
              <span className="text-xs text-[var(--text-muted)]">共{highlights.length}条</span>
            </div>

            <ul className="space-y-2">
              {highlights.map((hl) => {
                const selected = selectedIds.has(hl.id);
                return (
                  <li
                    key={hl.id}
                    className={[
                      'flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer',
                      selected ? 'border-[var(--brand)] bg-[var(--brand)]/8' : 'border-[var(--border)] hover:border-[var(--brand)]/60'
                    ].join(' ')}
                    onClick={() => toggleSelect(hl.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSelect(hl.id);
                      }
                    }}
                    aria-pressed={selected}
                    aria-label={`${selected ? '取消' : ''}选择集锦：${hl.title}`}
                  >
                    <div className="w-16 h-10 shrink-0 rounded-lg bg-gradient-to-br from-[var(--surface-muted)] to-[var(--bg-primary)] flex items-center justify-center">
                      <Play size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{hl.title}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <StatusPill variant="info">{hl.tournament}</StatusPill>
                        <StatusPill variant="purple">{hl.player}</StatusPill>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{hl.duration}</div>
                    </div>
                    {selected ? (
                      <div className="w-5 h-5 rounded-full bg-[var(--brand)] flex items-center justify-center shrink-0">
                        <Check size={12} className="text-black" aria-hidden="true" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--border)] shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
                aria-label="全选所有集锦"
              >
                全选
              </button>
              <button type="button" onClick={handleBatch} className="btn btn-ghost !px-4 !py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60 transition-all">
                批量生成
              </button>
            </div>
          </div>
        </div>

        {/* ===== 右栏：生成区 ===== */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* 已选集锦信息 */}
          {active && (
            <div className="card-base card-solid p-4 flex flex-wrap items-center gap-3">
              <div className="w-16 h-10 shrink-0 rounded-lg bg-gradient-to-br from-[var(--surface-muted)] to-[var(--bg-primary)] flex items-center justify-center">
                <Play size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)] min-w-0 truncate">{active.title}</div>
              <div className="flex flex-wrap gap-2 ml-auto">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--info)]/15 text-[var(--info)] text-xs whitespace-nowrap">赛事:{active.tournament}</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--info)]/15 text-[var(--info)] text-xs whitespace-nowrap">球员:{active.player}</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--info)]/15 text-[var(--info)] text-xs whitespace-nowrap">球队:{active.team}</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--info)]/15 text-[var(--info)] text-xs whitespace-nowrap">日期:{active.date}</span>
              </div>
            </div>
          )}

          {/* 生成结果 */}
          <div className="card-base card-solid p-6 flex flex-col items-center">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <QRCode value={currentUrl} size={120} bgColor="var(--surface)" fgColor="var(--text-primary)" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className="font-mono text-sm text-[var(--text-primary)]">{currentUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-ghost !p-2 border border-[var(--border)] hover:border-[var(--brand)]/60 transition-all"
                aria-label={copied ? '已复制' : '复制短链'}
              >
                {copied ? <Check size={14} className="text-[var(--ok)]" /> : <Copy size={14} className="text-[var(--text-muted)]" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {CHANNEL_OPTIONS.map((ch) => {
                const on = channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs transition-all',
                      on ? 'bg-[var(--brand)] text-black font-semibold' : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)]/60'
                    ].join(' ')}
                    aria-pressed={on}
                    aria-label={`${on ? '取消' : '选择'}渠道 ${ch}`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button type="button" onClick={handleGenerate} className="btn btn-accent inline-flex items-center gap-2 !px-5 !py-2.5 text-sm shadow-sm">
                <Sparkles size={16} aria-hidden="true" />
                生成短链
              </button>
              <button type="button" onClick={handleBatch} className="btn btn-ghost !px-5 !py-2.5 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60 transition-all">
                批量生成全部
              </button>
            </div>
          </div>

          {/* 已生成短链列表 */}
          <div className="card-base card-solid p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">已生成短链</h3>
              <span className="text-xs text-[var(--text-muted)]">共{generated.length}条</span>
            </div>

            <div className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 text-xs text-[var(--text-muted)] font-bold border-b border-[var(--border)] pb-2 mb-1">
              <span>短链</span>
              <span>关联集锦</span>
              <span>渠道</span>
              <span>状态</span>
              <span>点击数</span>
              <span>创建时间</span>
            </div>
            {generated.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 items-center py-2.5 text-sm border-b border-[var(--border)]/40 last:border-0 hover:bg-[var(--surface-muted)]/40 transition-colors"
              >
                <span className="font-mono text-xs text-[var(--info)] truncate">{g.shortUrl}</span>
                <span className="text-[var(--text-secondary)] truncate">{g.highlight}</span>
                <span className="text-xs text-[var(--text-muted)] truncate">{g.channel}</span>
                <span>
                  {g.status === 'active' ? (
                    <StatusPill variant="ok">生效中</StatusPill>
                  ) : (
                    <StatusPill variant="pending">已暂停</StatusPill>
                  )}
                </span>
                <span className="text-[var(--brand)] font-bold tabular-nums">{g.clicks.toLocaleString()}</span>
                <span className="text-xs text-[var(--text-muted)]">{g.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
