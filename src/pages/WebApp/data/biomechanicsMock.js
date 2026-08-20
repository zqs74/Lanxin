/**
 * 生物力学分析模块 Mock 数据（技术优势二）
 * 5 个维度：关节角度链 / 发力时序 / 重心轨迹 / 动作对称性 / 疲劳衰减曲线
 * 球员统一：张子轩#23 / 李明超#7 / 陈浩#15 / 王伟#9 / 赵磊#31；球队：东莞宏远；赛事：粤BA半决赛 vs 广州龙狮
 */

/* ======================== 关节角度链：球员 × 动作 多套数据 ======================== */
const HINT = {
  shoulder: { ok: '外展角度理想，发力充分', warn: '外展角度略偏，注意举球轨迹', danger: '外展角度偏差大，建议专项纠正' },
  elbow: { ok: '屈曲角度标准，出手稳定', warn: '屈曲角度略偏，注意肘部跟随', danger: '屈曲角度偏差大，建议专项纠正' },
  wrist: { ok: '拨球角度合理，球感良好', warn: '拨球角度略偏，影响投篮旋转', danger: '拨球角度偏差大，建议专项纠正' },
  hip: { ok: '屈曲角度合理，重心稳定', warn: '屈曲略大，建议加强下盘稳定性训练', danger: '屈曲角度偏差大，易失去防守位置' },
  knee: { ok: '屈曲角度良好，缓冲充分', warn: '屈曲略大，注意膝盖内扣', danger: '屈曲角度偏差大，损伤风险较高' }
};

const JOINT_NAMES = { shoulder: '肩关节', elbow: '肘关节', wrist: '腕关节', hip: '髋关节', knee: '膝关节' };

const J = (rows) => rows.map(([key, cur, min, max, status, phase]) => ({
  key,
  name: JOINT_NAMES[key],
  currentAngle: cur,
  idealMin: min,
  idealMax: max,
  status,
  phase,
  advice: `${JOINT_NAMES[key]}${HINT[key][status]}`
}));

const PHASES = {
  '投篮出手': ['准备', '屈膝', '蹬伸', '举球', '出手', '随摆'],
  '防守滑步': ['准备', '屈膝', '滑步', '急停', '复位', '复位'],
  '运球突破': ['准备', '屈膝', '运球', '变向', '加速', '急停']
};

const T = (action, rows) => rows.map((r, i) => ({
  time: i * 100,
  label: PHASES[action][i],
  shoulder: r[0],
  elbow: r[1],
  wrist: r[2],
  hip: r[3],
  knee: r[4]
}));

// 各动作理想区间（生物力学标准）
const IDEAL = {
  '投篮出手': { shoulder: [120, 145], elbow: [85, 95], wrist: [40, 55], hip: [90, 120], knee: [60, 85] },
  '防守滑步': { shoulder: [60, 80], elbow: [45, 65], wrist: [20, 35], hip: [100, 125], knee: [80, 100] },
  '运球突破': { shoulder: [85, 110], elbow: [60, 80], wrist: [40, 60], hip: [85, 110], knee: [70, 90] }
};

const A = (action, score, rows) => {
  const ideal = IDEAL[action];
  return {
    overallScore: score,
    joints: J(rows.map(([key, cur, status, phase]) => [key, cur, ideal[key][0], ideal[key][1], status, phase]))
  };
};

