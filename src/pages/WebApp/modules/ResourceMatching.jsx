import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wand2, ArrowRight, Check, History, Settings, Database,
  Maximize2, Minimize2
} from 'lucide-react';
import StatusPill from '../components/StatusPill.jsx';
import RequirementInput from '../components/RequirementInput.jsx';
import AutoMatching from '../components/AutoMatching.jsx';
import MatchingOverlay from '../components/MatchingOverlay.jsx';
import ResourceOutputList from '../components/ResourceOutputList.jsx';
import {
  DATABASES, TOURNAMENTS, REQUIREMENT_TEMPLATE,
  MATCH_PROGRESS, MATCH_RESULTS, CONFLICTS, MATCH_STATS,
  EVENT_INFO, OUTPUT_SUMMARY, CATEGORY_SUMMARY, COST_BREAKDOWN, TIMELINE
} from '../data/resourceMatchingMock.js';

/**
 * 资源智能匹配主模块（核心业务一：极速办赛资源中台）
 * 3 步流程：输入需求 → 自动匹配 → 输出清单（可回看、不可跳进）
 */
const STEPS = [
  { key: 'input', label: '输入需求' },
  { key: 'matching', label: '自动匹配' },
  { key: 'output', label: '输出清单' }
];

const DB_SHORT = {
  talent: '人才库',
  venue: '场馆库',
  material: '用品库',
  media: '媒体库'
};

export default function ResourceMatching() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('input');
  const [requirement, setRequirement] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoMatched, setAutoMatched] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const onFsChange = () => {
      const el = document.fullscreenElement || document.webkitFullscreenElement;
      setFullscreen(Boolean(el));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Auto-trigger matching when navigated from showcase homepage with autoMatch=1
  useEffect(() => {
    const autoMatch = searchParams.get('autoMatch');
    if (autoMatch === '1' && !autoMatched) {
      setAutoMatched(true);
      // Build requirement from template + URL params
      const req = { ...REQUIREMENT_TEMPLATE };
      const locationParam = searchParams.get('location');
      const dateParam = searchParams.get('date');
      const budgetParam = searchParams.get('budget');
      if (locationParam) req.region = locationParam;
      if (dateParam) req.date = dateParam;
      if (budgetParam) req.budget = budgetParam;
      setRequirement(req);
      setProcessing(true);
    }
  }, [searchParams, autoMatched]);

  const maxReachableIndex = matchResult ? 2 : (requirement ? 1 : 0);
  const isCompleted = (index) => (index === 0 && Boolean(requirement)) || (index === 1 && Boolean(matchResult));

  const handleStepClick = (key) => {
    const target = STEPS.findIndex((s) => s.key === key);
    if (target <= maxReachableIndex) setStep(key);
  };

  const handleRequirementNext = (req) => {
    setRequirement(req);
    setProcessing(true);
  };

  const handleMatchOverlayDone = () => {
    setProcessing(false);
    setStep('matching');
  };

  const handleMatchNext = (result) => {
    setMatchResult(result);
    setStep('output');
  };

  const toggleFullscreen = async () => {
    try {
      const el = contentRef.current;
      if (!el) return;
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (isFs) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        setFullscreen(false);
      } else {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        setFullscreen(true);
      }
    } catch {
      setFullscreen((prev) => !prev);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'matching':
        return (
          <AutoMatching
            data={{ matchProgress: MATCH_PROGRESS, matchResults: MATCH_RESULTS, conflicts: CONFLICTS, stats: MATCH_STATS }}
            step={step}
            onStepChange={handleStepClick}
            onPrev={() => setStep('input')}
            onNext={() => handleMatchNext({ matchResults: MATCH_RESULTS, stats: MATCH_STATS })}
          />
        );
      case 'output':
        return (
          <ResourceOutputList
            data={{ eventInfo: EVENT_INFO, summary: OUTPUT_SUMMARY, categorySummary: CATEGORY_SUMMARY, costBreakdown: COST_BREAKDOWN, timeline: TIMELINE }}
            step={step}
            onStepChange={handleStepClick}
            onPrev={() => setStep('matching')}
          />
        );
      default:
        return (
          <RequirementInput
            data={{ databases: DATABASES, tournaments: TOURNAMENTS, requirement: REQUIREMENT_TEMPLATE }}
            step={step}
            onStepChange={handleStepClick}
            onNext={handleRequirementNext}
          />
        );
    }
  };

  return (
    <div
      ref={contentRef}
      className={[
        'space-y-4 transition-all',
        fullscreen ? 'video-marketing-fullscreen p-6 overflow-y-auto' : ''
      ].join(' ')}
    >
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Wand2 size={18} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">资源智能匹配</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">输入需求 → AI自动匹配 → 输出整场赛事资源清单</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
            <History size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
            查看历史匹配记录
          </button>
          <button type="button" className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
            <Settings size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
            匹配设置
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? '退出全屏' : '全屏展示'}
            className="btn btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60"
          >
            {fullscreen
              ? <Minimize2 size={16} className="text-[var(--brand)]" aria-hidden="true" />
              : <Maximize2 size={16} className="text-[var(--text-muted)]" aria-hidden="true" />}
            {fullscreen ? '退出全屏' : '全屏展示'}
          </button>
        </div>
      </div>

      {/* ===== 步骤导航条 ===== */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] w-full shadow-sm">
        {STEPS.map((s, i) => {
          const active = step === s.key;
          const completed = isCompleted(i);
          const reachable = i <= maxReachableIndex;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && (
                <ArrowRight size={16} className="text-[var(--text-muted)] mx-1" aria-hidden="true" />
              )}
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleStepClick(s.key)}
                disabled={!reachable}
                className={[
                  'btn flex items-center gap-2 !text-sm !py-2 !px-4 whitespace-nowrap transition-all',
                  active
                    ? 'btn-accent shadow-md translate-y-[-1px]'
                    : 'btn-ghost text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  !reachable ? 'opacity-50 cursor-not-allowed' : ''
                ].join(' ')}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    active
                      ? 'bg-[var(--brand)] text-black'
                      : completed
                        ? 'bg-[var(--ok)] text-white'
                        : 'bg-[var(--surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {completed ? <Check size={12} aria-hidden="true" /> : i + 1}
                </span>
                {s.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* ===== 四库概念提示条（仅步骤1） ===== */}
      {step === 'input' && (
        <div className="card-solid p-3 flex flex-wrap items-center gap-3">
          <Database size={18} className="text-[var(--brand)] shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-[200px]">
            <span className="text-sm font-bold text-[var(--text-primary)]">极速办赛资源中台 · 四库驱动</span>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {DATABASES.map((d) => `${DB_SHORT[d.id] || d.name}${d.count}`).join(' / ')}
            </p>
          </div>
          <StatusPill variant="brand">AI精准匹配</StatusPill>
        </div>
      )}

      <section key={step}>{renderStep()}</section>

      {processing && (
        <MatchingOverlay
          stages={MATCH_PROGRESS}
          stats={MATCH_STATS}
          onComplete={handleMatchOverlayDone}
        />
      )}
    </div>
  );
}