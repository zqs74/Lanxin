/**
 * 品牌 logo 抓取与内联数据生成
 *
 * 用法：node scripts/fetch-brand-logos.mjs
 *
 * 1. 从 Simple Icons / WorldVectorLogo 下载矢量 logo 到 public/images/linkage/logos/
 * 2. 剔除「铺满画布的白色底矩形」，整理成 logoData.js（内联 path 数据）
 *
 * 画布 SVG 只引用 logoData.js，不引用外部图片，因此导出的 PNG 不依赖网络。
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const LOGO_DIR = path.join(ROOT, 'public', 'images', 'linkage', 'logos')
const OUT_FILE = path.join(ROOT, 'src', 'pages', 'WebApp', 'modules', 'brand-linkage', 'logoData.js')

/** key → 矢量源地址 */
const SOURCES = {
  // 运动装备
  nike: 'https://cdn.simpleicons.org/nike',
  adidas: 'https://cdn.simpleicons.org/adidas',
  anta: 'https://cdn.simpleicons.org/anta',
  lining: 'https://cdn.simpleicons.org/lining',
  puma: 'https://cdn.simpleicons.org/puma',
  underarmour: 'https://cdn.simpleicons.org/underarmour',
  reebok: 'https://cdn.simpleicons.org/reebok',
  jordan: 'https://cdn.simpleicons.org/jordan',
  decathlon: 'https://cdn.worldvectorlogo.com/logos/decathlon.svg',
  // 运动潮流 / 跑训
  converse: 'https://cdn.worldvectorlogo.com/logos/converse.svg',
  newbalance: 'https://cdn.worldvectorlogo.com/logos/new-balance.svg',
  asics: 'https://cdn.worldvectorlogo.com/logos/asics.svg',
  skechers: 'https://cdn.worldvectorlogo.com/logos/skechers.svg',
  vans: 'https://cdn.worldvectorlogo.com/logos/vans.svg',
  kelme: 'https://cdn.worldvectorlogo.com/logos/kelme.svg',
  peak: 'https://cdn.worldvectorlogo.com/logos/peak.svg',
  // 篮球器材
  nba: 'https://cdn.simpleicons.org/nba',
  molten: 'https://cdn.worldvectorlogo.com/logos/molten.svg',
  spalding: 'https://cdn.worldvectorlogo.com/logos/spalding.svg',
  wilson: 'https://cdn.worldvectorlogo.com/logos/wilson.svg',
  // 运动防护
  mcdavid: 'https://cdn.worldvectorlogo.com/logos/mcdavid.svg',
  // 运动饮品
  redbull: 'https://cdn.simpleicons.org/redbull',
  monster: 'https://cdn.simpleicons.org/monster',
  gatorade: 'https://cdn.worldvectorlogo.com/logos/gatorade.svg',
  // 餐饮零售
  kfc: 'https://cdn.simpleicons.org/kfc',
  mcdonalds: 'https://cdn.simpleicons.org/mcdonalds',
  starbucks: 'https://cdn.simpleicons.org/starbucks',
  seveneleven: 'https://cdn.worldvectorlogo.com/logos/7-eleven.svg',
  // 智能穿戴
  apple: 'https://cdn.simpleicons.org/apple',
  huawei: 'https://cdn.simpleicons.org/huawei',
  xiaomi: 'https://cdn.simpleicons.org/xiaomi',
  oppo: 'https://cdn.simpleicons.org/oppo',
  vivo: 'https://cdn.simpleicons.org/vivo',
  // 生活服务
  tesla: 'https://cdn.simpleicons.org/tesla',
  taobao: 'https://cdn.simpleicons.org/taobao',
  meituan: 'https://cdn.simpleicons.org/meituan',
  sfexpress: 'https://cdn.worldvectorlogo.com/logos/sf-express.svg',
}

/**
 * 个别 logo 的路径含退化弧线，自动解析出的包围盒不可靠，这里人工指定。
 * （彪马的 path 在弧线命令之后解析中断，只覆盖到图形上半部分，导致被放大压字）
 */