const TIMELINES = {
  '投篮出手': {
    zzx: [[45, 30, 15, 20, 30], [60, 45, 20, 60, 65], [85, 60, 25, 95, 72], [110, 75, 35, 85, 55], [132, 89, 45, 70, 40], [95, 120, 60, 55, 35]],
    lmc: [[40, 25, 12, 25, 35], [55, 40, 18, 65, 68], [75, 55, 22, 95, 74], [95, 70, 32, 85, 58], [118, 82, 42, 75, 45], [85, 110, 55, 60, 38]],
    ch: [[42, 28, 14, 22, 32], [56, 42, 19, 62, 66], [78, 58, 23, 92, 72], [102, 74, 34, 85, 56], [125, 92, 48, 72, 42], [90, 115, 58, 56, 36]],
    ww: [[44, 30, 16, 22, 30], [58, 44, 21, 62, 64], [80, 60, 25, 92, 70], [104, 74, 36, 85, 54], [128, 90, 50, 72, 40], [92, 116, 60, 56, 34]],
    zl: [[38, 24, 12, 24, 32], [52, 38, 17, 64, 66], [72, 54, 21, 94, 70], [94, 68, 30, 86, 54], [115, 80, 38, 72, 42], [82, 106, 52, 58, 36]]
  },
  '防守滑步': {
    zzx: [[50, 38, 18, 45, 55], [65, 48, 22, 75, 80], [72, 55, 26, 100, 92], [72, 58, 28, 118, 92], [66, 52, 26, 105, 80], [58, 46, 22, 88, 65]],
    lmc: [[48, 32, 15, 50, 60], [62, 42, 18, 80, 84], [68, 50, 22, 105, 96], [68, 52, 24, 122, 96], [62, 46, 20, 108, 84], [54, 40, 18, 90, 70]],
    ch: [[49, 34, 16, 46, 56], [64, 46, 20, 78, 82], [70, 53, 24, 105, 92], [72, 55, 26, 112, 92], [65, 50, 24, 100, 78], [56, 44, 20, 86, 66]],
    ww: [[51, 36, 18, 48, 58], [65, 47, 22, 80, 84], [72, 55, 26, 108, 90], [74, 54, 30, 116, 90], [67, 50, 26, 102, 78], [58, 45, 22, 88, 66]],
    zl: [[47, 32, 14, 50, 60], [61, 42, 18, 82, 84], [67, 48, 22, 108, 94], [68, 50, 24, 122, 94], [62, 46, 20, 106, 82], [54, 40, 18, 88, 68]]
  },
  '运球突破': {
    zzx: [[40, 35, 30, 30, 40], [55, 50, 40, 70, 72], [70, 60, 48, 90, 80], [85, 66, 50, 100, 82], [98, 70, 52, 105, 82], [90, 64, 46, 95, 72]],
    lmc: [[38, 30, 28, 35, 45], [52, 46, 36, 75, 78], [65, 55, 42, 95, 86], [80, 62, 44, 105, 86], [92, 66, 44, 110, 86], [84, 60, 40, 100, 76]],
    ch: [[39, 33, 30, 32, 42], [54, 48, 40, 72, 74], [68, 58, 46, 92, 82], [83, 64, 48, 100, 84], [96, 68, 50, 100, 86], [88, 62, 44, 92, 74]],
    ww: [[40, 34, 32, 30, 40], [55, 50, 42, 70, 72], [70, 60, 50, 92, 78], [85, 66, 54, 96, 78], [98, 70, 55, 96, 78], [90, 64, 48, 88, 70]],
    zl: [[36, 30, 26, 34, 46], [50, 46, 36, 76, 80], [63, 56, 42, 96, 86], [78, 62, 44, 106, 86], [90, 66, 44, 110, 84], [82, 60, 40, 98, 76]]
  }
};

