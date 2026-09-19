/**
 * 画布导出工具
 *
 * 各素材页面的画布都是「内联属性 SVG」，这里统一负责：
 * 序列化 → 光栅化成 PNG → 复制到剪贴板 / 下载。
 * 新增页面直接复用，不要再各写一份。
 */

/** 克隆画布 SVG 并写入固定尺寸，返回可独立渲染的 SVG 字符串 */
export function serializeCanvas(svgElement, width, height) {
  const clone = svgElement.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  return new XMLSerializer().serializeToString(clone)
}

/**
 * 把 SVG 里引用的外部图片转成 data URI。
 * 画布上如果有照片，直接序列化会因图片未加载完导致导出空白，必须先内联。
 */
export async function inlineSvgImages(svgElement) {
  const nodes = Array.from(svgElement.querySelectorAll('image'))
  await Promise.all(
    nodes.map(async (node) => {
      const href = node.getAttribute('href') || node.getAttribute('xlink:href')
      if (!href || href.startsWith('data:')) return
      try {
        const response = await fetch(href)
        if (!response.ok) return
        const blob = await response.blob()
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('图片读取失败'))
          reader.readAsDataURL(blob)
        })
        node.setAttribute('href', dataUrl)
        node.removeAttribute('xlink:href')
      } catch {
        // 单张图片失败不影响其余内容
      }
    })
  )
}

/**
 * 把页面中的画布渲染成 PNG Blob
 * @param {HTMLElement} stage 画布容器
 * @param {{width:number,height:number,scale?:number,background?:string}} options
 * @returns {Promise<Blob>}
 */
export async function renderCanvasPng(stage, { width, height, scale = 2, background }) {
  const svg = stage?.querySelector('svg')
  if (!svg) throw new Error('画布还没准备好')

  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  await inlineSvgImages(clone)

  const markup = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = await new Promise((resolve, reject) => {
      const node = new Image()
      node.onload = () => resolve(node)
      node.onerror = () => reject(new Error('画布渲染失败'))
      node.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    // background 为空时保留透明，便于直接贴到深色 PPT 页面上
    if (background) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('导出失败'))), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** 把 PNG 写进剪贴板（粘贴进 PPT / 文档用） */
export async function copyPngToClipboard(blob) {
  if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
    throw new Error('当前浏览器不支持复制图片，请改用「下载 PNG」')
  }
  await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
}

/** 触发浏览器下载 */
export function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 5000)
}
