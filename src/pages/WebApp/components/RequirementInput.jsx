import React, { useState } from 'react';
import {
  Database, Users, Building2, Package, Megaphone,
  ClipboardList, Calendar, Star, ArrowRight, Wand2, Save, Check
} from 'lucide-react';
import StatusPill from './StatusPill.jsx';
import StepFlowIndicator from './StepFlowIndicator.jsx';

/**
 * 资源智能匹配 · Step1 输入需求
 * 左栏四库概览 + 右栏5模块办赛需求表单 + 底部操作栏
 * @param {Object} props
 * @param {Object} props.data                                 - 数据（databases/tournaments/requirement）
 * @param {Object[]} props.data.databases                     - 四库概览
 * @param {Object[]} props.data.tournaments                   - 赛事选项
 * @param {Object}   props.data.requirement                   - 表单初始值（受控）
 * @param {string}   [props.step='input']                     - 当前步骤 key（顶部圆点高亮）
 * @param {Function} [props.onStepChange]                     - 步骤切换回调
 * @param {Function} [props.onNext]                           - 提交表单推进步骤
 */
export default function RequirementInput({ data, step = 'input', onStepChange, onNext }) {
  const { databases = [], tournaments = [], requirement: initialRequirement } = data || {};

  const [req, setReq] = useState(() => (initialRequirement ? structuredClone(initialRequirement) : {}));
  const [savedFlash, setSavedFlash] = useState(false);

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
  const DB_BORDER = {
    info: 'border-l-[var(--info)]', ok: 'border-l-[var(--ok)]',
    warn: 'border-l-[var(--warn)]', purple: 'border-l-[var(--purple)]'
  };

  const VENUE_TYPES = ['室内', '室外', '综合'];
  const REGIONS = ['莞城', '南城', '东城', '万江', '松山湖', '不限'];
  const AMENITIES = ['热身场', '更衣室', '媒体室', '发布会厅', '停车场', '医疗室'];
  const LIVE_OPTIONS = ['官方直播', '自媒体直播', '无需直播'];
  const PHOTO_OPTIONS = ['专业摄影', '赛事跟拍', '无需'];
  const SOCIAL_OPTIONS = ['微信公众号', '抖音', 'B站', '微博', '小红书', '视频号'];

  const STAFF_ROLES = [
    { key: 'referee', label: '裁判', levels: ['国家级', '一级', '二级', '不限'] },
    { key: 'scoreTable', label: '记录台', levels: ['一级', '二级', '不限'] },
    { key: 'medical', label: '医护人员', levels: ['执业医师', '急救员', '不限'] },
    { key: 'security', label: '安保人员', levels: ['不限'] },
    { key: 'volunteer', label: '志愿者', levels: ['不限'] }
  ];

  const MATERIAL_ITEMS = [
    { key: 'ball', label: '比赛用球', unit: '个', default: 24 },
    { key: 'scoreboard', label: '记分牌/24秒器', unit: '套', default: 4 },
    { key: 'stand', label: '篮架/篮筐', unit: '副', default: 2 },
    { key: 'trophy', label: '奖杯奖牌', unit: '套', default: 12 },
    { key: 'jersey', label: '球衣/参赛服', unit: '件', default: 60 },
    { key: 'water', label: '饮用水/补给', unit: '份', default: 200 }
  ];

  const update = (field, value) => setReq(prev => ({ ...prev, [field]: value }));
  const updateStaff = (role, field, value) =>
    setReq(prev => ({ ...prev, staff: { ...prev.staff, [role]: { ...prev.staff[role], [field]: value } } }));
  const updateMaterial = (key, value) =>
    setReq(prev => ({ ...prev, materials: { ...prev.materials, [key]: value } }));
  const updateMedia = (field, value) =>
    setReq(prev => ({ ...prev, media: { ...prev.media, [field]: value } }));

  const toggleItem = (list, item) =>
    list.includes(item) ? list.filter(x => x !== item) : [...list, item];

  const selectedTournament = tournaments.find(t => t.id === req.tournamentId);
  const totalMatches = Number(req.days || 0) * Number(req.matchesPerDay || 0);
  const totalResources = databases.reduce((sum, d) => sum + (d.count || 0), 0);

  const handleSaveDraft = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleStart = () => {
    if (!req.tournamentId || !req.date) return;
    if (onNext) onNext(req);
  };

  const tagChip = (label, active, onClick) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
        active
          ? 'bg-[var(--brand)] text-black border-[var(--brand)] font-bold'
          : 'bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--brand)]/60'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* ===== 顶部栏 ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">输入需求</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">赛事组织者录入办赛需求，系统从四库中精准匹配资源</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StepFlowIndicator steps={STEPS} current={step} onStepChange={onStepChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ===== 左栏：四库概览 ===== */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card-solid p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Database size={16} className="text-[var(--brand)]" aria-hidden="true" />
              <span className="text-sm font-bold text-[var(--text-primary)]">四库资源总览</span>
              <span className="text-xs text-[var(--text-muted)] ml-auto">AI匹配数据源</span>
            </div>

            {databases.map((db) => {
              const DbIcon = DB_ICON[db.icon] || Database;
              return (
                <div key={db.id} className={`card-solid p-4 border-l-[3px] ${DB_BORDER[db.color] || 'border-l-[var(--brand)]'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${DB_BG[db.color] || 'bg-[var(--brand)]/15'}`}>
                      <DbIcon size={15} className={DB_TEXT[db.color] || 'text-[var(--brand)]'} aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{db.name}</span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className={`text-2xl font-black tabular-nums ${DB_TEXT[db.color] || 'text-[var(--brand)]'}`}>
                      {db.count}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{db.unit || ''}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-snug mt-1">{db.detail}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                    <Star size={10} className="text-[var(--brand)]" aria-hidden="true" />
                    {db.scoreRecords}
                  </p>
                </div>
              );
            })}

            <div className="card-solid p-3 text-center">
              <p className="text-xs text-[var(--text-muted)]">四库总资源</p>
              <p className="text-2xl font-black tabular-nums text-[var(--brand)] mt-0.5">{totalResources.toLocaleString()}+</p>
              <p className="text-xs text-[var(--text-muted)]">可匹配资源项</p>
            </div>
          </div>
        </div>

        {/* ===== 右栏：办赛需求表单 ===== */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card-solid p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-[var(--brand)]" aria-hidden="true" />
                <span className="text-base font-bold text-[var(--text-primary)]">办赛需求录入</span>
              </div>
              <StatusPill variant="brand">Step 1 / 3</StatusPill>
            </div>

            {/* ===== 模块1：基本信息 ===== */}
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--brand)]" aria-hidden="true" />
                赛事基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">赛事选择</span>
                  <select
                    value={req.tournamentId}
                    onChange={(e) => update('tournamentId', e.target.value)}
                    className="input-base px-3 py-2 text-sm"
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">赛事级别</span>
                  <div className="h-9 flex items-center">
                    {selectedTournament && (
                      <StatusPill variant="brand">{selectedTournament.level} · {selectedTournament.levelLabel}</StatusPill>
                    )}
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">比赛日期</span>
                  <input
                    type="date"
                    value={req.date || ''}
                    onChange={(e) => update('date', e.target.value)}
                    className="input-base px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">比赛天数</span>
                  <input
                    type="number"
                    min="1"
                    value={req.days}
                    onChange={(e) => update('days', Number(e.target.value))}
                    className="input-base px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">每日比赛场数</span>
                  <input
                    type="number"
                    min="1"
                    value={req.matchesPerDay}
                    onChange={(e) => update('matchesPerDay', Number(e.target.value))}
                    className="input-base px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">总比赛场数</span>
                  <div className="h-9 flex items-center gap-1 text-sm font-bold text-[var(--brand)]">
                    共 {totalMatches} 场
                  </div>
                </label>
              </div>
            </div>

            {/* ===== 模块2：场馆需求 ===== */}
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <Building2 size={14} className="text-[var(--brand)]" aria-hidden="true" />
                场馆需求
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">场馆类型</span>
                  <div className="flex flex-wrap gap-2 items-center min-h-9">
                    {VENUE_TYPES.map((v) => tagChip(v, req.venueType === v, () => update('venueType', v)))}
                  </div>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">需要场地数</span>
                  <input
                    type="number"
                    min="1"
                    value={req.venueCount}
                    onChange={(e) => update('venueCount', Number(e.target.value))}
                    className="input-base px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">最小容量</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={req.minCapacity}
                      onChange={(e) => update('minCapacity', Number(e.target.value))}
                      className="input-base px-3 py-2 text-sm flex-1"
                    />
                    <span className="text-xs text-[var(--text-muted)]">人</span>
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">区域偏好</span>
                  <select
                    value={req.region}
                    onChange={(e) => update('region', e.target.value)}
                    className="input-base px-3 py-2 text-sm"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-col gap-1 col-span-full">
                  <span className="text-xs text-[var(--text-muted)]">配套需求</span>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((a) => tagChip(a, (req.amenities || []).includes(a), () =>
                      update('amenities', toggleItem(req.amenities || [], a))
                    ))}
                  </div>
                </div>
                <label className="flex flex-col gap-1 col-span-full">
                  <span className="text-xs text-[var(--text-muted)]">特殊要求</span>
                  <input
                    type="text"
                    value={req.specialReq || ''}
                    onChange={(e) => update('specialReq', e.target.value)}
                    placeholder="如需要直播转播车通道"
                    className="input-base px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>

            {/* ===== 模块3：人员需求 ===== */}
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <Users size={14} className="text-[var(--brand)]" aria-hidden="true" />
                人员需求
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {STAFF_ROLES.map((role) => (
                  <div key={role.key} className="grid grid-cols-[100px_1fr_1fr] items-center gap-2">
                    <span className="text-sm text-[var(--text-primary)]">{role.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={req.staff?.[role.key]?.count ?? 0}
                      onChange={(e) => updateStaff(role.key, 'count', Number(e.target.value))}
                      className="input-base px-2 py-2 text-sm w-full"
                      aria-label={`${role.label}人数`}
                    />
                    <select
                      value={req.staff?.[role.key]?.level || '不限'}
                      onChange={(e) => updateStaff(role.key, 'level', e.target.value)}
                      className="input-base px-2 py-2 text-xs w-full"
                      aria-label={`${role.label}级别`}
                    >
                      {role.levels.map((lv) => (
                        <option key={lv} value={lv}>{lv}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== 模块4：物料需求 ===== */}
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <Package size={14} className="text-[var(--brand)]" aria-hidden="true" />
                物料需求
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MATERIAL_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <span className="text-sm w-32 text-[var(--text-primary)]">{item.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={req.materials?.[item.key] ?? item.default}
                      onChange={(e) => updateMaterial(item.key, Number(e.target.value))}
                      className="input-base px-2 py-2 text-sm w-20"
                      aria-label={`${item.label}数量`}
                    />
                    <span className="text-xs text-[var(--text-muted)]">{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== 模块5：媒体宣发需求 ===== */}
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <Megaphone size={14} className="text-[var(--brand)]" aria-hidden="true" />
                媒体宣发需求
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-[var(--text-muted)]">直播需求</span>
                  <div className="flex flex-wrap gap-2">
                    {LIVE_OPTIONS.map((o) => tagChip(o, req.media?.live === o, () => updateMedia('live', o)))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-[var(--text-muted)]">摄影团队</span>
                  <div className="flex flex-wrap gap-2">
                    {PHOTO_OPTIONS.map((o) => tagChip(o, req.media?.photo === o, () => updateMedia('photo', o)))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 col-span-full">
                  <span className="text-xs text-[var(--text-muted)]">社媒推广</span>
                  <div className="flex flex-wrap gap-2">
                    {SOCIAL_OPTIONS.map((o) => tagChip(o, (req.media?.social || []).includes(o), () =>
                      updateMedia('social', toggleItem(req.media?.social || [], o))
                    ))}
                  </div>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)]">媒体邀请</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={req.media?.invite ?? 5}
                      onChange={(e) => updateMedia('invite', Number(e.target.value))}
                      className="input-base px-2 py-2 text-sm w-20"
                      aria-label="媒体邀请数"
                    />
                    <span className="text-xs text-[var(--text-muted)]">家</span>
                    <span className="text-xs text-[var(--text-muted)] ml-1">地方媒体邀请数</span>
                  </div>
                </label>
              </div>
            </div>

            {/* ===== 底部操作栏 ===== */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">预算上限</span>
                <input
                  type="text"
                  value={req.budget || ''}
                  onChange={(e) => update('budget', e.target.value)}
                  placeholder="不限"
                  className="input-base px-3 py-2 text-sm w-32"
                  aria-label="预算上限"
                />
                <span className="text-xs text-[var(--text-muted)]">元</span>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSaveDraft} className="btn btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[var(--border)] hover:border-[var(--brand)]/60">
                  {savedFlash
                    ? <Check size={15} className="text-[var(--ok)]" aria-hidden="true" />
                    : <Save size={15} className="text-[var(--text-muted)]" aria-hidden="true" />}
                  {savedFlash ? '已保存草稿' : '保存草稿'}
                </button>
                <button type="button" onClick={handleStart} className="btn btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                  <Wand2 size={15} aria-hidden="true" />
                  开始智能匹配
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}