export const JOINT_ANGLE_DATA = {
  '张子轩': {
    player: { name: '张子轩', number: 23, team: '东莞宏远', position: '得分后卫' },
    actions: {
      '投篮出手': A('投篮出手', 87, [
        ['shoulder', 71, 'ok', '出手阶段'], ['elbow', 111, 'ok', '出手阶段'], ['wrist', 162, 'ok', '拨球阶段'],
        ['hip', 174, 'ok', '蹬伸阶段'], ['knee', 168, 'ok', '屈膝阶段']
      ]),
      '防守滑步': A('防守滑步', 84, [
        ['shoulder', 72, 'ok', '滑步阶段'], ['elbow', 58, 'ok', '滑步阶段'], ['wrist', 28, 'ok', '滑步阶段'],
        ['hip', 118, 'ok', '屈膝阶段'], ['knee', 92, 'warn', '屈膝阶段']
      ]),
      '运球突破': A('运球突破', 85, [
        ['shoulder', 98, 'ok', '突破阶段'], ['elbow', 70, 'ok', '运球阶段'], ['wrist', 52, 'ok', '运球阶段'],
        ['hip', 105, 'ok', '突破阶段'], ['knee', 82, 'ok', '屈膝阶段']
      ])
    }
  },
  '李明超': {
    player: { name: '李明超', number: 7, team: '东莞宏远', position: '中锋' },
    actions: {
      '投篮出手': A('投篮出手', 81, [
        ['shoulder', 118, 'warn', '出手阶段'], ['elbow', 82, 'ok', '出手阶段'], ['wrist', 42, 'ok', '拨球阶段'],
        ['hip', 115, 'ok', '蹬伸阶段'], ['knee', 65, 'ok', '屈膝阶段']
      ]),
      '防守滑步': A('防守滑步', 86, [
        ['shoulder', 68, 'ok', '滑步阶段'], ['elbow', 52, 'ok', '滑步阶段'], ['wrist', 24, 'ok', '滑步阶段'],
        ['hip', 122, 'warn', '屈膝阶段'], ['knee', 96, 'warn', '屈膝阶段']
      ]),
      '运球突破': A('运球突破', 75, [
        ['shoulder', 92, 'warn', '突破阶段'], ['elbow', 66, 'ok', '运球阶段'], ['wrist', 44, 'ok', '运球阶段'],
        ['hip', 110, 'ok', '突破阶段'], ['knee', 86, 'warn', '屈膝阶段']
      ])
    }
  },
  '陈浩': {
    player: { name: '陈浩', number: 15, team: '东莞宏远', position: '小前锋' },
    actions: {
      '投篮出手': A('投篮出手', 84, [
        ['shoulder', 125, 'ok', '出手阶段'], ['elbow', 92, 'ok', '出手阶段'], ['wrist', 48, 'ok', '拨球阶段'],
        ['hip', 102, 'ok', '蹬伸阶段'], ['knee', 70, 'ok', '屈膝阶段']
      ]),
      '防守滑步': A('防守滑步', 83, [
        ['shoulder', 72, 'ok', '滑步阶段'], ['elbow', 55, 'ok', '滑步阶段'], ['wrist', 26, 'ok', '滑步阶段'],
        ['hip', 112, 'ok', '屈膝阶段'], ['knee', 92, 'warn', '屈膝阶段']
      ]),
      '运球突破': A('运球突破', 83, [
        ['shoulder', 96, 'ok', '突破阶段'], ['elbow', 68, 'ok', '运球阶段'], ['wrist', 50, 'ok', '运球阶段'],
        ['hip', 100, 'ok', '突破阶段'], ['knee', 86, 'warn', '屈膝阶段']
      ])
    }
  },
  '王伟': {
    player: { name: '王伟', number: 9, team: '东莞宏远', position: '控球后卫' },
    actions: {
      '投篮出手': A('投篮出手', 86, [
        ['shoulder', 128, 'ok', '出手阶段'], ['elbow', 90, 'ok', '出手阶段'], ['wrist', 50, 'ok', '拨球阶段'],
        ['hip', 105, 'ok', '蹬伸阶段'], ['knee', 68, 'ok', '屈膝阶段']
      ]),
      '防守滑步': A('防守滑步', 85, [
        ['shoulder', 74, 'ok', '滑步阶段'], ['elbow', 54, 'ok', '滑步阶段'], ['wrist', 30, 'ok', '滑步阶段'],
        ['hip', 116, 'ok', '屈膝阶段'], ['knee', 90, 'ok', '屈膝阶段']
      ]),
      '运球突破': A('运球突破', 88, [
        ['shoulder', 98, 'ok', '突破阶段'], ['elbow', 70, 'ok', '运球阶段'], ['wrist', 55, 'ok', '运球阶段'],
        ['hip', 96, 'ok', '突破阶段'], ['knee', 78, 'ok', '屈膝阶段']
      ])
    }
  },
  '赵磊': {
    player: { name: '赵磊', number: 31, team: '东莞宏远', position: '大前锋' },
    actions: {
      '投篮出手': A('投篮出手', 79, [
        ['shoulder', 115, 'warn', '出手阶段'], ['elbow', 80, 'ok', '出手阶段'], ['wrist', 38, 'ok', '拨球阶段'],
        ['hip', 118, 'ok', '蹬伸阶段'], ['knee', 66, 'ok', '屈膝阶段']
      ]),
      '防守滑步': A('防守滑步', 84, [
        ['shoulder', 68, 'ok', '滑步阶段'], ['elbow', 50, 'ok', '滑步阶段'], ['wrist', 24, 'ok', '滑步阶段'],
        ['hip', 122, 'warn', '屈膝阶段'], ['knee', 94, 'warn', '屈膝阶段']
      ]),
      '运球突破': A('运球突破', 76, [
        ['shoulder', 90, 'warn', '突破阶段'], ['elbow', 66, 'ok', '运球阶段'], ['wrist', 44, 'ok', '运球阶段'],
        ['hip', 110, 'ok', '突破阶段'], ['knee', 84, 'warn', '屈膝阶段']
      ])
    }
  }
};

