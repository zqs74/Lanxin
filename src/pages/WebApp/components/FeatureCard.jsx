import React, { useCallback } from 'react';
import { Video, Trophy, Package, ShieldAlert, CalendarPlus, Megaphone, PanelsTopLeft, Wand2, Smartphone, Handshake, Database, Table2, Medal, Coins, Sparkles, MapPin, TrendingUp, Scan, Send, Film } from 'lucide-react';

/**
 * 仪表盘功能入口卡片
 * @param {Object} props
 * @param {'ai'|'schedule'|'resource'|'emergency'|'visual'|'timeline'|'ppt'|'matching'|'roster'} props.variant
 * @param {() => void} props.onClick
 */
export default function FeatureCard({ variant, onClick }) {
  const FEATURE_META = {
    ai: {
      Icon: Video,
      title: '运动数据分析中台',
      summary: '',
      isNew: false,
    },
    schedule: {
      Icon: Trophy,
      title: '赛制与赛程',
      summary: '',
      isNew: true,
    },
    resource: {
      Icon: Package,
      title: '资源使用清单',
      summary: '',
      isNew: true,
    },
    emergency: {
      Icon: ShieldAlert,
      title: '应急预案',
      summary: '',
      isNew: true,
    },
    visual: {
      Icon: CalendarPlus,
      title: '可视化日程',
      summary: '',
      isNew: true,
    },
    timeline: {
      Icon: Megaphone,
      title: '智能视频营销中台',
      summary: '',
      isNew: true,
    },
    ppt: {
      Icon: PanelsTopLeft,
      title: 'PPT 内容绘制区',
      summary: '',
      isNew: true,
    },
    matching: {
      Icon: Wand2,
      title: '资源智能匹配',
      summary: '',
      isNew: true,
    },
    roster: {
      Icon: Smartphone,
      title: '人才匹配清单',
      summary: '',
      isNew: true,
    },
    linkage: {
      Icon: Handshake,
      title: '联动商家图谱',
      summary: '',
      isNew: true,
    },
    data: {
      Icon: Database,
      title: '赛事数据服务',
      summary: '',
      isNew: true,
    },
    tables: {
      Icon: Table2,
      title: '赛事数据表',
      summary: '',
      isNew: true,
    },
    poster: {
      Icon: Medal,
      title: '球员交付海报',
      summary: '',
      isNew: true,
    },
    cost: {
      Icon: Coins,
      title: '办赛成本统计',
      summary: '',
      isNew: true,
    },
    tech: {
      Icon: Sparkles,
      title: '技术优势配图',
      summary: '',
      isNew: true,
    },
    region: {
      Icon: MapPin,
      title: '基层赛事数据积累',
      summary: '',
      isNew: true,
    },
    future: {
      Icon: TrendingUp,
      title: '数字化数据积累',
      summary: '',
      isNew: true,
    },
    multimodal: {
      Icon: Scan,
      title: '多模态场景识别',
      summary: '',
      isNew: true,
    },
    promo: {
      Icon: Send,
      title: '多平台宣发',
      summary: '',
      isNew: true,
    },
    library: {
      Icon: Film,
      title: '视频素材库',
      summary: '',
      isNew: true,
    },
  };

  const meta = FEATURE_META[variant];
  const { Icon, title, summary, isNew } = meta;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const iconBgClass = isNew ? 'bg-[var(--brand)]/10' : 'bg-[var(--surface-muted)]';
  const iconColorClass = isNew ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]';

  const renderPreview = () => {
    switch (variant) {
      case 'ai':
        return (
          <div className="w-full h-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="h-1.5 w-20 rounded-full bg-[var(--text-muted)]/35" />
                <div className="mt-1.5 h-1.5 w-12 rounded-full bg-[var(--text-muted)]/20" />
              </div>
              <div className="text-[10px] font-black tabular-nums text-[var(--text-primary)]">84:68</div>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[22, 21, 23, 18].map((score, index) => (
                <div key={index} className="rounded-md bg-[var(--surface)]/80 px-1 py-1 text-center">
                  <div className="text-[7px] text-[var(--text-muted)]">Q{index + 1}</div>
                  <div className="text-[9px] font-semibold tabular-nums text-[var(--text-primary)]">
                    {score}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-[var(--text-muted)]/15 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '72%',
                    background: 'linear-gradient(90deg, #0F2A5A, var(--brand))',
                  }}
                />
              </div>
              <span className="text-[8px] font-medium text-[var(--brand)]">REPORT</span>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="w-full h-full flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)] w-10 shrink-0">小组赛</span>
              <div className="flex-1 h-2.5 rounded bg-[var(--text-muted)]/30" style={{ width: '60%' }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)] w-10 shrink-0">八强</span>
              <div
                className="h-2.5 rounded relative overflow-hidden"
                style={{
                  width: '45%',
                  background: 'linear-gradient(90deg, var(--brand), var(--accent-hover))',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--brand) 25%, var(--surface)) 50%, transparent 100%)',
                    animation: 'goldShine 2s linear infinite',
                    backgroundSize: '200% auto',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)] w-10 shrink-0">决赛</span>
              <div className="w-[45%]" />
              <div
                className="h-2.5 rounded flex items-center justify-center text-[6px] font-bold text-[var(--text-primary)]"
                style={{ width: '30%', backgroundColor: 'var(--ok)' }}
              >
                ✓
              </div>
            </div>
          </div>
        );

      case 'resource': {
        const pattern = [
          [0, 1, 2, 1, 3, 2, 0],
          [1, 2, 3, 2, 1, 0, 1],
          [0, 1, 2, 4, 3, 2, 1],
        ];
        const cellBg = (level) => {
          switch (level) {
            case 0:
              return 'bg-[var(--surface-muted)]';
            case 1:
              return 'bg-[var(--brand)]/15';
            case 2:
              return 'bg-[var(--brand)]/30';
            case 3:
              return 'bg-[var(--brand)]/55';
            case 4:
              return 'bg-[var(--brand)]';
            default:
              return 'bg-[var(--surface-muted)]';
          }
        };
        return (
          <div className="w-full h-full grid grid-cols-7 grid-rows-3 gap-[1px] p-0.5">
            {pattern.flat().map((level, i) => (
              <div key={i} className={`rounded-sm ${cellBg(level)}`} />
            ))}
          </div>
        );
      }

      case 'emergency':
        return (
          <div className="w-full h-full flex items-center px-1">
            {[0, 1, 2, 3].map((step) => {
              let bg = 'bg-[var(--text-muted)]/40';
              let inner = null;
              let glow = false;
              if (step === 0) {
                bg = 'bg-[var(--ok)]';
                inner = <span className="text-[6px] font-bold text-[var(--text-primary)]">✓</span>;
              } else if (step === 1) {
                bg = 'bg-[var(--brand)]';
                glow = true;
              }
              const lineColor =
                step === 0
                  ? 'bg-[var(--brand)]'
                  : step < 3
                    ? 'bg-[var(--text-muted)]/40'
                    : 'bg-transparent';
              return (
                <React.Fragment key={step}>
                  <div className="relative shrink-0">
                    {glow && (
                      <div
                        className="absolute inset-0 rounded-full blur-sm"
                        style={{ backgroundColor: 'var(--brand)', opacity: 0.6 }}
                      />
                    )}
                    <div
                      className={`relative w-3 h-3 rounded-full ${bg} flex items-center justify-center`}
                    >
                      {inner}
                    </div>
                  </div>
                  {step < 3 && <div className={`flex-1 h-0.5 ${lineColor}`} />}
                </React.Fragment>
              );
            })}
          </div>
        );

      case 'visual': {
        const colors = [
          'bg-[var(--brand)]',
          'bg-[var(--info)]',
          'bg-[var(--ok)]',
          'bg-[var(--purple)]',
          'bg-[var(--warn)]',
          'bg-[var(--info)]/70',
          'bg-[var(--brand)]/70',
          'bg-[var(--ok)]/70',
        ];
        const colBlocks = [
          [{ h: '10px', c: 0 }, { h: '8px', c: 1 }],
          [{ h: '12px', c: 2 }, { h: '9px', c: 3 }, { h: '8px', c: 4 }],
          [{ h: '11px', c: 5 }],
          [{ h: '9px', c: 6 }, { h: '10px', c: 7 }],
        ];
        return (
          <div className="w-full h-full grid grid-cols-4 gap-1 px-0.5">
            {colBlocks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[2px] justify-start pt-0.5">
                {col.map((b, bi) => (
                  <div
                    key={bi}
                    className={`w-full rounded-sm ${colors[b.c]}`}
                    style={{ height: b.h }}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      }

      case 'timeline':
        return (
          <div className="w-full h-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1 relative overflow-hidden">
            <div className="absolute left-0 top-0 w-full h-[67%]">
              <div className="absolute left-0 top-0 w-[60%] h-full p-1">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[2px]">
                  <div className="rounded flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 60%, transparent)' }}>
                    <div className="w-[70%] h-[2px] rounded" style={{ backgroundColor: 'var(--text-primary)' }} />
                  </div>
                  <div className="rounded flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--info) 60%, transparent)' }}>
                    <div className="w-[70%] h-[2px] rounded" style={{ backgroundColor: 'var(--text-primary)' }} />
                  </div>
                  <div className="rounded flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--purple) 60%, transparent)' }}>
                    <div className="w-[70%] h-[2px] rounded" style={{ backgroundColor: 'var(--text-primary)' }} />
                  </div>
                  <div className="rounded flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--ok) 60%, transparent)' }}>
                    <div className="w-[70%] h-[2px] rounded" style={{ backgroundColor: 'var(--text-primary)' }} />
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-[38%] h-full p-1 flex flex-col gap-[2px]">
                <div className="w-full rounded-sm" style={{ flex: 2, backgroundColor: 'var(--brand)', opacity: 0.8 }} />
                <div className="w-full rounded-sm" style={{ flex: 4, backgroundColor: 'var(--text-muted)', opacity: 0.4 }} />
                <div className="w-full rounded-sm" style={{ flex: 4, backgroundColor: 'var(--text-muted)', opacity: 0.3 }} />
              </div>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-[33%]">
              <div className="absolute left-0 top-0 w-[60%] h-full p-1 flex items-end justify-center">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                  <polyline
                    points="0,24 25,18 50,15 75,9 100,6"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="absolute right-0 top-0 w-[40%] h-full p-1 flex items-center justify-center">
                <div className="w-full aspect-square max-h-full grid grid-cols-2 grid-rows-2 gap-[1px] rounded-full overflow-hidden">
                  <div style={{ backgroundColor: 'var(--brand)' }} />
                  <div style={{ backgroundColor: 'var(--info)' }} />
                  <div style={{ backgroundColor: 'var(--purple)' }} />
                  <div style={{ backgroundColor: 'var(--ok)' }} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'ppt':
        return (
          <div className="w-full h-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1.5">
            <div className="grid h-full grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="rounded-md border border-[var(--border)] bg-[var(--surface)]/90 p-1">
                  <div className="h-1.5 w-8 rounded-full bg-[var(--text-muted)]/25" />
                  <div className="mt-1 grid h-[calc(100%-0.5rem)] grid-cols-3 gap-[2px]">
                    <div className="rounded-sm bg-[var(--brand)]/25" />
                    <div className="rounded-sm bg-[var(--info)]/16" />
                    <div className="rounded-sm bg-[var(--purple)]/14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="w-full h-full flex items-center justify-between gap-1 px-1">
            <div className="flex-1 flex flex-col items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)]/90 p-1">
              <div className="w-3.5 h-3.5 rounded-sm bg-[var(--brand)]" />
              <span className="text-[7px] font-bold text-[var(--text-primary)]">输入</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
              <div className="w-2 h-[2px]" style={{ backgroundColor: 'var(--brand)' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)]/90 p-1">
              <div className="flex flex-col items-center gap-[2px] w-full">
                <div className="w-full h-1 rounded-sm bg-[var(--brand)]/55" />
                <div className="w-full h-1 rounded-sm bg-[var(--info)]/40" />
                <div className="w-full h-1 rounded-sm bg-[var(--ok)]/40" />
              </div>
              <span className="text-[7px] font-bold text-[var(--text-primary)]">清单</span>
            </div>
          </div>
        );

      case 'roster':
        return (
          <div className="w-full h-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1.5">
            <div className="h-full flex flex-col">
              <div className="h-3 rounded-sm bg-[var(--brand)] shrink-0" />
              <div className="flex-1 flex flex-col justify-center gap-1.5 px-1 pt-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-[var(--brand)]/40" />
                    <div className="h-1 flex-1 rounded-full bg-[var(--text-muted)]/25" />
                    <div className="w-4 h-2 rounded-full shrink-0 bg-[var(--ok)]/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'linkage': {
        const nodes = [
          [14, 11],
          [86, 11],
          [50, 5],
          [50, 51],
          [14, 45],
          [86, 45],
        ];
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <g stroke="var(--brand)" strokeOpacity="0.45" strokeWidth="0.8">
              {nodes.map(([x, y], i) => (
                <line key={`l-${i}`} x1="50" y1="28" x2={x} y2={y} />
              ))}
            </g>
            <circle cx="50" cy="28" r="9" fill="var(--brand)" />
            <text x="50" y="31" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--surface)">
              52
            </text>
            {nodes.map(([x, y], i) => (
              <rect
                key={`n-${i}`}
                x={x - 6}
                y={y - 3.5}
                width="12"
                height="7"
                rx="1.5"
                fill="var(--surface)"
                stroke="var(--brand)"
                strokeWidth="0.8"
              />
            ))}
          </svg>
        );
      }

      case 'data':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <rect x="0" y="0" width="100" height="8" rx="2" fill="var(--brand)" fillOpacity="0.35" />
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={`k-${i}`}
                x={i * 26}
                y="12"
                width="22"
                height="12"
                rx="2"
                fill="var(--brand)"
                fillOpacity={0.18 + i * 0.12}
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={`r-${i}`} x="0" y={28 + i * 6} width="62" height="3.5" rx="1" fill="var(--text-muted)" fillOpacity={0.28} />
            ))}
            <polyline
              points="66,50 74,42 82,45 90,32 98,26"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'tables':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <rect x="0" y="0" width="100" height="10" rx="2" fill="var(--text-muted)" fillOpacity="0.28" />
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect
                  key={`c-${row}-${col}`}
                  x={col * 26}
                  y={14 + row * 11}
                  width="22"
                  height="7"
                  rx="1.5"
                  fill={col === 1 ? 'var(--brand)' : 'var(--text-muted)'}
                  fillOpacity={col === 1 ? 0.7 : 0.22}
                />
              ))
            )}
          </svg>
        );

      case 'poster':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <rect x="28" y="0" width="44" height="56" rx="3" fill="var(--brand)" fillOpacity="0.12" stroke="var(--brand)" strokeWidth="0.8" />
            <circle cx="50" cy="16" r="6" fill="var(--brand)" fillOpacity="0.55" />
            <rect x="38" y="26" width="24" height="9" rx="4.5" fill="var(--brand)" fillOpacity="0.35" />
            <rect x="33" y="40" width="10" height="9" rx="2" fill="var(--brand)" />
            <rect x="45" y="40" width="10" height="9" rx="2" fill="var(--brand)" fillOpacity="0.6" />
            <rect x="57" y="40" width="10" height="9" rx="2" fill="var(--brand)" fillOpacity="0.35" />
          </svg>
        );

      case 'cost':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <rect x="0" y="4" width="46" height="10" rx="2" fill="var(--brand)" fillOpacity="0.85" />
            <rect x="0" y="18" width="34" height="10" rx="2" fill="var(--brand)" fillOpacity="0.6" />
            <rect x="0" y="32" width="40" height="10" rx="2" fill="var(--brand)" fillOpacity="0.4" />
            <rect x="0" y="46" width="26" height="8" rx="2" fill="var(--text-muted)" fillOpacity="0.3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x="56"
                y={4 + i * 11}
                width={i % 2 === 0 ? 40 : 30}
                height="7"
                rx="1.5"
                fill="var(--text-muted)"
                fillOpacity={0.22}
              />
            ))}
          </svg>
        );

      case 'tech':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect
                  x={i * 25}
                  y="12"
                  width="20"
                  height="32"
                  rx="3"
                  fill="var(--brand)"
                  fillOpacity={0.18 + i * 0.16}
                />
                {i < 3 ? (
                  <path
                    d={`M${i * 25 + 21},28 L${i * 25 + 24},28`}
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                  />
                ) : null}
              </g>
            ))}
            <rect x="0" y="48" width="46" height="6" rx="3" fill="var(--text-muted)" fillOpacity="0.25" />
            <rect x="54" y="48" width="46" height="6" rx="3" fill="var(--text-muted)" fillOpacity="0.25" />
          </svg>
        );

      case 'region':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <rect x="0" y="0" width="30" height="12" rx="2" fill="var(--brand)" fillOpacity="0.8" />
            <rect x="35" y="0" width="30" height="12" rx="2" fill="var(--brand)" fillOpacity="0.5" />
            <rect x="70" y="0" width="30" height="12" rx="2" fill="var(--brand)" fillOpacity="0.3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x="0" y={20 + i * 7} width="4" height="4" rx="1" fill="var(--brand)" fillOpacity={0.8 - i * 0.12} />
                <rect x="9" y={20 + i * 7} width="58" height="4" rx="1" fill="var(--text-muted)" fillOpacity="0.25" />
                <rect x="72" y={20 + i * 7} width="20" height="4" rx="1" fill="var(--brand)" fillOpacity={0.6 - i * 0.08} />
              </g>
            ))}
          </svg>
        );

      case 'future':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            {[
              { color: '#3B82F6' },
              { color: '#8B5CF6' },
              { color: '#10B981' },
              { color: '#F59E0B' },
            ].map((item, i) => (
              <g key={i}>
                <rect x={i * 25} y="8" width="21" height="40" rx="4" fill={item.color} fillOpacity="0.16" stroke={item.color} strokeOpacity="0.5" />
                <rect x={i * 25 + 8} y="18" width="9" height="5" rx="1.5" fill={item.color} />
                <rect x={i * 25 + 5} y="29" width="11" height="4" rx="1.5" fill="var(--text-muted)" fillOpacity="0.35" />
                <rect x={i * 25 + 7} y="37" width="9" height="4" rx="1.5" fill="var(--text-muted)" fillOpacity="0.25" />
              </g>
            ))}
          </svg>
        );

      case 'multimodal':
        return (
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <rect x="0" y="6" width="60" height="44" rx="4" fill="var(--brand)" fillOpacity="0.14" stroke="var(--brand)" strokeOpacity="0.4" />
            <rect x="22" y="14" width="14" height="26" rx="2" fill="none" stroke="#34D399" strokeWidth="1.5" />
            <rect x="40" y="20" width="12" height="20" rx="2" fill="none" stroke="#34D399" strokeWidth="1.5" />
            <circle cx="30" cy="10" r="3" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={66 + i * 6.5}
                y={28 - (i % 3) * 7}
                width="4"
                height={12 + (i % 3) * 7}
                rx="2"
                fill="var(--text-muted)"
                fillOpacity="0.35"
              />
            ))}
          </svg>
        );

      case 'promo':
        return (
          <div className="w-full h-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2 flex flex-col gap-1.5">
            {[
              { name: '抖音', w: '72%', ok: true },
              { name: '视频号', w: '58%', ok: true },
              { name: '小红书', w: '41%', ok: true },
              { name: '快手', w: '22%', ok: false },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center gap-2">
                <span className="text-[8px] text-[var(--text-muted)] w-10 shrink-0">{platform.name}</span>
                <div className="h-2 flex-1 rounded-full bg-[var(--text-muted)]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: platform.w,
                      background: platform.ok ? 'var(--brand)' : 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-auto flex items-center justify-between">
              <span className="text-[8px] text-[var(--text-muted)]">8 个渠道</span>
              <span className="text-[8px] font-bold text-[var(--brand)]">分发中 5/8</span>
            </div>
          </div>
        );

      case 'library':
        return (
          <div className="w-full h-full flex gap-1.5">
            <div className="w-12 shrink-0 flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1">
              <div className="h-1.5 rounded-full bg-[var(--brand)]/50" />
              <div className="h-1.5 rounded-full bg-[var(--text-muted)]/25" />
              <div className="h-1.5 rounded-full bg-[var(--text-muted)]/25" />
              <div className="h-1.5 rounded-full bg-[var(--text-muted)]/25" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-md border"
                  style={{
                    borderColor: i === 0 ? 'var(--brand)' : 'var(--border)',
                    background:
                      i === 0
                        ? 'color-mix(in srgb, var(--brand) 16%, var(--surface))'
                        : 'var(--surface-muted)',
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="card-base card-solid p-4 cursor-pointer group relative overflow-hidden flex flex-col h-full
                 hover:shadow-[0_0_0_1px_var(--brand),0_8px_30px_color-mix(in_srgb,var(--brand)_12%,transparent)]
                 hover:-translate-y-0.5 transition-all duration-200 ease-out
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`进入${title}页面`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          <Icon size={20} className={iconColorClass} aria-hidden="true" />
        </div>
        {isNew && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                           bg-[var(--brand)]/15 border border-[var(--brand)] text-[var(--brand)]">
            ★ 新增
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold mt-3 text-[var(--text-primary)]">{title}</h3>
      {summary && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{summary}</p>}

      <div className="mt-3 h-16 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2 flex-1 flex-shrink-0">
        {renderPreview()}
      </div>
    </div>
  );
}