const BBOX_OVERRIDE = {
  puma: [0, 0, 24, 24],
}

/** SVG path 的近似包围盒（曲线用控制点当边界，略偏大但绝不会漏） */
function pathBBox(d) {
  const tokens = String(d).match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)
  if (!tokens) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let cx = 0
  let cy = 0
  let startX = 0
  let startY = 0
  let cmd = null
  let i = 0

  const read = () => Number(tokens[i++])
  const track = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }

  while (i < tokens.length) {
    if (/[a-z]/i.test(tokens[i])) {
      cmd = tokens[i]
      i += 1
    }
    if (i >= tokens.length) break

    switch (cmd) {
      case 'M':
        cx = read(); cy = read(); startX = cx; startY = cy; track(cx, cy); cmd = 'L'; break
      case 'm':
        cx += read(); cy += read(); startX = cx; startY = cy; track(cx, cy); cmd = 'l'; break
      case 'L':
        cx = read(); cy = read(); track(cx, cy); break
      case 'l':
        cx += read(); cy += read(); track(cx, cy); break
      case 'H':
        cx = read(); track(cx, cy); break
      case 'h':
        cx += read(); track(cx, cy); break
      case 'V':
        cy = read(); track(cx, cy); break
      case 'v':
        cy += read(); track(cx, cy); break
      case 'C': {
        const x1 = read(); const y1 = read(); const x2 = read(); const y2 = read()
        cx = read(); cy = read()
        track(x1, y1); track(x2, y2); track(cx, cy); break
      }
      case 'c': {
        const x1 = cx + read(); const y1 = cy + read(); const x2 = cx + read(); const y2 = cy + read()
        cx += read(); cy += read()
        track(x1, y1); track(x2, y2); track(cx, cy); break
      }
      case 'S':
      case 'Q': {
        const x1 = read(); const y1 = read()
        cx = read(); cy = read()
        track(x1, y1); track(cx, cy); break
      }
      case 's':
      case 'q': {
        const x1 = cx + read(); const y1 = cy + read()
        cx += read(); cy += read()
        track(x1, y1); track(cx, cy); break
      }
      case 'T':
        cx = read(); cy = read(); track(cx, cy); break
      case 't':
        cx += read(); cy += read(); track(cx, cy); break
      case 'A':
        read(); read(); read(); read(); read()
        cx = read(); cy = read(); track(cx, cy); break
      case 'a':
        read(); read(); read(); read(); read()
        cx += read(); cy += read(); track(cx, cy); break
      case 'Z':
      case 'z':
        cx = startX; cy = startY; break
      default:
        i += 1
    }
  }

  if (!Number.isFinite(minX)) return null
  return [minX, minY, maxX - minX, maxY - minY]
}

/** 多个 path 的包围盒并集 */
function unionBBox(shapes) {
  let box = null
  for (const shape of shapes) {
    const current = pathBBox(shape.d)
    if (!current) continue
    if (!box) {
      box = current
      continue
    }
    const x1 = Math.min(box[0], current[0])
    const y1 = Math.min(box[1], current[1])
    const x2 = Math.max(box[0] + box[2], current[0] + current[2])
    const y2 = Math.max(box[1] + box[3], current[1] + current[3])
    box = [x1, y1, x2 - x1, y2 - y1]
  }
  return box
}

const luminance = (hex) => {
  let h = String(hex).replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) return 0
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/**
 * 铺满画布的纯色底矩形（白底或黑底，例：M0 0h192.756v192.756H0V0z），要剔除。
 * 剔除后若剩下的图形接近纯白，build() 会把 tone 标成 dark，改在浅色卡片上用深色填充。
 */
const isBackdropRect = (d, fill) => {
  if (fill === 'none') return false
  const normalized = d.trim().replace(/\s+/g, '')
  if (normalized.length > 70) return false
  return /^M0,?0[hH][\d.]+[vV][\d.]+[hH]0[vV]0[zZ]$/i.test(normalized)
}