/* 将球员名映射到时序数据 key */
const TIMELINE_BY_PLAYER = {
  '张子轩': 'zzx',
  '李明超': 'lmc',
  '陈浩': 'ch',
  '王伟': 'ww',
  '赵磊': 'zl'
};

export const getJointAngleData = (playerName, action) => {
  const player = JOINT_ANGLE_DATA[playerName];
  if (!player) return null;
  const data = player.actions[action];
  if (!data) return null;
  const key = TIMELINE_BY_PLAYER[playerName];
  return { ...data, timeline: T(action, TIMELINES[action][key]) };
};

/* ======================== 发力时序：球员多套数据 ======================== */
const FORCE_STAGES = {
  lower: { name: '下肢蹬伸', color: 'ok', detail: '膝关节伸展+踝关节跖屈，产生向上蹬地力', ideal: '100-140ms' },
  trunk: { name: '躯干传导', color: 'brand', detail: '核心肌群稳定，力量从下肢传导至上肢', ideal: '90-120ms' },
  upper: { name: '上肢出手', color: 'info', detail: '肩-肘-腕依次发力，完成出手动作', ideal: '80-120ms' }
};

const makeForceCurve = (peak, peakT) => Array.from({ length: 28 }, (_, i) => {
  const t = i * 20;
  const f = t <= peakT ? 20 + (peak - 20) * (t / peakT) : peak * Math.exp(-(t - peakT) / 120);
  return { t, f: Math.round(f) };
});

const buildForceTiming = (playerName, spec) => {
  const stage = (id, startMs, durationMs, power, status) => ({
    id,
    ...FORCE_STAGES[id],
    startMs,
    durationMs,
    power,
    status
  });
  return {
    player: { name: playerName, number: spec.number },
    phases: spec.phases.map((p) => stage(p.id, p.start, p.dur, p.power, p.status)),
    overlap: spec.overlap,
    forceCurve: makeForceCurve(spec.peak, spec.peakT),
    efficiency: spec.efficiency,
    comparison: { player: playerName, score: spec.efficiency.score, teamAvg: 76, leagueAvg: 72 }
  };
};

export const FORCE_TIMING_DATA = {
  '张子轩': buildForceTiming('张子轩', {
    number: 23,
    phases: [
      { id: 'lower', start: 0, dur: 120, power: 85, status: 'ok' },
      { id: 'trunk', start: 100, dur: 100, power: 72, status: 'ok' },
      { id: 'upper', start: 180, dur: 100, power: 91, status: 'ok' }
    ],
    overlap: { lowerTrunk: 20, trunkUpper: 20, totalOverlap: 40, ideal: '30-50ms', status: 'ok' },
    peak: 95,
    peakT: 200,
    efficiency: { score: 88, grade: 'A', assessment: '发力链路完整，各阶段衔接流畅，力量传导效率优秀' }
  }),
  '李明超': buildForceTiming('李明超', {
    number: 7,
    phases: [
      { id: 'lower', start: 0, dur: 140, power: 92, status: 'ok' },
      { id: 'trunk', start: 110, dur: 110, power: 70, status: 'ok' },
      { id: 'upper', start: 200, dur: 90, power: 68, status: 'warn' }
    ],
    overlap: { lowerTrunk: 30, trunkUpper: 20, totalOverlap: 50, ideal: '30-50ms', status: 'ok' },
    peak: 92,
    peakT: 160,
    efficiency: { score: 82, grade: 'B+', assessment: '下肢力量强劲但上肢发力偏弱，建议加强肩肘力量训练' }
  }),
  '陈浩': buildForceTiming('陈浩', {
    number: 15,
    phases: [
      { id: 'lower', start: 0, dur: 120, power: 88, status: 'ok' },
      { id: 'trunk', start: 100, dur: 105, power: 78, status: 'ok' },
      { id: 'upper', start: 185, dur: 95, power: 85, status: 'ok' }
    ],
    overlap: { lowerTrunk: 20, trunkUpper: 20, totalOverlap: 40, ideal: '30-50ms', status: 'ok' },
    peak: 88,
    peakT: 220,
    efficiency: { score: 85, grade: 'A-', assessment: '三阶段发力均衡，动力链衔接稳定' }
  }),
  '王伟': buildForceTiming('王伟', {
    number: 9,
    phases: [
      { id: 'lower', start: 0, dur: 110, power: 84, status: 'ok' },
      { id: 'trunk', start: 95, dur: 90, power: 80, status: 'ok' },
      { id: 'upper', start: 165, dur: 90, power: 90, status: 'ok' }
    ],
    overlap: { lowerTrunk: 15, trunkUpper: 25, totalOverlap: 40, ideal: '30-50ms', status: 'ok' },
    peak: 90,
    peakT: 180,
    efficiency: { score: 87, grade: 'A', assessment: '出手环节快速，力量传递高效，动作干净利落' }
  }),
  '赵磊': buildForceTiming('赵磊', {
    number: 31,
    phases: [
      { id: 'lower', start: 0, dur: 130, power: 80, status: 'ok' },
      { id: 'trunk', start: 100, dur: 115, power: 62, status: 'warn' },
      { id: 'upper', start: 195, dur: 85, power: 75, status: 'ok' }
    ],
    overlap: { lowerTrunk: 30, trunkUpper: 20, totalOverlap: 50, ideal: '30-50ms', status: 'ok' },
    peak: 82,
    peakT: 220,
    efficiency: { score: 78, grade: 'B', assessment: '躯干传导偏弱，核心力量不足，建议加强核心稳定训练' }
  })
};

