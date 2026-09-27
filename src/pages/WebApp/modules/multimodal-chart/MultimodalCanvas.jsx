/**
 * 多模态场景识别 · 画布（1000×620）
 *
 * 三段式：左「三路模态输入」→ 中「跨模态融合」→ 右「场景标签输出」
 * 与「高光识别」那张（实时界面 + 检测框 + 列表）在结构上刻意区分开。
 *
 * 全部内联属性 SVG；照片由 canvasExport 在导出时内联成 data URI。
 */
import React from 'react'
import { MULTIMODAL as M, FONT, PALETTE as P, tint } from './multimodalChartData.js'

const W = M.width
const H = M.height

const BODY_TOP = 98
const BODY_H = 372

const LEFT_X = 24
const LEFT_W = 396
const CARD_H = 116
const CARD_GAP = 12

const FUSION_X = 436
const FUSION_W = 160

const RIGHT_X = 612
const RIGHT_W = 364
const SCENE_H = 86
const SCENE_GAP = 9

export function MultimodalCanvas() {
  const fusionCY = BODY_TOP + BODY_H / 2
  const photoH = 84
  const photoW = 132

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="多模态场景识别">
      <defs>
        <clipPath id="mm-photo">
          <rect x={LEFT_X + 16} y={BODY_TOP + 16} width={photoW} height={photoH} rx="8" />
        </clipPath>
        <marker id="mm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={P.dim} />
        </marker>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={P.pageBg} />

      <text x="32" y="52" fontFamily={FONT} fontSize="28" fontWeight="800" fill={P.text}>
        {M.title}
      </text>
      <text x="32" y="78" fontFamily={FONT} fontSize="15" fill={P.muted}>
        {M.subtitle}
      </text>

      {/* 左：三路模态 */}
      {M.modalities.map((item, index) => {
        const top = BODY_TOP + index * (CARD_H + CARD_GAP)
        return (
          <g key={item.key}>
            <rect x={LEFT_X} y={top} width={LEFT_W} height={CARD_H} rx="12" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
            <rect x={LEFT_X} y={top} width="5" height={CARD_H} rx="2.5" fill={item.color} />

            {item.key === 'vision' ? (
              <g>
                <image
                  href={M.photo}
                  x={LEFT_X + 16}
                  y={top + 16}
                  width={photoW}
                  height={photoH}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#mm-photo)"
                />
                <text x={LEFT_X + 164} y={top + 38} fontFamily={FONT} fontSize="18" fontWeight="800" fill={P.text}>
                  {item.name}
                </text>
                <text x={LEFT_X + 164} y={top + 66} fontFamily={FONT} fontSize="13" fill={P.muted}>
                  {item.metricLabel}
                </text>
                <text x={LEFT_X + 236} y={top + 68} fontFamily={FONT} fontSize="19" fontWeight="800" fill={item.color}>
                  {item.metric}
                </text>
                <text x={LEFT_X + 164} y={top + 94} fontFamily={FONT} fontSize="12" fill={P.muted}>
                  {item.tags.join(' · ')}
                </text>
              </g>
            ) : null}

            {item.key === 'audio' ? (
              <g>
                <text x={LEFT_X + 20} y={top + 30} fontFamily={FONT} fontSize="18" fontWeight="800" fill={P.text}>
                  {item.name}
                </text>
                {item.wave.map((height, waveIndex) => (
                  <rect
                    key={waveIndex}
                    x={LEFT_X + 20 + waveIndex * 12}
                    y={top + 62 - height / 3}
                    width="5"
                    height={height * 0.66}
                    rx="2.5"
                    fill={item.color}
                    fillOpacity={0.35 + (height / 82) * 0.55}
                  />
                ))}
                <text x={LEFT_X + LEFT_W - 16} y={top + 30} textAnchor="end" fontFamily={FONT} fontSize="13" fill={P.muted}>
                  {item.tags.join(' · ')}
                </text>
                <text x={LEFT_X + 20} y={top + 104} fontFamily={FONT} fontSize="13" fill={P.muted}>
                  {item.metricLabel}
                </text>
                <text x={LEFT_X + 96} y={top + 106} fontFamily={FONT} fontSize="17" fontWeight="800" fill={item.color}>
                  {item.metric}
                </text>
              </g>
            ) : null}

            {item.key === 'data' ? (
              <g>
                <text x={LEFT_X + 20} y={top + 34} fontFamily={FONT} fontSize="18" fontWeight="800" fill={P.text}>
                  {item.name}
                </text>
                <text x={LEFT_X + LEFT_W - 16} y={top + 34} textAnchor="end" fontFamily={FONT} fontSize="13" fill={P.muted}>
                  {item.tags.join(' · ')}
                </text>
                <text x={LEFT_X + 20} y={top + 70} fontFamily={FONT} fontSize="13" fill={P.muted}>
                  {item.metricLabel}
                </text>
                <text x={LEFT_X + 112} y={top + 70} fontFamily={FONT} fontSize="20" fontWeight="800" fill={item.color}>
                  {item.metric}
                </text>
                <rect x={LEFT_X + 20} y={top + 84} width={LEFT_W - 40} height="18" rx="6" fill={P.barBg} />
                <text x={LEFT_X + 32} y={top + 98} fontFamily={FONT} fontSize="12" fontWeight="700" fill={P.muted}>
                  比分 62:58 · 第 3 节 03:24 · 第 8 回合 · 球权主队
                </text>
              </g>
            ) : null}
          </g>
        )
      })}

      {/* 中：跨模态融合 */}
      {M.modalities.map((item, index) => {
        const fromY = BODY_TOP + index * (CARD_H + CARD_GAP) + CARD_H / 2
        return (
          <path
            key={`line-${item.key}`}
            d={`M${LEFT_X + LEFT_W + 6},${fromY} C${LEFT_X + LEFT_W + 40},${fromY} ${FUSION_X - 40},${fusionCY} ${FUSION_X - 8},${fusionCY}`}
            fill="none"
            stroke={item.color}
            strokeWidth="2"
            strokeOpacity="0.55"
            markerEnd="url(#mm-arrow)"
          />
        )
      })}

      <circle cx={FUSION_X + FUSION_W / 2} cy={fusionCY} r="58" fill={tint(P.accent, 0.12)} stroke={P.accent} strokeWidth="2" />
      <text
        x={FUSION_X + FUSION_W / 2}
        y={fusionCY - 14}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="16"
        fontWeight="800"
        fill={P.text}
      >
        跨模态
      </text>
      <text
        x={FUSION_X + FUSION_W / 2}
        y={fusionCY + 8}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="16"
        fontWeight="800"
        fill={P.text}
      >
        融合
      </text>
      <text
        x={FUSION_X + FUSION_W / 2}
        y={fusionCY + 34}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="14"
        fontWeight="700"
        fill={P.accent}
      >
        {M.fusion.latency}
      </text>
      <text
        x={FUSION_X + FUSION_W / 2}
        y={fusionCY + 82}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="12"
        fill={P.muted}
      >
        {M.fusion.detail}
      </text>

      <path
        d={`M${FUSION_X + FUSION_W / 2 + 62},${fusionCY} L${RIGHT_X - 14},${fusionCY}`}
        fill="none"
        stroke={P.accent}
        strokeWidth="2.5"
        strokeOpacity="0.7"
        markerEnd="url(#mm-arrow)"
      />

      {/* 右：场景标签输出 */}
      <text x={RIGHT_X} y={BODY_TOP + 16} fontFamily={FONT} fontSize="15" fontWeight="800" fill={P.text}>
        场景标签输出
      </text>
      <text x={RIGHT_X + RIGHT_W} y={BODY_TOP + 16} textAnchor="end" fontFamily={FONT} fontSize="12" fill={P.muted}>
        4 类 · 实时刷新
      </text>
      {M.scenes.map((scene, index) => {
        const top = BODY_TOP + 30 + index * (SCENE_H + SCENE_GAP)
        return (
          <g key={scene.name}>
            <rect x={RIGHT_X} y={top} width={RIGHT_W} height={SCENE_H} rx="10" fill={P.card} stroke={P.cardBorder} strokeWidth="1" />
            <rect x={RIGHT_X} y={top} width="5" height={SCENE_H} rx="2.5" fill={scene.color} />
            <text x={RIGHT_X + 22} y={top + 36} fontFamily={FONT} fontSize="19" fontWeight="800" fill={P.text}>
              {scene.name}
            </text>
            <text x={RIGHT_X + 22} y={top + 64} fontFamily={FONT} fontSize="14" fontWeight="700" fill={scene.color}>
              {`置信度 ${scene.score}`}
            </text>
            <rect x={RIGHT_X + 180} y={top + 46} width="160" height="8" rx="4" fill={P.track} />
            <rect
              x={RIGHT_X + 180}
              y={top + 46}
              width={160 * Number(scene.score)}
              height="8"
              rx="4"
              fill={scene.color}
            />
          </g>
        )
      })}

      <text x="32" y={H - 12} fontFamily={FONT} fontSize="12" fill={P.dim}>
        {M.note}
      </text>
    </svg>
  )
}

export default MultimodalCanvas
