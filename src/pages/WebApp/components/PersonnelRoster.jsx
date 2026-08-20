import React, { useState } from 'react';
import {
  ChevronLeft, MoreHorizontal, ClipboardList, Users, User, Bot,
  CheckCircle2, Sparkles, Trophy, Star, Send, Check, Eye,
  HeartPulse, ShieldCheck
} from 'lucide-react';

/**
 * 赛事人员匹配——AI对话界面（技术优势一 v2 对话版）
 * 用户发送需求 → AI回复内含整场人员匹配清单，支持"按职位 / 按匹配度"排序切换
 * @param {Object} props
 * @param {Object} props.data
 * @param {Object}   props.data.event       - 赛事信息 { tournament, level, date, totalStaff, matchRate, deployHours }
 * @param {Object}   props.data.userMessage - 用户需求消息 { text, time }
 * @param {Object}   props.data.aiHeader    - AI回复开场 { text, time }
 * @param {Object[]} props.data.groups      - 5个职位组 { id, name, short, icon, color, total, members: [] }
 */
export default function PersonnelRoster({ data }) {
  const { event = {}, userMessage = {}, aiHeader = {}, groups = [] } = data || {};
  const [sortBy, setSortBy] = useState('position');

  if (!data) return null;

  const totalStaff = event.totalStaff || groups.reduce((sum, g) => sum + g.members.length, 0);

  const GROUP_COLOR = {
    info: { text: 'text-[var(--info)]', bg: 'bg-[var(--info)]/15', solid: 'var(--info)' },
    purple: { text: 'text-[var(--purple)]', bg: 'bg-[var(--purple)]/15', solid: 'var(--purple)' },
    ok: { text: 'text-[var(--ok)]', bg: 'bg-[var(--ok)]/15', solid: 'var(--ok)' },
    danger: { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/15', solid: 'var(--danger)' },
    warn: { text: 'text-[var(--warn)]', bg: 'bg-[var(--warn)]/15', solid: 'var(--warn)' },
    brand: { text: 'text-[var(--brand)]', bg: 'bg-[var(--brand)]/15', solid: 'var(--brand)' },
  };

  const scoreColor = (score) => (score >= 95 ? 'var(--ok)' : score >= 85 ? 'var(--brand)' : 'var(--warn)');
  const scoreTextClass = (score) => (score >= 95 ? 'text-[var(--ok)]' : score >= 85 ? 'text-[var(--brand)]' : 'text-[var(--warn)]');

  const renderPersonCard = (member, group, showGroupTag) => {
    const gc = GROUP_COLOR[group.color] || GROUP_COLOR.brand;
    const sc = scoreColor(member.matchScore);
    return (
      <div key={member.id} className="relative flex items-center gap-2 px-1 py-1.5 rounded-lg">
        {showGroupTag && (
          <span
            className="absolute -top-1 -left-1 px-1 py-0.5 rounded text-[7px] font-bold z-10"
            style={{ backgroundColor: `color-mix(in srgb, ${gc.solid} 15%, transparent)`, color: gc.solid }}
          >
            {group.short}
          </span>
        )}
        {/* 头像：有照片用 img，否则姓名首字降级 */}
        {member.hasPhoto ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: sc }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full border-2 shrink-0 flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: `color-mix(in srgb, ${gc.solid} 15%, transparent)`,
              color: gc.solid,
              borderColor: sc,
            }}
          >
            {member.name[0]}
          </div>
        )}
        {/* 中间信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[var(--text-primary)]">{member.name}</span>
            {member.isRecommended && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-[var(--brand)] text-black text-[8px] font-bold">
                <Star size={7} fill="currentColor" aria-hidden="true" />推荐
              </span>
            )}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">{member.role} · {member.level}</div>
          <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
            <span>{member.years}年</span>
            {member.matches > 0 && <span>· {member.matches}场</span>}
            <span className="flex items-center gap-0.5">
              <Star size={7} style={{ color: 'var(--brand)' }} aria-hidden="true" />
              {member.rating}
            </span>
          </div>
        </div>
        {/* 右侧匹配度 */}
        <div className="shrink-0 text-center w-10">
          <div className={`text-sm font-black tabular-nums leading-tight ${scoreTextClass(member.matchScore)}`}>
            {member.matchScore}%
          </div>
          <div className="text-[8px] text-[var(--text-muted)]">匹配</div>
        </div>
      </div>
    );
  };

  const allMembers = groups.reduce((acc, g) => {
    g.members.forEach((m) => acc.push({ member: m, group: g }));
    return acc;
  }, []);
  const sortedByScore = [...allMembers].sort((a, b) => b.member.matchScore - a.member.matchScore);
  const maxScore = Math.max(...allMembers.map((x) => x.member.matchScore));

  return (
    <div className="bg-[var(--bg-primary)] h-full flex flex-col">
      {/* 1. App头部（金色渐变） */}
      <div
        className="flex items-center justify-between px-4 h-[52px] shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
      >
        <ChevronLeft size={20} className="text-white" aria-hidden="true" />
        <div className="text-center">
          <div className="text-sm font-bold text-white leading-tight">昇梦AI</div>
          <div className="text-[10px] text-white/80 leading-tight">赛事人员匹配助手</div>
        </div>
        <MoreHorizontal size={18} className="text-white justify-self-end" aria-hidden="true" />
      </div>

      {/* 2. 对话区域（可滚动） */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4" style={{ scrollbarWidth: 'none' }}>
        {/* ===== 用户消息（右对齐） ===== */}
        <div className="flex justify-end">
          <div
            className="max-w-[280px] rounded-2xl rounded-tr-md px-3.5 py-2.5 ml-2 space-y-1.5"
            style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
          >
            <div className="flex items-center gap-1.5">
              <ClipboardList size={11} className="text-white" aria-hidden="true" />
              <span className="text-[11px] font-bold text-white">赛事人员需求</span>
            </div>
            <div className="h-px bg-white/20" />
            <p className="text-[11px] text-white/90 leading-relaxed whitespace-pre-line">{userMessage.text}</p>
            <div className="text-[9px] text-white/50 text-right">{userMessage.time}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center shrink-0 ml-2">
            <User size={16} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
        </div>

        {/* ===== AI消息（左对齐，嵌人员清单） ===== */}
        <div className="flex justify-start">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--info), var(--purple))' }}
          >
            <Bot size={16} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 max-w-[320px] rounded-2xl rounded-tl-md px-3.5 py-3 ml-2 space-y-2.5 bg-[var(--surface)] border border-[var(--border)]">
            {/* AI文字回复 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: 'var(--ok)' }} aria-hidden="true" />
                <span className="text-xs font-bold text-[var(--text-primary)]">已为您匹配完成！</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{aiHeader.text}</p>
              <div className="text-[9px] text-[var(--text-muted)] text-right">{aiHeader.time}</div>
            </div>

            {/* AI匹配摘要条 */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 8%, transparent)' }}>
              <Sparkles size={11} style={{ color: 'var(--brand)' }} aria-hidden="true" />
              <span className="text-[10px] font-bold text-[var(--brand)]">匹配率{event.matchRate}%</span>
              <span className="text-[10px] text-[var(--text-muted)]">· {event.deployHours}h到岗 · {totalStaff}/18人</span>
              <Trophy size={11} style={{ color: 'var(--brand)' }} className="ml-auto" aria-hidden="true" />
            </div>

            {/* 排序切换条 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[10px] text-[var(--text-muted)]">共{groups.length}组 · {totalStaff}人</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSortBy('position')}
                  className={
                    sortBy === 'position'
                      ? 'bg-[var(--brand)] text-black px-2 py-0.5 rounded-full text-[9px] font-bold'
                      : 'border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full text-[9px]'
                  }
                >
                  按职位
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('score')}
                  className={
                    sortBy === 'score'
                      ? 'bg-[var(--brand)] text-black px-2 py-0.5 rounded-full text-[9px] font-bold'
                      : 'border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full text-[9px]'
                  }
                >
                  按匹配度
                </button>
              </div>
            </div>

            {/* 人员清单 */}
            <div className="space-y-0.5">
              {sortBy === 'position' ? (
                groups.map((group) => {
                  const gc = GROUP_COLOR[group.color] || GROUP_COLOR.brand;
                  return (
                    <div key={group.id}>
                      <div className="flex items-center justify-between px-1 py-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${gc.bg}`}>
                            {group.id === 'referee' ? (
                              <Users size={11} className={gc.text} aria-hidden="true" />
                            ) : group.icon === 'HeartPulse' ? (
                              <HeartPulse size={11} className={gc.text} aria-hidden="true" />
                            ) : group.icon === 'ShieldCheck' ? (
                              <ShieldCheck size={11} className={gc.text} aria-hidden="true" />
                            ) : (
                              <ClipboardList size={11} className={gc.text} aria-hidden="true" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[var(--text-primary)]">{group.name}</span>
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)]">{group.total}人</span>
                      </div>
                      <div className="space-y-0.5">
                        {group.members.map((member) => renderPersonCard(member, group, false))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-0.5">
                  <div className="px-1 py-1 text-[9px] text-[var(--text-muted)]">按匹配度排序 · 最高{maxScore}%</div>
                  {sortedByScore.map(({ member, group }) => renderPersonCard(member, group, true))}
                </div>
              )}
            </div>

            {/* AI底部操作按钮 */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/50">
              <button type="button" className="btn btn-accent flex items-center gap-1 px-3 py-1 rounded-full text-[10px]">
                <Check size={11} aria-hidden="true" />
                确认名单
              </button>
              <button type="button" className="btn btn-ghost flex items-center gap-1 px-3 py-1 rounded-full text-[10px] border border-[var(--border)]">
                <Eye size={11} className="text-[var(--text-muted)]" aria-hidden="true" />
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 底部输入栏 */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--surface)] border-t border-[var(--border)] shrink-0">
        <input
          readOnly
          placeholder="输入需求..."
          aria-label="输入需求（演示用）"
          className="flex-1 bg-[var(--surface-muted)] border border-[var(--border)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
        />
        <button
          type="button"
          aria-label="发送"
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
        >
          <Send size={14} className="text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}