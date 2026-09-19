import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import AIAnalystPlatform from './modules/AIAnalystPlatform.jsx';
import BackButton from './components/BackButton.jsx';
import ScheduleModule from './modules/ScheduleModule.jsx';
import ResourceUsage from './modules/ResourceUsage.jsx';
import VisualSchedule from './modules/VisualSchedule.jsx';
import EmergencyPlan from './modules/EmergencyPlan.jsx';
import VideoMarketing from './modules/VideoMarketing.jsx';
import PptCanvasStudio from './modules/PptCanvasStudio.jsx';
import ResourceMatching from './modules/ResourceMatching.jsx';
import TalentMatchRoster from './modules/TalentMatchRoster.jsx';
import BrandLinkageStudio from './modules/BrandLinkageStudio.jsx';
import DataServiceStudio from './modules/DataServiceStudio.jsx';
import DataTableStudio from './modules/DataTableStudio.jsx';
import PosterStudio from './modules/PosterStudio.jsx';
import CostChartStudio from './modules/CostChartStudio.jsx';
import TechChartStudio from './modules/TechChartStudio.jsx';
import RegionChartStudio from './modules/RegionChartStudio.jsx';

const VALID_VIEWS = ['dashboard', 'ai', 'schedule', 'resource', 'emergency', 'visual', 'timeline', 'ppt', 'matching', 'roster', 'linkage', 'data', 'tables', 'poster', 'cost', 'tech', 'region'];

const VIEW_NAME = {
  dashboard: '总览',
  ai: '运动数据分析中台',
  schedule: '赛制与赛程',
  resource: '资源使用清单',
  emergency: '应急预案',
  visual: '可视化日程',
  timeline: '智能视频营销中台',
  ppt: 'PPT 内容绘制区',
  matching: '资源智能匹配',
  roster: '人才匹配清单',
  linkage: '联动商家图谱',
  data: '赛事数据服务',
  tables: '赛事数据表',
  poster: '球员交付海报',
  cost: '办赛成本统计',
  tech: '技术优势配图',
  region: '基层赛事数据积累'
};

/**
 * WebApp 路由入口壳组件
 * 负责管理 7 个视图之间的切换、面包屑导航、返回按钮和淡入动画
 */
export default function WebApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view');
  const [currentView, setCurrentView] = useState(
    initialView && VALID_VIEWS.includes(initialView) ? initialView : 'dashboard'
  );

  useEffect(() => {
    document.documentElement.classList.add('page-web');
    return () => document.documentElement.classList.remove('page-web');
  }, []);

  // Sync URL -> state
  useEffect(() => {
    const urlView = searchParams.get('view');
    if (urlView && VALID_VIEWS.includes(urlView) && urlView !== currentView) {
      setCurrentView(urlView);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state -> URL
  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ view }, { replace: true });
    }
  }, [setSearchParams]);

  const goDashboard = useCallback(() => handleNavigate('dashboard'), [handleNavigate]);

  useEffect(() => {
    const handler = () => goDashboard();
    window.addEventListener('webapp:back-to-dashboard', handler);
    return () => window.removeEventListener('webapp:back-to-dashboard', handler);
  }, [goDashboard]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'ai':
        return <AIAnalystPlatform />;
      case 'schedule':
        return <ScheduleModule />;
      case 'resource':
        return <ResourceUsage />;
      case 'emergency':
        return <EmergencyPlan />;
      case 'visual':
        return <VisualSchedule />;
      case 'timeline':
        return <VideoMarketing />;
      case 'ppt':
        return <PptCanvasStudio />;
      case 'matching':
        return <ResourceMatching />;
      case 'roster':
        return <TalentMatchRoster />;
      case 'linkage':
        return <BrandLinkageStudio />;
      case 'data':
        return <DataServiceStudio />;
      case 'tables':
        return <DataTableStudio />;
      case 'poster':
        return <PosterStudio />;
      case 'cost':
        return <CostChartStudio />;
      case 'tech':
        return <TechChartStudio />;
      case 'region':
        return <RegionChartStudio />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div
      className="page-web min-h-screen font-sans flex flex-col pt-20 theme-transition"
      style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}
    >
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: none; }
          }
          .animate-fade-in {
            animation: fade-in 240ms cubic-bezier(0.4, 0, 0.2, 1) both;
          }
        `}
      </style>

      <div className="max-w-[95vw] mx-auto w-full px-8">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            {currentView !== 'dashboard' && (
              <BackButton onBack={goDashboard} />
            )}
            <nav aria-label="breadcrumb">
              <span className="text-[var(--text-muted)] text-sm">篮芯 / 管理控制台</span>
              {currentView !== 'dashboard' && (
                <>
                  <span className="text-[var(--text-muted)] text-sm mx-2">/</span>
                  <span className="text-[var(--brand)] text-sm font-semibold">
                    {VIEW_NAME[currentView]}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>

        <main className="pb-8">
          <section key={currentView} className="animate-fade-in">
            {renderView()}
          </section>
        </main>
      </div>
    </div>
  );
}
