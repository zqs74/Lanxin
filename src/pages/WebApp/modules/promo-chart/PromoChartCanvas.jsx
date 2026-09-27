/**
 * 多平台宣发 · 画布（横版 1200×700）
 *
 * 做成**桌面软件操作界面**的样子，与 PPT「赛事宣发」页左边那张剪辑系统截图同一路数：
 *   标题栏（软件名 + 版本 + 用户 + 窗口按钮）
 *   菜单栏（文件 / 编辑 / 素材 / 账号 / 发布 / 数据 / 帮助）
 *   工具栏（新建发布任务 / 一键分发 / 定时发布 / 内容模板 / 水印设置 + 搜索）
 *   主体三栏：左导航 ｜ 中间发布任务表 + 选中任务的发布详情 ｜ 右侧账号矩阵
 *   底部状态栏
 *
 * 全部内联属性 SVG，导出 PNG 时不需要外部资源。
 */
import React from 'react'
import { PROMO_CANVAS, PROMO_UI } from './promoChartData.js'

const W = PROMO_CANVAS.width
const H = PROMO_CANVAS.height

const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

const C = {
  pageBg: '#E9E6E0',
  window: '#FFFFFF',
  titleBar: '#EDEAE4',
  menuBg: '#FFFFFF',
  navBg: '#F4F1EB',
  navActive: '#FFFFFF',
  headBg: '#F1EEE7',
  rowAlt: '#FAF8F5',
  rowActive: '#EFEAE0',
  line: 'rgba(27,36,50,0.12)',
  border: 'rgba(27,36,50,0.16)',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
  brand: '#B8791F',
  ok: '#0E9F6E',
  doing: '#3B82F6',
  wait: '#8B5CF6',
}

const WIN = { x: 8, y: 8, w: W - 16, h: H - 16, r: 10 }
const TITLE_H = 42
const MENU_H = 32
const TOOL_H = 44
const STATUS_H = 28

const BODY_TOP = WIN.y + TITLE_H + MENU_H + TOOL_H // 126
const BODY_BOTTOM = WIN.y + WIN.h - STATUS_H // 664

const NAV_X = WIN.x
const NAV_W = 188
const MID_X = NAV_X + NAV_W // 196
const RIGHT_X = 884
const RIGHT_W = WIN.x + WIN.w - RIGHT_X // 308

const MID_W = RIGHT_X - MID_X
/** 表头列位置（中栏 196..884，五列要留够间距） */
const COL = {
  title: MID_X + 20,
  channels: 560,
  state: 650,
  time: 762,
  views: RIGHT_X - 16,
}

const TASK_ROW_H = 68
const TASK_TOP = BODY_TOP + 38
const DETAIL_TOP = TASK_TOP + PROMO_UI.tasks.length * TASK_ROW_H

const stateTone = (tone) => {
  if (tone === 'ok') return C.ok
  if (tone === 'doing') return C.doing
  if (tone === 'wait') return C.wait
  return C.dim
}