export const getForceTimingData = (playerName) => FORCE_TIMING_DATA[playerName] || null;

/* ======================== 重心轨迹：球员 × 动作序列多套数据 ======================== */
const COURT_GEOM = [
  { x: 62, y: 318, phase: 'start', label: '起步' },
  { x: 92, y: 282, phase: 'dribble', label: '运球推进' },
  { x: 126, y: 244, phase: 'dribble', label: '变向' },
  { x: 158, y: 204, phase: 'dribble', label: '加速突破' },
  { x: 174, y: 168, phase: 'stop', label: '急停' },
  { x: 172, y: 138, phase: 'jump', label: '起跳上升' },
  { x: 168, y: 116, phase: 'jump', label: '最高点' },
  { x: 164, y: 132, phase: 'jump', label: '出手' },
  { x: 160, y: 154, phase: 'land', label: '落地' },
  { x: 156, y: 172, phase: 'land', label: '稳定' }
];

const hProfile = (peak) => [93, 90, 88, 88, 95, Math.round(peak * 0.85), peak, Math.round(peak * 0.82), 92, 94];

const COG_PLAYERS = {
  '张子轩': { number: 23, basePeak: 135, stab: [92, 88, 76], cog: 89 },
  '李明超': { number: 7, basePeak: 138, stab: [90, 85, 82], cog: 86 },
  '陈浩': { number: 15, basePeak: 136, stab: [91, 89, 80], cog: 90 },
  '王伟': { number: 9, basePeak: 140, stab: [93, 91, 78], cog: 92 },
  '赵磊': { number: 31, basePeak: 132, stab: [88, 84, 74], cog: 85 }
};

const COG_SEQUENCES = {
  '运球突破→急停跳投': {
    jumpDelta: 0,
    landDelta: 0,
    phaseNames: ['运球突破', '起跳阶段', '落地阶段'],
    durations: ['1.2s', '0.4s', '0.3s'],
    heightRanges: ['88-95cm', '95-135cm', '92-108cm'],
    descs: ['重心控制稳定，变向流畅', '起跳高度充分，垂直速度优秀', '落地略有前倾，建议加强落地缓冲训练'],
    warnPrefix: '落地阶段重心略有前倾'
  },
  '快攻→战斧扣篮': {
    jumpDelta: 10,
    landDelta: 6,
    phaseNames: ['快攻推进', '起跳扣篮', '落地缓冲'],
    durations: ['0.9s', '0.5s', '0.4s'],
    heightRanges: ['88-96cm', '96-152cm', '94-116cm'],
    descs: ['直线推进节奏好，重心平稳', '扣篮起跳充分，滞空时间优秀', '落地缓冲良好，重心控制佳'],
    warnPrefix: '落地缓冲总体良好'
  },
  '接球→干拔三分': {
    jumpDelta: -8,
    landDelta: 2,
    phaseNames: ['接球调整', '干拔起跳', '落地回防'],
    durations: ['0.7s', '0.4s', '0.3s'],
    heightRanges: ['88-94cm', '94-128cm', '92-104cm'],
    descs: ['接球重心调整及时', '干拔起跳高度适中', '落地后回防衔接顺畅'],
    warnPrefix: '落地重心略有不稳'
  }
};

