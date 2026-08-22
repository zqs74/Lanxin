import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ClipboardList, Users, User, Bot,
  CheckCircle2, Sparkles, Trophy, Star, Send, Check, Eye,
  HeartPulse, ShieldCheck, RotateCcw
} from 'lucide-react';

const CARD_STEP = 90;
const AUTO_INPUT_TEXT = '粤BA半决赛 8月20-22日，裁判6人、技术指导3人、记录台4人、医护2人、安保3人，共18人';

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * 赛事人员匹配——AI对话界面（技术优势一 v2 对话版）
 * 真实输入输出动画：自动输入需求 → 发送 → 思考(2s) → 流式输出人员清单
 * @param {Object} props
 * @param {Object} props.data
 * @param {Object}   props.data.event       - 赛事信息 { tournament, level, date, totalStaff, matchRate, deployHours }
 * @param {Object}   props.data.userMessage - 用户需求消息 { text, time }
 * @param {Object}   props.data.aiHeader    - AI回复开场 { text, time }
 * @param {Object[]} props.data.groups      - 5个职位组 { id, name, short, icon, color, total, members: [] }
 */
export default function PersonnelRoster({ data }) {
  const { event = {}, aiHeader = {}, groups = [] } = data || {};
  const [sortBy, setSortBy] = useState('position');
  const [phase, setPhase] = useState('idle');
  const [inputText, setInputText] = useState('');
  const [sentText, setSentText] = useState('');
  const [sentTime, setSentTime] = useState('');
  const [replyTime, setReplyTime] = useState('');
  const [typedChars, setTypedChars] = useState(0);
  const timersRef = useRef([]);
  const genRef = useRef(0);
  const scrollRef = useRef(null);
  const runFlowRef = useRef(null);

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

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const delay = (ms) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      timersRef.current.push(t);
    });

  const runFlow = async ({ autoType = false, initialDelay = false, userText = '' } = {}) => {
    const gen = ++genRef.current;
    clearTimers();
    const alive = () => genRef.current === gen;

    setPhase('idle');
    setSentText('');
    setSentTime('');
    setReplyTime('');
    setTypedChars(0);
    setInputText('');

    if (initialDelay) {
      await delay(3000);
      if (!alive()) return;
    }

    let text = userText;
    if (autoType) {
      setPhase('userTyping');
      for (let i = 0; i <= AUTO_INPUT_TEXT.length; i++) {
        setInputText(AUTO_INPUT_TEXT.slice(0, i));
        await delay(22);
        if (!alive()) return;
      }
      text = AUTO_INPUT_TEXT;
      await delay(400);
      if (!alive()) return;
    }

    setSentText(text);
    setSentTime(nowTime());
    setPhase('sent');
    await delay(500);
    if (!alive()) return;

    setPhase('thinking');
    await delay(2000);
    if (!alive()) return;

    setPhase('streamingText');
    setReplyTime(nowTime());
    const total = aiHeader.text.length;
    for (let i = 1; i <= total; i++) {
      setTypedChars(i);
      await delay(28);
      if (!alive()) return;
    }
    await delay(250);
    if (!alive()) return;

    setPhase('streamingModules');
    await delay(800);
    if (!alive()) return;

    setPhase('streamingCards');
    await delay(3000);
    if (!alive()) return;

    setPhase('done');
  };

  runFlowRef.current = runFlow;

  useEffect(() => {
    const t = setTimeout(() => {
      runFlowRef.current({ autoType: true, initialDelay: true });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!data) return null;

  const handleReplay = () => runFlow({ autoType: true, initialDelay: false });
  const handleSend = () => {
    const text = inputText.trim();
    if (!text || phase !== 'done') return;
    runFlow({ autoType: false, initialDelay: false, userText: text });
  };

  const isAnimating = phase !== 'done';
  const aiStreaming = ['streamingText', 'streamingModules', 'streamingCards', 'done'].includes(phase);
  const showModules = ['streamingModules', 'streamingCards', 'done'].includes(phase);
  const showList = ['streamingCards', 'done'].includes(phase);

  const allMembers = groups.reduce((acc, g) => {
    g.members.forEach((m) => acc.push({ member: m, group: g }));
    return acc;
  }, []);
  const sortedByScore = [...allMembers].sort((a, b) => b.member.matchScore - a.member.matchScore);
  const maxScore = Math.max(...allMembers.map((x) => x.member.matchScore));

  let groupStart = 0;

  const renderPersonCard = (member, group, showGroupTag, delayMs = 0) => {
    const gc = GROUP_COLOR[group.color] || GROUP_COLOR.brand;
    const sc = scoreColor(member.matchScore);
    return (
      <div
        key={member.id}
        className="relative flex items-center gap-2 px-1 py-1.5 rounded-lg pr-fade-up"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        {showGroupTag && (
          <span
            className="absolute -top-1 -left-1 px-1 py-0.5 rounded text-[7px] font-bold z-10"
            style={{ backgroundColor: `color-mix(in srgb, ${gc.solid} 15%, transparent)`, color: gc.solid }}
          >
            {group.short}
          </span>
        )}
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
        <div className="shrink-0 text-center w-10">
          <div className={`text-sm font-black tabular-nums leading-tight ${scoreTextClass(member.matchScore)}`}>
            {member.matchScore}%
          </div>
          <div className="text-[8px] text-[var(--text-muted)]">匹配</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes pr-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pr-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pr-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
        }
        @keyframes pr-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pr-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .pr-fade-up { animation: pr-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .pr-dot {
          width: 6px; height: 6px; border-radius: 9999px;
          background: linear-gradient(135deg, var(--brand), #B8941F);
          display: inline-block;
          animation: pr-dot 1.1s ease-in-out infinite;
        }
        .pr-glow { animation: pr-glow 1.6s ease-in-out infinite; }
        .pr-cursor { animation: pr-cursor 0.8s steps(1) infinite; }
        .pr-shimmer {
          height: 100%;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand) 55%, transparent), transparent);
          background-size: 200% 100%;
          animation: pr-shimmer 1.4s linear infinite;
        }
      `}</style>

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
          <button
            type="button"
            onClick={handleReplay}
            title="清空重播"
            aria-label="清空重播"
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-[#0F2A5A] bg-white/90 hover:bg-white transition-colors"
          >
            <RotateCcw size={11} aria-hidden="true" />
            清空重播
          </button>
        </div>

        {/* 2. 对话区域（可滚动） */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* 空状态提示 */}
          {!sentText && (phase === 'idle' || phase === 'userTyping') && (
            <div className="flex justify-center pt-10 pb-2">
              <div className="text-center">
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center pr-glow"
                  style={{ background: 'linear-gradient(135deg, var(--info), var(--purple))' }}
                >
                  <Sparkles size={22} className="text-white" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-bold text-[var(--text-primary)]">赛事人员匹配助手</p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">输入赛事需求，AI 自动匹配整场人员清单</p>
              </div>
            </div>
          )}

          {/* 用户消息（右对齐） */}
          {sentText && (
            <div className="flex justify-end pr-fade-up">
              <div
                className="max-w-[280px] rounded-2xl rounded-tr-md px-3.5 py-2.5 ml-2 space-y-1.5"
                style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
              >
                <div className="flex items-center gap-1.5">
                  <ClipboardList size={11} className="text-white" aria-hidden="true" />
                  <span className="text-[11px] font-bold text-white">赛事人员需求</span>
                </div>
                <div className="h-px bg-white/20" />
                <p className="text-[11px] text-white/90 leading-relaxed whitespace-pre-line">{sentText}</p>
                <div className="text-[9px] text-white/50 text-right">{sentTime}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center shrink-0 ml-2">
                <User size={16} className="text-[var(--brand)]" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* 思考动画（三点跳动 + 文案 + 扫光条） */}
          {phase === 'thinking' && (
            <div className="flex justify-start pr-fade-up">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 pr-glow"
                style={{ background: 'linear-gradient(135deg, var(--info), var(--purple))' }}
              >
                <Bot size={16} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 max-w-[300px] rounded-2xl rounded-tl-md px-3.5 py-3 ml-2 bg-[var(--surface)] border border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} style={{ color: 'var(--brand)' }} aria-hidden="true" />
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">正在智能匹配</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="pr-dot" style={{ animationDelay: '0ms' }} />
                    <span className="pr-dot" style={{ animationDelay: '160ms' }} />
                    <span className="pr-dot" style={{ animationDelay: '320ms' }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">检索人才库 · 匹配中…</span>
                </div>
                <div className="mt-2.5 h-1 rounded-full overflow-hidden bg-[var(--surface-muted)]">
                  <div className="pr-shimmer w-2/3 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* AI消息（左对齐，流式输出 + 人员清单） */}
          {aiStreaming && (
            <div className="flex justify-start pr-fade-up">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--info), var(--purple))' }}
              >
                <Bot size={16} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 max-w-[320px] rounded-2xl rounded-tl-md px-3.5 py-3 ml-2 space-y-2.5 bg-[var(--surface)] border border-[var(--border)]">
                {/* AI文字回复（打字机流式） */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 pr-fade-up">
                    <CheckCircle2 size={12} style={{ color: 'var(--ok)' }} aria-hidden="true" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">已为您匹配完成！</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                    {phase === 'streamingText' ? aiHeader.text.slice(0, typedChars) : aiHeader.text}
                    {phase === 'streamingText' && <span className="pr-cursor text-[var(--brand)]">▍</span>}
                  </p>
                  <div className="text-[9px] text-[var(--text-muted)] text-right">{replyTime}</div>
                </div>

                {/* AI匹配摘要条 + 排序切换条 */}
                {showModules && (
                  <div className="space-y-2.5 pr-fade-up">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 8%, transparent)' }}>
                      <Sparkles size={11} style={{ color: 'var(--brand)' }} aria-hidden="true" />
                      <span className="text-[10px] font-bold text-[var(--brand)]">匹配率{event.matchRate}%</span>
                      <span className="text-[10px] text-[var(--text-muted)]">· {event.deployHours}h到岗 · {totalStaff}/18人</span>
                      <Trophy size={11} style={{ color: 'var(--brand)' }} className="ml-auto" aria-hidden="true" />
                    </div>

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
                  </div>
                )}

                {/* 人员清单（逐张级联浮现） */}
                {showList && (
                  <div className="space-y-0.5">
                    {sortBy === 'position' ? (
                      groups.map((group) => {
                        const gc = GROUP_COLOR[group.color] || GROUP_COLOR.brand;
                        const groupDelay = groupStart * CARD_STEP;
                        const membersLen = group.members.length;
                        groupStart += membersLen;
                        return (
                          <div key={group.id}>
                            <div
                              className="flex items-center justify-between px-1 py-1 pr-fade-up"
                              style={{ animationDelay: `${groupDelay}ms` }}
                            >
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
                              {group.members.map((member, mi) =>
                                renderPersonCard(member, group, false, groupDelay + (mi + 1) * CARD_STEP)
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-0.5">
                        <div className="px-1 py-1 text-[9px] text-[var(--text-muted)] pr-fade-up">按匹配度排序 · 最高{maxScore}%</div>
                        {sortedByScore.map(({ member, group }, i) =>
                          renderPersonCard(member, group, true, (i + 1) * CARD_STEP)
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* AI底部操作按钮 */}
                {phase === 'done' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/50 pr-fade-up">
                    <button type="button" className="btn btn-accent flex items-center gap-1 px-3 py-1 rounded-full text-[10px]">
                      <Check size={11} aria-hidden="true" />
                      确认名单
                    </button>
                    <button type="button" className="btn btn-ghost flex items-center gap-1 px-3 py-1 rounded-full text-[10px] border border-[var(--border)]">
                      <Eye size={11} className="text-[var(--text-muted)]" aria-hidden="true" />
                      查看详情
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. 底部输入栏 */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--surface)] border-t border-[var(--border)] shrink-0">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            readOnly={isAnimating}
            placeholder="输入需求..."
            aria-label="输入需求"
            className="flex-1 bg-[var(--surface-muted)] border border-[var(--border)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] disabled:opacity-70"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={phase !== 'done' || !inputText.trim()}
            aria-label="发送"
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, var(--brand), #B8941F)' }}
          >
            <Send size={14} className="text-white" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
