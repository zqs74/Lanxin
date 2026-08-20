import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Download, Printer, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import PhoneFrame from '../components/PhoneFrame.jsx';
import PersonnelRoster from '../components/PersonnelRoster.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { MATCH_EVENT, USER_MESSAGE, AI_REPLY_HEADER, PERSONNEL_GROUPS } from '../data/talentMatchMock.js';

/** 匹配说明面板 */
const NOTES = [
  { title: '对话交互', desc: '用户输入赛事需求→AI智能匹配→输出人员清单，体现信息输入输出全流程' },
  { title: '全岗位覆盖', desc: '裁判6+技术指导3+记录台4+医护2+安保3=18人，覆盖整场赛事全部岗位' },
  { title: '真实照片档案', desc: '18人全部有真实照片，裁判/教练来自项目数据库，记录台/医护/安保为新增档案' },
  { title: '推荐排序', desc: '每组第一推荐人加金色推荐徽章+推荐理由，支持按职位/按匹配度切换' },
];

/**
 * 人才匹配清单主页面（技术优势一 · 智能人才匹配 · 对话版）
 * 居中渲染手机框内嵌 AI 对话界面，右侧说明面板（仅 lg 屏）
 */
export default function TalentMatchRoster() {
  const [fullscreen, setFullscreen] = useState(false);
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

  return (
    <div
      ref={contentRef}
      className={[
        'space-y-4 transition-all',
        fullscreen ? 'video-marketing-fullscreen p-6 overflow-y-auto' : 'max-h-[calc(100vh-140px)] overflow-y-auto pr-1'
      ].join(' ')}
    >
      {/* ===== 页面标题区 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">人才匹配清单</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">AI对话式人员匹配 · 输入需求→输出清单</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
            <Download size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
            导出名单
          </button>
          <button type="button" className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
            <Printer size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
            打印
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? '退出全屏' : '全屏展示'}
            className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60"
          >
            {fullscreen
              ? <Minimize2 size={15} className="text-[var(--brand)]" aria-hidden="true" />
              : <Maximize2 size={15} className="text-[var(--text-muted)]" aria-hidden="true" />}
            {fullscreen ? '退出全屏' : '全屏展示'}
          </button>
        </div>
      </div>

      {/* ===== 页面说明条 ===== */}
      <div className="card-solid p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
            <Smartphone size={16} className="text-[var(--brand)]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <span className="text-sm font-bold text-[var(--text-primary)]">技术优势一 · 智能人才匹配</span>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              对话形式展示 · 匹配率{MATCH_EVENT.matchRate}% · {MATCH_EVENT.deployHours}小时到岗 · 18人全部有照片档案
            </p>
          </div>
          <StatusPill variant="brand">PPT展示页</StatusPill>
        </div>
      </div>

      {/* ===== 主体区域 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 手机框（对话界面） */}
        <PhoneFrame>
          <PersonnelRoster data={{ event: MATCH_EVENT, userMessage: USER_MESSAGE, aiHeader: AI_REPLY_HEADER, groups: PERSONNEL_GROUPS }} />
        </PhoneFrame>

        {/* 说明面板（仅 lg 屏） */}
        <div className="hidden lg:block space-y-3 border-l border-[var(--border)] pl-8">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--brand)]" aria-hidden="true" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">匹配说明</h3>
          </div>
          {NOTES.map((note) => (
            <div key={note.title} className="card-solid p-4 border-l-[3px] border-l-[var(--brand)]">
              <div className="text-sm font-semibold text-[var(--text-primary)]">{note.title}</div>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{note.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}