const buildHeightCurve = (courtPath) => {
  const N = 30;
  const totalT = 1.9;
  return Array.from({ length: N }, (_, i) => {
    const progress = i / (N - 1);
    const pos = progress * (courtPath.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = courtPath[idx];
    const b = courtPath[Math.min(idx + 1, courtPath.length - 1)];
    return { t: +(progress * totalT).toFixed(2), h: Math.round(a.h + (b.h - a.h) * frac) };
  });
};

const buildCogData = (playerName, seqKey) => {
  const pl = COG_PLAYERS[playerName];
  const seq = COG_SEQUENCES[seqKey];
  const peak = pl.basePeak + seq.jumpDelta;
  const courtPath = COURT_GEOM.map((g, i) => ({ ...g, h: hProfile(peak)[i] }));
  const stab = [pl.stab[0], pl.stab[1], pl.stab[2] + seq.landDelta];
  const phases = seq.phaseNames.map((name, i) => ({
    name,
    duration: seq.durations[i],
    heightRange: seq.heightRanges[i],
    stability: stab[i],
    desc: seq.descs[i],
    status: stab[i] >= 88 ? 'ok' : stab[i] >= 80 ? 'warn' : 'danger'
  }));
  const metrics = {
    maxHeight: peak,
    jumpHeight: peak - 88,
    landingStability: stab[2],
    cogControl: pl.cog
  };
  return {
    player: { name: playerName, number: pl.number },
    action: seqKey,
    courtPath,
    heightCurve: buildHeightCurve(courtPath),
    phases,
    metrics,
    warning: `${seq.warnPrefix}（稳定度${stab[2]}%），建议增加落地缓冲与单腿稳定训练，降低ACL损伤风险`
  };
};

export const COG_TRAJECTORY_DATA = Object.fromEntries(
  Object.keys(COG_PLAYERS).map((name) => [
    name,
    {
      player: { name, number: COG_PLAYERS[name].number },
      sequences: Object.fromEntries(Object.keys(COG_SEQUENCES).map((seq) => [seq, buildCogData(name, seq)]))
    }
  ])
);

export const COG_SEQUENCE_KEYS = Object.keys(COG_SEQUENCES);

export const getCogTrajectoryData = (playerName, action) =>
  COG_TRAJECTORY_DATA[playerName]?.sequences[action] || null;

/* ======================== 动作对称性：球员多套数据 ======================== */
const SYM_SHORT = {
  '下肢蹬伸力': '蹬伸力',
  '上肢推力': '上肢推力',
  '侧向移动速度': '移动速度',
  '单腿起跳高度': '起跳高度',
  '落地缓冲稳定性': '落地稳定'
};

const SYM_NUMBER = { '张子轩': 23, '李明超': 7, '陈浩': 15, '王伟': 9, '赵磊': 31 };

const buildSymmetryHistory = (finalValue, count = 60) => {
  const start = new Date(2026, 5, 7);
  const result = [];
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const noise = (Math.sin(i * 0.7) * 0.3 + (i % 5) * 0.05) * 0.4;
    const value = finalValue - 7 * (1 - progress) + noise;
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    result.push({
      date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      value: Math.round(value * 10) / 10
    });
  }
  result[result.length - 1].value = finalValue;
  return result;
};

const buildSymmetryData = (playerName, items, risk) => {
  const statusOf = (sym) => (sym >= 90 ? 'ok' : sym >= 85 ? 'warn' : 'danger');
  const symmetryData = items.map(([metric, left, right, unit]) => {
    const symmetry = Math.round((Math.min(left, right) / Math.max(left, right)) * 100);
    return { metric, left, right, unit, symmetry, status: statusOf(symmetry) };
  });
  const overallSymmetry = +(symmetryData.reduce((s, d) => s + d.symmetry, 0) / symmetryData.length).toFixed(1);
  const radarData = symmetryData.map((d) => ({ label: SYM_SHORT[d.metric], value: d.symmetry }));
  return {
    player: { name: playerName, number: SYM_NUMBER[playerName] },
    symmetryData,
    radarData,
    overallSymmetry,
    riskLevel: { level: risk.level, color: risk.color, desc: risk.desc },
    history: buildSymmetryHistory(overallSymmetry)
  };
};

