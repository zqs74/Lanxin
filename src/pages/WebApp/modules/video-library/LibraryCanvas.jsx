/**
 * 视频素材库 · 画布（横版 1200×700）
 *
 * 桌面软件操作界面，与「多平台宣发」那张同一套窗口外观：
 *   标题栏（软件名 + 版本 + 用户 + 窗口按钮）
 *   菜单栏（文件 / 编辑 / 素材 / 收藏 / 分发 / 数据 / 帮助）
 *   工具栏（上传素材 / 新建合辑 / 加入宣发 / 批量下载 / 打标签 + 搜索）
 *   主体三栏：左导航 ｜ 中间筛选条 + 素材缩略图网格（3×3，带时长角标、收藏星、选中态）｜ 右侧素材详情
 *   底部状态栏
 *
 * 裁切用的是 clipPath，导出 PNG 时 9 张封面由 canvasExport 自动内联成 data URI。
 */
import React from 'react'
import { LIBRARY_CANVAS, LIBRARY_UI } from './libraryData.js'

const W = LIBRARY_CANVAS.width
const H = LIBRARY_CANVAS.height

const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif"

const C = {
  pageBg: '#E9E6E0',
  window: '#FFFFFF',
  titleBar: '#EDEAE4',
  menuBg: '#FFFFFF',
  navBg: '#F4F1EB',
  navActive: '#FFFFFF',
  headBg: '#F1EEE7',
  card: '#FFFFFF',
  line: 'rgba(27,36,50,0.12)',
  border: 'rgba(27,36,50,0.16)',
  text: '#1B2432',
  muted: '#68727F',
  dim: '#9AA3AE',
  brand: '#B8791F',
  ok: '#0E9F6E',
  info: '#3B82F6',
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

/** 网格几何：3 列 × 3 行 */
const FILTER_H = 44
const CARD_W = 208
const CARD_H = 148
const COVER_H = 96
const COL_GAP = 12
const ROW_GAP = 8
const GRID_X = MID_X + 20
const GRID_TOP = BODY_TOP + FILTER_H + 12
const cardX = (index) => GRID_X + (index % 3) * (CARD_W + COL_GAP)
const cardY = (index) => GRID_TOP + Math.floor(index / 3) * (CARD_H + ROW_GAP)

export function LibraryCanvas() {
  const detail = LIBRARY_UI.detail

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="视频素材库 · 昇梦影像库">
      <defs>
        {LIBRARY_UI.items.map((item, index) => (
          <clipPath id={`lib-cover-${index}`} key={item.title}>
            <rect x={cardX(index)} y={cardY(index)} width={CARD_W} height={COVER_H} rx="8" />
          </clipPath>
        ))}
        <clipPath id="lib-detail-cover">
          <rect x={RIGHT_X + 20} y="176" width={RIGHT_W - 40} height="151" rx="8" />
        </clipPath>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={C.pageBg} />
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={WIN.r} fill={C.window} stroke={C.border} strokeWidth="1" />

      {/* 标题栏 */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={TITLE_H} rx={WIN.r} fill={C.titleBar} />
      <rect x={WIN.x} y={WIN.y + TITLE_H - WIN.r} width={WIN.w} height={WIN.r} fill={C.titleBar} />
      <rect x={WIN.x + 16} y={WIN.y + 10} width="22" height="22" rx="6" fill={C.brand} />
      <text x={WIN.x + 27} y={WIN.y + 26} textAnchor="middle" fontFamily={FONT} fontSize="13" fontWeight="800" fill="#FFFFFF">
        S
      </text>
      <text x={WIN.x + 48} y={WIN.y + 27} fontFamily={FONT} fontSize="15" fontWeight="800" fill={C.text}>
        {LIBRARY_UI.app.name}
      </text>
      <text x={WIN.x + 162} y={WIN.y + 27} fontFamily={FONT} fontSize="12" fill={C.dim}>
        {LIBRARY_UI.app.version}
      </text>
      <text
        x={WIN.x + WIN.w - 92}
        y={WIN.y + 26}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="12.5"
        fill={C.muted}
      >
        {LIBRARY_UI.app.user}
      </text>
      {[0, 1, 2].map((index) => (
        <g key={`winbtn-${index}`}>
          <rect
            x={WIN.x + WIN.w - 68 + index * 22}
            y={WIN.y + 16}
            width="16"
            height="16"
            rx="4"
            fill={index === 2 ? '#E4572E' : 'rgba(27,36,50,0.08)'}
          />
          <rect
            x={WIN.x + WIN.w - 64 + index * 22}
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
      {LIBRARY_UI.menus.map((menu, index) => (
        <text
          key={menu}
          x={WIN.x + 24 + index * 52}
          y={WIN.y + TITLE_H + 21}
          fontFamily={FONT}
          fontSize="13"
          fontWeight={menu === '素材' ? '800' : '400'}
          fill={menu === '素材' ? C.brand : C.text}
        >
          {menu}
        </text>
      ))}

      {/* 工具栏 */}
      <rect x={WIN.x} y={WIN.y + TITLE_H + MENU_H} width={WIN.w} height={TOOL_H} fill={C.menuBg} />
      {LIBRARY_UI.tools.map((tool, index) => {
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
        x={WIN.x + WIN.w - 275}
        y={WIN.y + TITLE_H + MENU_H + 27}
        fontFamily={FONT}
        fontSize="12.5"
        fill={C.dim}
      >
        {LIBRARY_UI.search}
      </text>
      <line x1={WIN.x} y1={BODY_TOP} x2={WIN.x + WIN.w} y2={BODY_TOP} stroke={C.line} strokeWidth="1" />

      {/* 左导航 */}
      <rect x={NAV_X} y={BODY_TOP} width={NAV_W} height={BODY_BOTTOM - BODY_TOP} fill={C.navBg} />
      <line x1={MID_X} y1={BODY_TOP} x2={MID_X} y2={BODY_BOTTOM} stroke={C.line} strokeWidth="1" />
      <text x={NAV_X + 20} y={BODY_TOP + 28} fontFamily={FONT} fontSize="12" fontWeight="700" fill={C.dim}>
        素材库
      </text>
      {LIBRARY_UI.nav.map((item, index) => {
        const top = BODY_TOP + 40 + index * 44
        return (
          <g key={item.name}>
            {item.active ? (
              <>
                <rect x={NAV_X + 8} y={top} width={NAV_W - 16} height="38" rx="8" fill={C.navActive} />
                <rect x={NAV_X + 8} y={top + 9} width="3" height="20" rx="1.5" fill={C.brand} />
              </>
            ) : null}
            <circle cx={NAV_X + 30} cy={top + 19} r="4" fill={item.active ? C.brand : C.dim} />
            <text
              x={NAV_X + 46}
              y={top + 24}
              fontFamily={FONT}
              fontSize="13.5"
              fontWeight={item.active ? '800' : '400'}
              fill={item.active ? C.text : C.muted}
            >
              {item.name}
            </text>
            <text x={NAV_X + NAV_W - 20} y={top + 24} textAnchor="end" fontFamily={FONT} fontSize="12" fill={C.dim}>
              {item.count}
            </text>
          </g>
        )
      })}

      {/* 中栏 · 筛选条 */}
      <rect x={MID_X} y={BODY_TOP} width={MID_W} height={FILTER_H} fill={C.menuBg} />
      {LIBRARY_UI.filters.map((filter, index) => {
        const active = filter === '全部'
        const w = 24 + filter.length * 15
        const x = MID_X + 20 + index * 88
        return (
          <g key={filter}>
            <rect
              x={x}
              y={BODY_TOP + 10}
              width={w}
              height="24"
              rx="12"
              fill={active ? C.brand : C.headBg}
              stroke={active ? C.brand : C.border}
              strokeWidth="1"
            />
            <text
              x={x + w / 2}
              y={BODY_TOP + 27}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="12"
              fontWeight={active ? '800' : '400'}
              fill={active ? '#FFFFFF' : C.muted}
            >
              {filter}
            </text>
          </g>
        )
      })}
      <text
        x={RIGHT_X - 20}
        y={BODY_TOP + 27}
        textAnchor="end"
        fontFamily={FONT}
        fontSize="12"
        fill={C.muted}
      >
        {LIBRARY_UI.sort}
      </text>
      <line x1={MID_X} y1={BODY_TOP + FILTER_H} x2={RIGHT_X} y2={BODY_TOP + FILTER_H} stroke={C.line} strokeWidth="1" />

      {/* 中栏 · 素材网格 */}
      {LIBRARY_UI.items.map((item, index) => {
        const x = cardX(index)
        const y = cardY(index)
        return (
          <g key={item.title}>
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={CARD_H}
              rx="10"
              fill={C.card}
              stroke={item.selected ? C.brand : C.border}
              strokeWidth={item.selected ? '2' : '1'}
            />
            <image
              href={item.photo}
              x={x}
              y={y}
              width={CARD_W}
              height={COVER_H}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#lib-cover-${index})`}
            />
            {/* 时长角标 */}
            <rect x={x + CARD_W - 54} y={y + COVER_H - 26} width="46" height="18" rx="4" fill="rgba(10,20,36,0.72)" />
            <text
              x={x + CARD_W - 31}
              y={y + COVER_H - 13}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="11.5"
              fontWeight="700"
              fill="#FFFFFF"
            >
              {item.duration}
            </text>
            {/* 选中勾选 */}
            {item.selected ? (
              <>
                <circle cx={x + 18} cy={y + 18} r="11" fill={C.brand} />
                <text x={x + 18} y={y + 23} textAnchor="middle" fontFamily={FONT} fontSize="12" fontWeight="800" fill="#FFFFFF">
                  ✓
                </text>
              </>
            ) : null}
            {/* 收藏星 */}
            <text
              x={x + CARD_W - 18}
              y={y + 24}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={item.favorite ? '17' : '16'}
              fill={item.favorite ? '#F5B301' : 'rgba(255,255,255,0.92)'}
              stroke={item.favorite ? 'none' : 'rgba(10,20,36,0.45)'}
              strokeWidth="0.8"
            >
              ★
            </text>
            {/* 信息区 */}
            <text x={x + 12} y={y + COVER_H + 22} fontFamily={FONT} fontSize="13.5" fontWeight="700" fill={C.text}>
              {item.title}
            </text>
            <rect x={x + 12} y={y + COVER_H + 30} width={18 + item.event.length * 13} height="18" rx="9" fill={C.headBg} />
            <text
              x={x + 21 + item.event.length * 6.5}
              y={y + COVER_H + 43}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="11"
              fill={C.muted}
            >
              {item.event}
            </text>
          </g>
        )
      })}
      <text x={GRID_X} y={BODY_BOTTOM - 8} fontFamily={FONT} fontSize="12" fill={C.dim}>
        已加载 9 条 · 共 8740 条素材，滚动继续加载
      </text>

      {/* 右栏 · 素材详情 */}
      <rect x={RIGHT_X} y={BODY_TOP} width={RIGHT_W} height={BODY_BOTTOM - BODY_TOP} fill={C.menuBg} />
      <line x1={RIGHT_X} y1={BODY_TOP} x2={RIGHT_X} y2={BODY_BOTTOM} stroke={C.line} strokeWidth="1" />
      <rect x={RIGHT_X} y={BODY_TOP} width={RIGHT_W} height="38" fill={C.headBg} />
      <text x={RIGHT_X + 20} y={BODY_TOP + 24} fontFamily={FONT} fontSize="13" fontWeight="700" fill={C.muted}>
        素材详情
      </text>
      <text x={RIGHT_X + RIGHT_W - 20} y={BODY_TOP + 24} textAnchor="end" fontFamily={FONT} fontSize="11.5" fill={C.dim}>
        1 / 9
      </text>

      <image
        href={detail.photo}
        x={RIGHT_X + 20}
        y="176"
        width={RIGHT_W - 40}
        height="151"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#lib-detail-cover)"
      />
      <text x={RIGHT_X + 20} y="352" fontFamily={FONT} fontSize="15" fontWeight="800" fill={C.text}>
        {detail.title}
      </text>
      <text x={RIGHT_X + 20} y="374" fontFamily={FONT} fontSize="11.5" fill={C.muted}>
        {detail.meta}
      </text>
      {detail.tags.map((tag, index) => (
        <g key={tag}>
          <rect
            x={RIGHT_X + 20 + index * 66}
            y="388"
            width="60"
            height="22"
            rx="11"
            fill={C.headBg}
            stroke={C.border}
            strokeWidth="1"
          />
          <text
            x={RIGHT_X + 50 + index * 66}
            y="403"
            textAnchor="middle"
            fontFamily={FONT}
            fontSize="11.5"
            fill={C.muted}
          >
            {tag}
          </text>
        </g>
      ))}
      <line x1={RIGHT_X + 20} y1="428" x2={RIGHT_X + RIGHT_W - 20} y2="428" stroke={C.line} strokeWidth="1" />
      {detail.stats.map((stat, index) => (
        <g key={stat.label}>
          <text x={RIGHT_X + 20 + index * 96} y="452" fontFamily={FONT} fontSize="11.5" fill={C.muted}>
            {stat.label}
          </text>
          <text
            x={RIGHT_X + 20 + index * 96}
            y="476"
            fontFamily={FONT}
            fontSize="17"
            fontWeight="800"
            fill={index === 1 ? C.brand : C.text}
          >
            {stat.value}
          </text>
        </g>
      ))}
      <rect x={RIGHT_X + 20} y="498" width="128" height="36" rx="9" fill="#FDF3E0" stroke={C.brand} strokeWidth="1" />
      <text x={RIGHT_X + 84} y="521" textAnchor="middle" fontFamily={FONT} fontSize="13.5" fontWeight="800" fill={C.brand}>
        ★ 已收藏
      </text>
      <rect x={RIGHT_X + 158} y="498" width="130" height="36" rx="9" fill={C.brand} />
      <text x={RIGHT_X + 223} y="521" textAnchor="middle" fontFamily={FONT} fontSize="13.5" fontWeight="800" fill="#FFFFFF">
        {detail.primaryAction}
      </text>
      <line x1={RIGHT_X + 20} y1="556" x2={RIGHT_X + RIGHT_W - 20} y2="556" stroke={C.line} strokeWidth="1" />
      <text x={RIGHT_X + 20} y="580" fontFamily={FONT} fontSize="12.5" fontWeight="700" fill={C.muted}>
        {detail.relatedTitle}
      </text>
      {detail.related.map((name, index) => (
        <g key={name}>
          <rect x={RIGHT_X + 20} y={594 + index * 30} width={RIGHT_W - 40} height="26" rx="6" fill={C.headBg} />
          <text x={RIGHT_X + 30} y={612 + index * 30} fontFamily={FONT} fontSize="12" fill={C.text}>
            {name}
          </text>
        </g>
      ))}

      {/* 状态栏 */}
      <rect x={WIN.x} y={BODY_BOTTOM} width={WIN.w} height={STATUS_H} rx={WIN.r} fill={C.titleBar} />
      <rect x={WIN.x} y={BODY_BOTTOM} width={WIN.w} height={WIN.r} fill={C.titleBar} />
      <line x1={WIN.x} y1={BODY_BOTTOM} x2={WIN.x + WIN.w} y2={BODY_BOTTOM} stroke={C.line} strokeWidth="1" />
      <text x={WIN.x + 20} y={BODY_BOTTOM + 19} fontFamily={FONT} fontSize="12" fill={C.muted}>
        {LIBRARY_UI.status.left}
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
        {LIBRARY_UI.status.right}
      </text>
    </svg>
  )
}

export default LibraryCanvas