async function download() {
  fs.mkdirSync(LOGO_DIR, { recursive: true })
  let ok = 0
  const failed = []
  for (const [key, url] of Object.entries(SOURCES)) {
    const target = path.join(LOGO_DIR, `${key}.svg`)
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (logo fetch script)' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (!text.includes('<svg')) throw new Error('响应不是 SVG')
      fs.writeFileSync(target, text)
      ok += 1
    } catch (error) {
      if (fs.existsSync(target)) {
        failed.push(`${key}（沿用本地已有文件：${error.message}）`)
      } else {
        failed.push(`${key}（${error.message}）`)
      }
    }
  }
  console.log(`下载完成：成功 ${ok} / 共 ${Object.keys(SOURCES).length}`)
  if (failed.length) console.log(`未更新：\n  ${failed.join('\n  ')}`)
}

function build() {
  const files = fs.readdirSync(LOGO_DIR).filter((f) => f.endsWith('.svg')).sort()
  const entries = []

  for (const file of files) {
    const key = file.replace(/\.svg$/, '')
    const src = fs.readFileSync(path.join(LOGO_DIR, file), 'utf8')
    const vbRaw = (src.match(/viewBox="([^"]+)"/) || [])[1]
    const rootFill = (src.match(/<svg[^>]*\bfill="([^"]+)"/) || [])[1] || '#000000'

    let vb = [0, 0, 24, 24]
    if (vbRaw) {
      const parts = vbRaw.trim().split(/[\s,]+/).map(Number)
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) vb = parts
    }

    const shapes = []
    const docEvenOdd = /fill-rule="evenodd"/i.test(src)
    const re = /<path\b([^>]*?)\/?>/g
    let match
    while ((match = re.exec(src)) !== null) {
      const attrs = match[1]
      const d = (attrs.match(/\bd="([^"]+)"/) || [])[1]
      if (!d) continue
      const fill = (attrs.match(/\bfill="([^"]+)"/) || [])[1] || rootFill
      if (isBackdropRect(d, fill)) continue
      const ownRule = (attrs.match(/\bfill-rule="([^"]+)"/) || [])[1]
      shapes.push({ d, fill, rule: ownRule || (docEvenOdd ? 'evenodd' : 'nonzero') })
    }

    const visible = shapes.filter((s) => s.fill !== 'none')
    const allLight = visible.length > 0 && visible.every((s) => luminance(s.fill) > 0.82)
    const bbox = BBOX_OVERRIDE[key] ?? unionBBox(visible) ?? vb

    entries.push({ key, vb, bbox, tone: allLight ? 'dark' : 'color', shapes })
  }

  const body = entries
    .map((entry) => {
      const shapes = entry.shapes
        .map(
          (s) =>
            `      { d: ${JSON.stringify(s.d)}, fill: ${JSON.stringify(s.fill)}, rule: ${JSON.stringify(s.rule)} },`
        )
        .join('\n')
      const round = (n) => Number(n.toFixed(3))
      const bboxLine = `\n    bbox: [${entry.bbox.map(round).join(', ')}],`
      return `  ${JSON.stringify(entry.key)}: {\n    vb: [${entry.vb.join(', ')}],${bboxLine}\n    tone: ${JSON.stringify(entry.tone)},\n    shapes: [\n${shapes}\n    ],\n  },`
    })
    .join('\n')

  const content = `/**
 * 品牌 logo 矢量数据（由 scripts/fetch-brand-logos.mjs 自动生成，勿手改）
 *
 * 来源：Simple Icons (cdn.simpleicons.org) 与 WorldVectorLogo (cdn.worldvectorlogo.com)
 * 处理：剔除铺满画布的白色底矩形；tone=dark 表示原 logo 接近纯白，
 *      放在浅色卡片上时需要改成深色填充。
 */
export const LOGOS = {
${body}
}
`

  fs.writeFileSync(OUT_FILE, content)
  console.log(`已生成 ${path.relative(ROOT, OUT_FILE)}（${entries.length} 个 logo，${(content.length / 1024).toFixed(1)} KB）`)
}

await download()
build()