export const SYMMETRY_DATA = {
  '张子轩': buildSymmetryData('张子轩', [
    ['下肢蹬伸力', 425, 460, 'N'],
    ['上肢推力', 185, 198, 'N'],
    ['侧向移动速度', 3.2, 3.5, 'm/s'],
    ['单腿起跳高度', 42, 48, 'cm'],
    ['落地缓冲稳定性', 82, 91, '%']
  ], {
    level: '低风险',
    color: 'ok',
    desc: '左右侧发力基本均衡，单腿起跳高度差异略大（左42cm/右48cm），建议加强弱侧腿训练'
  }),
  '李明超': buildSymmetryData('李明超', [
    ['下肢蹬伸力', 500, 540, 'N'],
    ['上肢推力', 205, 220, 'N'],
    ['侧向移动速度', 3.0, 3.3, 'm/s'],
    ['单腿起跳高度', 38, 45, 'cm'],
    ['落地缓冲稳定性', 85, 93, '%']
  ], {
    level: '低风险',
    color: 'ok',
    desc: '左右侧发力基本均衡，单腿起跳高度差异略大（左38cm/右45cm），建议加强弱侧腿力量'
  }),
  '陈浩': buildSymmetryData('陈浩', [
    ['下肢蹬伸力', 448, 465, 'N'],
    ['上肢推力', 190, 198, 'N'],
    ['侧向移动速度', 3.3, 3.4, 'm/s'],
    ['单腿起跳高度', 45, 47, 'cm'],
    ['落地缓冲稳定性', 88, 91, '%']
  ], {
    level: '低风险',
    color: 'ok',
    desc: '左右侧发力非常均衡，各指标对称度均高于96%，保持现有训练体系'
  }),
  '王伟': buildSymmetryData('王伟', [
    ['下肢蹬伸力', 398, 430, 'N'],
    ['上肢推力', 172, 185, 'N'],
    ['侧向移动速度', 3.4, 3.7, 'm/s'],
    ['单腿起跳高度', 44, 51, 'cm'],
    ['落地缓冲稳定性', 80, 90, '%']
  ], {
    level: '中低风险',
    color: 'warn',
    desc: '落地缓冲与单腿起跳差异偏大，建议增加弱侧下肢力量训练'
  }),
  '赵磊': buildSymmetryData('赵磊', [
    ['下肢蹬伸力', 470, 510, 'N'],
    ['上肢推力', 195, 215, 'N'],
    ['侧向移动速度', 2.9, 3.3, 'm/s'],
    ['单腿起跳高度', 36, 44, 'cm'],
    ['落地缓冲稳定性', 78, 90, '%']
  ], {
    level: '中风险',
    color: 'warn',
    desc: '多处指标对称度偏低（起跳高度82%/落地稳定87%），存在过度使用性损伤风险，建议安排专项纠正训练'
  })
};

export const getSymmetryData = (playerName) => SYMMETRY_DATA[playerName] || null;

/* ======================== 疲劳衰减曲线：球员 × 比赛多套数据 ======================== */
const FATIGUE_PLAYERS = {
  '张子轩': { number: 23, minutes: 32, q1: { speed: 5.8, angle: 52.3, sprint: 12, jump: 48, hr: 165 }, fatigue: 68 },
  '李明超': { number: 7, minutes: 28, q1: { speed: 5.2, angle: 51.0, sprint: 8, jump: 45, hr: 170 }, fatigue: 62 },
  '陈浩': { number: 15, minutes: 30, q1: { speed: 5.5, angle: 51.5, sprint: 10, jump: 46, hr: 168 }, fatigue: 65 },
  '王伟': { number: 9, minutes: 34, q1: { speed: 5.6, angle: 52.0, sprint: 13, jump: 44, hr: 172 }, fatigue: 70 },
  '赵磊': { number: 31, minutes: 26, q1: { speed: 5.3, angle: 50.5, sprint: 9, jump: 47, hr: 175 }, fatigue: 66 }
};

const FATIGUE_MATCH_INTENSITY = { '粤BA半决赛': 1.0, '省青赛决赛': 1.25, '城联赛': 0.8 };
const FATIGUE_MATCH_ADJUST = { '粤BA半决赛': 0, '省青赛决赛': 8, '城联赛': -6 };
export const FATIGUE_MATCH_KEYS = Object.keys(FATIGUE_MATCH_ADJUST);

const FATIGUE_DROPS = {
  speed: [0, 0.052, 0.121, 0.207],
  angle: [0, 0.01, 0.042, 0.092],
  sprint: [0, 0.167, 0.333, 0.5],
  jump: [0, 0.042, 0.104, 0.188]
};
const FATIGUE_HR_RISE = [0, 0.042, 0.079, 0.121];