export function PromoCanvas() {
  const detail = PROMO_UI.detail

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="多平台宣发 · 宣发助手">
      <rect x="0" y="0" width={W} height={H} fill={C.pageBg} />

      {/* 窗口 */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={WIN.r} fill={C.window} stroke={C.border} strokeWidth="1" />

      {/* 标题栏 */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={TITLE_H} rx={WIN.r} fill={C.titleBar} />
      <rect x={WIN.x} y={WIN.y + TITLE_H - WIN.r} width={WIN.w} height={WIN.r} fill={C.titleBar} />
      <rect x={WIN.x + 16} y={WIN.y + 10} width="22" height="22" rx="6" fill={C.brand} />
      <text x={WIN.x + 27} y={WIN.y + 26} textAnchor="middle" fontFamily={FONT} fontSize="13" fontWeight="800" fill="#FFFFFF">
        S
      </text>
      <text x={WIN.x + 48} y={WIN.y + 27} fontFamily={FONT} fontSize="15" fontWeight="800" fill={C.text}>
        {PROMO_UI.app.name}
      </text>
      <text x={WIN.x + 168} y={WIN.y + 27} fontFamily={FONT} fontSize="12" fill={C.dim}>
        {PROMO_UI.app.version}
      </text>
      <text
        x={WIN.x + WIN.w - 24 - 68}
        y={WIN.y + 26}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="12.5"
        fill={C.muted}
      >
        {PROMO_UI.app.user}
      </text>
      {/* 窗口按钮 */}
      {[0, 1, 2].map((index) => (
        <g key={`winbtn-${index}`}>
          <rect
            x={WIN.x + WIN.w - 24 - 44 + index * 22}
            y={WIN.y + 16}
            width="16"
            height="16"
            rx="4"
            fill={index === 2 ? '#E4572E' : 'rgba(27,36,50,0.08)'}
          />
          <rect
            x={WIN.x + WIN.w - 24 - 44 + index * 22 + 4}
            y={WIN.y + 23}
            width="8"
            height="1.5"
            rx="0.75"
            fill={index === 2 ? '#FFFFFF' : C.muted}
          />
        </g>
      ))}

      {/* 菜单栏 */}
      <rect x={WIN.x} y={WIN.y + TITLE_H} width={WIN.w} height={MENU_H} fill={C.menuBg} />
      <line
        x1={WIN.x}
        y1={WIN.y + TITLE_H + MENU_H}
        x2={WIN.x + WIN.w}
        y2={WIN.y + TITLE_H + MENU_H}
        stroke={C.line}
        strokeWidth="1"
      />
      {PROMO_UI.menus.map((menu, index) => (
        <text
          key={menu}
          x={WIN.x + 24 + index * 52}
          y={WIN.y + TITLE_H + 21}
          fontFamily={FONT}
          fontSize="13"
          fontWeight={menu === '发布' ? '800' : '400'}
          fill={menu === '发布' ? C.brand : C.text}
        >
          {menu}
        </text>
      ))}

      {/* 工具栏 */}
      <rect x={WIN.x} y={WIN.y + TITLE_H + MENU_H} width={WIN.w} height={TOOL_H} fill={C.menuBg} />
      {PROMO_UI.tools.map((tool, index) => {
        const primary = index === 0
        const x = WIN.x + 16 + (index === 0 ? 0 : 128 + (index - 1) * 100)
        const w = index === 0 ? 118 : 90
        return (
          <g key={tool}>
            <rect
              x={x}
              y={WIN.y + TITLE_H + MENU_H + 8}
              width={w}
              height="30"
              rx="8"
              fill={primary ? C.brand : C.headBg}
              stroke={primary ? C.brand : C.border}
              strokeWidth="1"
            />
            <text
              x={x + w / 2}
              y={WIN.y + TITLE_H + MENU_H + 27}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="12.5"
              fontWeight="700"
              fill={primary ? '#FFFFFF' : C.text}
            >
              {tool}
            </text>
          </g>
        )
      })}
      <rect
        x={WIN.x + WIN.w - 292}
        y={WIN.y + TITLE_H + MENU_H + 8}
        width="268"
        height="30"
        rx="15"
        fill={C.navBg}
        stroke={C.border}
        strokeWidth="1"
      />
      <text
        x={WIN.x + WIN.w - 292 + 17}
        y={WIN.y + TITLE_H + MENU_H + 27}
        fontFamily={FONT}
        fontSize="12.5"
        fill={C.dim}
      >
        {PROMO_UI.search}
      </text>
      <line x1={WIN.x} y1={BODY_TOP} x2={WIN.x + WIN.w} y2={BODY_TOP} stroke={C.line} strokeWidth="1" />

      {/* 左侧导航 */}
      <rect x={NAV_X} y={BODY_TOP} width={NAV_W} height={BODY_BOTTOM - BODY_TOP} fill={C.navBg} />
      <line x1={MID_X} y1={BODY_TOP} x2={MID_X} y2={BODY_BOTTOM} stroke={C.line} strokeWidth="1" />
      {PROMO_UI.nav.map((item, index) => {
        const top = BODY_TOP + 16 + index * 46
        return (
          <g key={item.name}>
            {item.active ? (
              <>
                <rect x={NAV_X + 8} y={top} width={NAV_W - 16} height="40" rx="8" fill={C.navActive} />
                <rect x={NAV_X + 8} y={top + 10} width="3" height="20" rx="1.5" fill={C.brand} />
              </>
            ) : null}
            <circle cx={NAV_X + 30} cy={top + 20} r="4" fill={item.active ? C.brand : C.dim} />
            <text
              x={NAV_X + 46}
              y={top + 25}
              fontFamily={FONT}
              fontSize="13.5"
              fontWeight={item.active ? '800' : '400'}
              fill={item.active ? C.text : C.muted}
            >
              {item.name}
            </text>
            {item.count ? (
              <text x={NAV_X + NAV_W - 20} y={top + 25} textAnchor="end" fontFamily={FONT} fontSize="12" fill={C.dim}>
                {item.count}
              </text>
            ) : null}
          </g>
        )
      })}

      {/* 中间：发布任务表 */}
      <rect x={MID_X} y={BODY_TOP} width={MID_W} height="38" fill={C.headBg} />
      {[
        { label: PROMO_UI.columns[0], x: COL.title, anchor: 'start' },
        { label: PROMO_UI.columns[1], x: COL.channels, anchor: 'middle' },
        { label: PROMO_UI.columns[2], x: COL.state, anchor: 'middle' },
        { label: PROMO_UI.columns[3], x: COL.time, anchor: 'middle' },
        { label: PROMO_UI.columns[4], x: COL.views, anchor: 'end' },
      ].map((col) => (
        <text
          key={col.label}
          x={col.x}
          y={BODY_TOP + 24}
          textAnchor={col.anchor}
          fontFamily={FONT}
          fontSize="13"
          fontWeight="700"
          fill={C.muted}
        >
          {col.label}
        </text>
      ))}

      {PROMO_UI.tasks.map((task, index) => {
        const top = TASK_TOP + index * TASK_ROW_H
        const tone = stateTone(task.tone)
        return (
          <g key={task.title}>
            <rect
              x={MID_X}
              y={top}
              width={RIGHT_X - MID_X}
              height={TASK_ROW_H}
              fill={task.selected ? C.rowActive : index % 2 === 1 ? C.rowAlt : C.window}
            />
            {task.selected ? <rect x={MID_X} y={top} width="3" height={TASK_ROW_H} fill={C.brand} /> : null}
            <text x={COL.title} y={top + 40} fontFamily={FONT} fontSize="14" fontWeight="700" fill={C.text}>
              {task.title}
            </text>
            <text x={COL.channels} y={top + 40} textAnchor="middle" fontFamily={FONT} fontSize="13" fill={C.muted}>
              {task.channels}
            </text>
            <rect x={COL.state - 33} y={top + 23} width="66" height="22" rx="11" fill={tone} opacity="0.14" />
            <text
              x={COL.state}
              y={top + 38}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="12"
              fontWeight="700"
              fill={tone}
            >
              {task.state}
            </text>
            <text x={COL.time} y={top + 40} textAnchor="middle" fontFamily={FONT} fontSize="12.5" fill={C.muted}>
              {task.time}
            </text>
            <text
              x={COL.views}
              y={top + 40}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="14"
              fontWeight="800"
              fill={task.views === '—' ? C.dim : C.brand}
            >
              {task.views}
            </text>
            <line x1={MID_X} y1={top + TASK_ROW_H} x2={RIGHT_X} y2={top + TASK_ROW_H} stroke={C.line} strokeWidth="1" />
          </g>
        )
      })}

      {/* 中间下：选中任务的发布详情 */}
      <rect x={MID_X} y={DETAIL_TOP} width={RIGHT_X - MID_X} height={BODY_BOTTOM - DETAIL_TOP} fill={C.rowAlt} />
      <text x={COL.title} y={DETAIL_TOP + 30} fontFamily={FONT} fontSize="13.5" fontWeight="800" fill={C.text}>
        {detail.title}
      </text>
      <text
        x={COL.views}
        y={DETAIL_TOP + 30}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="12.5"
        fontWeight="700"
        fill={C.doing}
      >
        {detail.progress}
      </text>
      <rect x={COL.title} y={DETAIL_TOP + 42} width={COL.views - COL.title} height="8" rx="4" fill="rgba(27,36,50,0.08)" />
      <rect
        x={COL.title}
        y={DETAIL_TOP + 42}
        width={((COL.views - COL.title) * detail.percent) / 100}
        height="8"
        rx="4"
        fill={C.doing}
      />
      {detail.chips.map((chip, index) => {
        const x = COL.title + index * 82
        return (
          <g key={chip.name}>
            <rect
              x={x}
              y={DETAIL_TOP + 62}
              width="76"
              height="30"
              rx="8"
              fill={chip.done ? '#FFFFFF' : C.window}
              stroke={chip.done ? C.ok : C.border}
              strokeWidth="1"
            />
            <circle cx={x + 14} cy={DETAIL_TOP + 77} r="4" fill={chip.done ? C.ok : C.dim} />
            <text
              x={x + 26}
              y={DETAIL_TOP + 81}
              fontFamily={FONT}
              fontSize="12.5"
              fontWeight={chip.done ? '700' : '400'}
              fill={chip.done ? C.text : C.muted}
            >
              {chip.name}
            </text>
          </g>
        )
      })}

      {/* 右侧：账号矩阵 */}
      <rect x={RIGHT_X} y={BODY_TOP} width={RIGHT_W} height={BODY_BOTTOM - BODY_TOP} fill={C.window} />
      <rect x={RIGHT_X} y={BODY_TOP} width={RIGHT_W} height="38" fill={C.headBg} />
      <text x={RIGHT_X + 20} y={BODY_TOP + 24} fontFamily={FONT} fontSize="13" fontWeight="700" fill={C.muted}>
        账号矩阵
      </text>
      <text
        x={RIGHT_X + RIGHT_W - 20}
        y={BODY_TOP + 24}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="12"
        fill={C.dim}
      >
        8 个渠道
      </text>
      {PROMO_UI.accounts.map((account, index) => {
        const top = BODY_TOP + 38 + index * 62
        return (
          <g key={account.name}>
            {index % 2 === 1 ? (
              <rect x={RIGHT_X} y={top} width={RIGHT_W} height="62" fill={C.rowAlt} />
            ) : null}
            <circle cx={RIGHT_X + 32} cy={top + 31} r="15" fill={account.color} />
            <text
              x={RIGHT_X + 32}
              y={top + 36}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="12"
              fontWeight="800"
              fill="#FFFFFF"
            >
              {account.name.slice(0, 1)}
            </text>
            <circle cx={RIGHT_X + 43} cy={top + 20} r="4" fill={account.online ? C.ok : C.dim} stroke={C.window} strokeWidth="1.5" />
            <text x={RIGHT_X + 56} y={top + 28} fontFamily={FONT} fontSize="13.5" fontWeight="700" fill={C.text}>
              {account.name}
            </text>
            <text x={RIGHT_X + 56} y={top + 48} fontFamily={FONT} fontSize="12" fill={C.muted}>
              {account.handle}
            </text>
            <text
              x={RIGHT_X + RIGHT_W - 20}
              y={top + 30}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="14"
              fontWeight="800"
              fill={account.online ? C.text : C.dim}
            >
              {account.fans}
            </text>
            <text
              x={RIGHT_X + RIGHT_W - 20}
              y={top + 48}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="11.5"
              fill={account.online ? C.ok : C.dim}
            >
              {account.online ? '已连接' : '未连接'}
            </text>
            <line x1={RIGHT_X} y1={top + 62} x2={RIGHT_X + RIGHT_W} y2={top + 62} stroke={C.line} strokeWidth="1" />
          </g>
        )
      })}

      {/* 状态栏 */}
      <rect x={WIN.x} y={BODY_BOTTOM} width={WIN.w} height={STATUS_H} rx={WIN.r} fill={C.titleBar} />
      <rect x={WIN.x} y={BODY_BOTTOM} width={WIN.w} height={WIN.r} fill={C.titleBar} />
      <line x1={WIN.x} y1={BODY_BOTTOM} x2={WIN.x + WIN.w} y2={BODY_BOTTOM} stroke={C.line} strokeWidth="1" />
      <text x={WIN.x + 20} y={BODY_BOTTOM + 19} fontFamily={FONT} fontSize="12" fill={C.muted}>
        {PROMO_UI.status.left}
      </text>
      <text
        x={WIN.x + WIN.w - 20}
        y={BODY_BOTTOM + 19}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="12"
        fontWeight="700"
        fill={C.brand}
      >
        {PROMO_UI.status.right}
      </text>
    </svg>
  )
}

export default PromoCanvas