const FATIGUE_THRESHOLD = {
  speed: { warn: 15, danger: 25 },
  angle: { warn: 10, danger: 15 },
  sprint: { warn: 40, danger: 50 },
  jump: { warn: 15, danger: 22 },
  hr: { warn: 15, danger: 22 }
};

const round1 = (v) => Math.round(v * 10) / 10;

const buildFatigueData = (playerName, match) => {
  const pl = FATIGUE_PLAYERS[playerName];
  const intensity = FATIGUE_MATCH_INTENSITY[match];
  const drop = (metric, q) => FATIGUE_DROPS[metric][q - 1] * intensity;

  const quarterData = [1, 2, 3, 4].map((q) => ({
    quarter: `Q${q}`,
    speed: round1(pl.q1.speed * (1 - drop('speed', q))),
    shotAngle: round1(pl.q1.angle * (1 - drop('angle', q))),
    sprintCount: Math.max(0, Math.round(pl.q1.sprint * (1 - drop('sprint', q)))),
    jumpHeight: Math.max(0, Math.round(pl.q1.jump * (1 - drop('jump', q)))),
    heartRate: Math.round(pl.q1.hr * (1 + FATIGUE_HR_RISE[q - 1] * intensity))
  }));

  const q1 = quarterData[0];
  const q4 = quarterData[3];
  const defs = [
    { key: 'speed', label: '跑动速度', unit: 'm/s', a: q1.speed, b: q4.speed },
    { key: 'angle', label: '投篮角度', unit: '°', a: q1.shotAngle, b: q4.shotAngle },
    { key: 'sprint', label: '冲刺次数', unit: '次', a: q1.sprintCount, b: q4.sprintCount },
    { key: 'jump', label: '起跳高度', unit: 'cm', a: q1.jumpHeight, b: q4.jumpHeight },
    { key: 'hr', label: '心率', unit: 'bpm', a: q1.heartRate, b: q4.heartRate, rising: true }
  ];

  const decayMetrics = defs.map((d) => {
    const decay = Math.round((Math.abs(d.b - d.a) / d.a) * 1000) / 10;
    const th = FATIGUE_THRESHOLD[d.key];
    const status = decay >= th.danger ? 'danger' : decay > th.warn ? 'warn' : 'ok';
    return { metric: d.label, q1: d.a, q4: d.b, decay, unit: d.unit, status, ideal: th.warn, rising: !!d.rising };
  });

  const score = Math.max(30, Math.min(95, pl.fatigue + FATIGUE_MATCH_ADJUST[match]));
  const level =
    score < 60
      ? { grade: 'B-', level: '轻度疲劳' }
      : score < 70
        ? { grade: 'C+', level: '中度疲劳' }
        : score < 80
          ? { grade: 'C', level: '偏重度疲劳' }
          : { grade: 'D', level: '重度疲劳' };

  const speed = decayMetrics[0];
  const sprint = decayMetrics[2];
  const suggestion = `建议第四节 8分钟时换下休息，当前Q4速度衰减${speed.decay}%已超警戒线${speed.ideal}%，冲刺能力下降${sprint.decay}%为${sprint.decay >= 40 ? '重度' : '中度'}衰减`;

  return {
    player: { name: playerName, number: pl.number, minutes: pl.minutes },
    quarterData,
    decayMetrics,
    fatigueIndex: {
      score,
      grade: level.grade,
      level: level.level,
      desc: `${level.level}：第四节速度与冲刺次数显著下降，建议第四节中段安排轮换休息`
    },
    comparison: { player: playerName, fatigueScore: score, teamAvg: 75, leagueAvg: 78 },
    suggestion
  };
};

export const FATIGUE_DATA = Object.fromEntries(
  Object.keys(FATIGUE_PLAYERS).map((name) => [
    name,
    Object.fromEntries(Object.keys(FATIGUE_MATCH_ADJUST).map((match) => [match, buildFatigueData(name, match)]))
  ])
);

export const getFatigueData = (playerName, match) => FATIGUE_DATA[playerName]?.[match] || null;

export default {
  JOINT_ANGLE_DATA,
  getJointAngleData,
  FORCE_TIMING_DATA,
  getForceTimingData,
  COG_TRAJECTORY_DATA,
  COG_SEQUENCE_KEYS,
  getCogTrajectoryData,
  SYMMETRY_DATA,
  getSymmetryData,
  FATIGUE_DATA,
  FATIGUE_MATCH_KEYS,
  getFatigueData
};
