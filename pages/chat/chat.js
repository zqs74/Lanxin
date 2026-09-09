// chat.js - 昇梦体育 DeepSeek-R1 AI对话
const app = getApp()

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    userInput: '',
    messages: [],
    isLoading: false,
    scrollToView: '',
    thinkingScrollToView: '',
    currentThinking: '',
    isThinking: false,
    hasAssistantMsg: false,
    windowHeight: 0,
    navHeight: 0,
    navTop: 0,
    chatBodyHeight: 0,
    inputBottomInset: 0,
    inputHeight: 116
  },

  onLoad() {
    this._chatUnloaded = false
    this.initLayout()
    this.initTheme()
  },

  onUnload() {
    this._chatUnloaded = true
    if (this._cancelChat) this._cancelChat()
  },

  _themeClass(ut) { return ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') },

  _syncTheme() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this._themeClass(ut), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  initTheme() { this._syncTheme() },
  setTheme(theme) { this._syncTheme() },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(2) }
    this.initLayout()
    this._syncTheme()
  },

  onResize() {
    this.initLayout()
    setTimeout(() => this.scrollToBottom(), 80)
  },

  initLayout() {
    let windowInfo = {}
    let deviceInfo = {}
    let menuRect = null
    try { windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {} } catch (e) { windowInfo = {} }
    try { deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {} } catch (e) { deviceInfo = {} }
    try { menuRect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null } catch (e) { menuRect = null }

    const windowHeight = windowInfo.windowHeight || 667
    const statusBarHeight = windowInfo.statusBarHeight || 0
    const safeArea = windowInfo.safeArea || {}
    const safeBottom = safeArea.bottom ? Math.max(0, windowHeight - safeArea.bottom) : 0
    const navTop = menuRect && menuRect.top ? Math.max(0, menuRect.top - statusBarHeight) : 8
    const capsuleHeight = menuRect && menuRect.height ? menuRect.height : (deviceInfo.platform === 'ios' ? 32 : 32)
    const navHeight = statusBarHeight + navTop * 2 + capsuleHeight
    const inputBottomInset = Math.max(safeBottom, 10)
    const inputHeight = 116
    const chatBodyHeight = Math.max(320, windowHeight - navHeight)

    this.setData({
      windowHeight,
      navHeight,
      navTop,
      inputBottomInset,
      inputHeight,
      chatBodyHeight
    })
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
      return
    }
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  onInputChange(e) { this.setData({ userInput: e.detail.value }) },

  sendQuickQuestion(e) { this.setData({ userInput: e.currentTarget.dataset.question }); this.sendMessage() },

  scrollToBottom() {
    if (this._chatUnloaded) return
    this.setData({
      scrollToView: '',
      thinkingScrollToView: ''
    })
    setTimeout(() => {
      if (this._chatUnloaded) return
      this.setData({
        scrollToView: 'msg-bottom',
        thinkingScrollToView: 'thinking-bottom'
      })
    }, 20)
  },

  sendMessage() {
    if (this.data.isLoading || this._chatUnloaded) return
    const message = this.data.userInput.trim()
    if (!message) { wx.showToast({ title: '请输入消息', icon: 'none' }); return }
    const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const newMessages = [...this.data.messages, { role: 'user', content: message, time }]
    this.setData({ messages: newMessages, userInput: '', isLoading: true, isThinking: true, currentThinking: '', hasAssistantMsg: false, scrollToView: 'msg-bottom' })
    setTimeout(() => this.scrollToBottom(), 80)
    this.callDeepSeekAPI(message)
  },

  normalizeMarkdown(text = '') {
    return String(text)
      .replace(/\\([*_`~\[\]()#+\-.!|>])/g, '$1')
      .replace(/\t/g, '  ')
      .replace(/^\s*[•·]\s+/gm, '- ')
  },

  parseInlineSpans(text = '') {
    const source = String(text)
    const spans = []
    const pattern = /(`[^`\n]+`|\*\*[\s\S]+?\*\*|__[\s\S]+?__|~~[\s\S]+?~~|\[[^\]]+\]\([^)]+\)|\*[^*\n]+\*|_[^_\n]+_|\n)/g
    let lastIndex = 0
    let match

    const pushText = (value, type = 'text') => {
      if (!value) return
      spans.push({ type, text: value })
    }

    while ((match = pattern.exec(source)) !== null) {
      pushText(source.slice(lastIndex, match.index))
      const token = match[0]
      if (token === '\n') {
        spans.push({ type: 'break', text: '' })
      } else if (token.startsWith('`')) {
        pushText(token.slice(1, -1), 'code')
      } else if (token.startsWith('**') || token.startsWith('__')) {
        pushText(token.slice(2, -2), 'strong')
      } else if (token.startsWith('~~')) {
        pushText(token.slice(2, -2), 'delete')
      } else if (token.startsWith('[')) {
        const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        pushText(link ? link[1] : token, 'link')
      } else if (token.startsWith('*') || token.startsWith('_')) {
        pushText(token.slice(1, -1), 'em')
      } else {
        pushText(token)
      }
      lastIndex = pattern.lastIndex
    }

    pushText(source.slice(lastIndex))
    return spans.length ? spans : [{ type: 'text', text: source }]
  },

  parseGraphLine(line = '') {
    const match = line.match(/^\s*([A-Za-z0-9_]+)(?:\[(.*?)\])?\s*[-=.]+>\s*([A-Za-z0-9_]+)(?:\[(.*?)\])?\s*$/)
    if (!match) return null
    return {
      fromId: match[1],
      fromLabel: (match[2] || match[1]).trim(),
      toId: match[3],
      toLabel: (match[4] || match[3]).trim()
    }
  },

  parseGraphBlock(code = '', language = '') {
    const rawLines = String(code).split('\n').map(line => line.trim()).filter(Boolean)
    const firstLine = rawLines[0] || ''
    const header = firstLine.match(/^(graph|flowchart)\s+(LR|RL|TD|TB|BT)$/i)
    const direction = header ? header[2].toUpperCase() : (language || '').replace(/^(graph|flowchart)-?/i, '').toUpperCase()
    const bodyLines = header ? rawLines.slice(1) : rawLines
    const nodes = []
    const nodeMap = {}
    const edges = []

    bodyLines.forEach(line => {
      const edge = this.parseGraphLine(line)
      if (!edge) return
      if (!nodeMap[edge.fromId]) {
        nodeMap[edge.fromId] = { id: edge.fromId, label: edge.fromLabel }
        nodes.push(nodeMap[edge.fromId])
      }
      if (!nodeMap[edge.toId]) {
        nodeMap[edge.toId] = { id: edge.toId, label: edge.toLabel }
        nodes.push(nodeMap[edge.toId])
      }
      edges.push(edge)
    })

    return {
      direction: ['LR', 'RL'].includes(direction) ? 'LR' : 'TD',
      nodes,
      edges
    }
  },

  isGraphHeader(line = '') {
    return /^(graph|flowchart)\s+(LR|RL|TD|TB|BT)$/i.test(String(line).trim())
  },

  isGraphBlock(language = '', code = '') {
    const lang = String(language).trim().toLowerCase()
    const trimmed = String(code).trim()
    return ['mermaid', 'graph', 'flowchart'].includes(lang) || /^(graph|flowchart)\s+(LR|RL|TD|TB|BT)/i.test(trimmed)
  },

  isMarkdownLikeCodeBlock(language = '', code = '') {
    const lang = String(language).trim().toLowerCase()
    const text = String(code).trim()
    if (!text) return false
    if (['markdown', 'md', 'mdown', 'text'].includes(lang)) return true
    if (lang && !['txt'].includes(lang)) return false

    const markdownSignals = [
      /^#{1,6}\s+/m,
      /^\s*\d+\.\s+/m,
      /^\s*[-*+]\s+/m,
      /\*\*[^*\n][\s\S]*?\*\*/,
      /\|[^\n]+\|\s*\n\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?/,
      /^>\s+/m
    ]
    return markdownSignals.some(pattern => pattern.test(text))
  },

  parseTableRow(row = '') {
    let cells = row.trim()
    if (cells.startsWith('|')) cells = cells.slice(1)
    if (cells.endsWith('|')) cells = cells.slice(0, -1)
    return cells.split('|').map(cell => cell.trim())
  },

  normalizeMarkdownLines(text = '') {
    const rawLines = this.normalizeMarkdown(text).replace(/\r\n/g, '\n').split('\n')
    const lines = []

    rawLines.forEach((line) => {
      const current = line.trim()
      const prev = lines[lines.length - 1] || ''
      const prevPipeCount = (prev.match(/\|/g) || []).length
      const currentPipeCount = (current.match(/\|/g) || []).length

      if (
        lines.length &&
        current &&
        prev.includes('|') &&
        current.includes('|') &&
        prevPipeCount < 4 &&
        currentPipeCount <= 2 &&
        !this.isTableSeparator(prev) &&
        !/^#{1,6}\s+/.test(current) &&
        !/^(\s*)([-*+]|\d+\.)\s+/.test(current)
      ) {
        lines[lines.length - 1] = `${prev} ${current}`
        return
      }

      lines.push(line)
    })

    return lines
  },

  isTableSeparator(line = '') {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line) ||
      /^\s*\|?[\s\-:|]+\|?\s*$/.test(line)
  },

  isTableCandidate(line = '') {
    const pipeCount = (String(line).match(/\|/g) || []).length
    return pipeCount >= 2 && !this.isTableSeparator(line)
  },

  findNextContentLine(lines = [], start = 0) {
    let index = start
    while (index < lines.length && !String(lines[index]).trim()) {
      index += 1
    }
    return index
  },

  shouldContinueTableLine(line = '') {
    const text = String(line).trim()
    if (!text) return false
    if (/^#{1,6}\s+/.test(text) || /^```/.test(text) || /^>\s?/.test(text)) return false
    if (/^(\s*)([-*+]|\d+\.)\s+/.test(text)) return false
    return text.includes('|') || this.isTableSeparator(text)
  },

  consumeTableBlock(lines = [], start = 0) {
    const header = this.parseTableRow(lines[start])
    const rows = []
    let index = start + 1
    let currentLine = ''

    while (index < lines.length && !String(lines[index]).trim()) {
      index += 1
    }

    while (index < lines.length && this.isTableSeparator(lines[index])) {
      index += 1
    }

    while (index < lines.length) {
      const line = lines[index]
      const trimmed = String(line).trim()

      if (!trimmed) {
        if (currentLine) {
          rows.push(this.parseTableRow(currentLine))
          currentLine = ''
        }
        index += 1
        break
      }

      if (!this.shouldContinueTableLine(line)) break

      if (this.isTableSeparator(line)) {
        index += 1
        continue
      }

      currentLine = currentLine ? `${currentLine} ${trimmed}` : trimmed
      const expectedPipes = header.length + 1
      const pipeCount = (currentLine.match(/\|/g) || []).length

      if (pipeCount >= expectedPipes || (currentLine.startsWith('|') && currentLine.endsWith('|') && pipeCount >= header.length - 1)) {
        rows.push(this.parseTableRow(currentLine))
        currentLine = ''
      }

      index += 1
    }

    if (currentLine) {
      rows.push(this.parseTableRow(currentLine))
    }

    return {
      nextIndex: index,
      block: {
        type: 'table',
        headers: header,
        rows: rows.map(row => header.map((cellHeader, cellIndex) => ({
          header: cellHeader,
          value: row[cellIndex] || '',
          spans: this.parseInlineSpans(row[cellIndex] || '')
        })))
      }
    }
  },

  isBlockStart(line = '', nextLine = '') {
    return /^```/.test(line) || /^(#{1,6})\s+/.test(line) || /^>\s?/.test(line) ||
      /^(\s*)([-*+])\s+/.test(line) || /^(\s*)\d+\.\s+/.test(line) ||
      /^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line) || (line.includes('|') && this.isTableSeparator(nextLine))
  },

  parseMarkdown(text) {
    return this.parseMarkdownBlocks(text)
  },

  blocksToRichText(blocks = []) {
    return blocks.map(block => {
      if (block.text) return block.text
      if (block.spans) return block.spans.map(span => span.text).join('')
      if (block.items) return block.items.map(item => item.text).join('\n')
      return ''
    }).join('\n')
  },

  parseMarkdownBlocks(text) {
    if (!text) return []
    const lines = this.normalizeMarkdownLines(text)
    const blocks = []
    let i = 0

    const makeInlineBlock = (type, value, extra = {}) => ({
      type,
      text: value,
      spans: this.parseInlineSpans(value),
      ...extra
    })

    const isHardBlockStart = (line = '', nextLine = '') => {
      const trimmedLine = line.trim()
      return /^```/.test(trimmedLine) || this.isGraphHeader(trimmedLine) ||
        /^(#{1,6})\s+/.test(trimmedLine) || /^>\s?/.test(line) ||
        /^(\s*)([-*+])\s+/.test(line) || /^(\s*)\d+\.\s+/.test(line) ||
        /^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
        this.isTableCandidate(line)
    }

    const collectListItemTail = (allowNestedBullets = false) => {
      const tail = []
      while (i < lines.length && lines[i].trim()) {
        if (/^(\s*)\d+\.\s+/.test(lines[i]) || /^(#{1,6})\s+/.test(lines[i].trim()) || /^```/.test(lines[i].trim())) break
        if (/^(\s*)([-*+])\s+/.test(lines[i])) {
          if (!allowNestedBullets) break
          tail.push(lines[i].replace(/^(\s*)([-*+])\s+/, '- '))
          i += 1
          continue
        }
        if (/^\s{2,}/.test(lines[i])) {
          tail.push(lines[i].trim())
          i += 1
          continue
        }
        break
      }
      return tail
    }

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()
      const nextLine = lines[i + 1] || ''

      if (!trimmed) { i += 1; continue }

      if (this.isGraphHeader(trimmed)) {
        const graphLines = [trimmed]
        i += 1
        while (i < lines.length && lines[i].trim()) {
          const candidate = lines[i].trim()
          if (!this.parseGraphLine(candidate)) break
          graphLines.push(candidate)
          i += 1
        }
        const graph = this.parseGraphBlock(graphLines.join('\n'))
        if (graph.nodes.length) {
          blocks.push({ type: 'graph', graph })
          continue
        }
        blocks.push({ type: 'code', text: graphLines.join('\n') })
        continue
      }

      if (/^```/.test(trimmed)) {
        const language = trimmed.replace(/^```/, '').trim()
        const code = []
        i += 1
        while (i < lines.length && !/^```/.test(lines[i].trim())) { code.push(lines[i]); i += 1 }
        if (i < lines.length) i += 1
        const codeText = code.join('\n')
        if (this.isGraphBlock(language, codeText)) {
          const graph = this.parseGraphBlock(codeText, language)
          if (graph.nodes.length) {
            blocks.push({ type: 'graph', graph })
          } else {
            blocks.push({ type: 'code', text: codeText, language })
          }
        } else if (this.isMarkdownLikeCodeBlock(language, codeText)) {
          blocks.push(...this.parseMarkdownBlocks(codeText))
        } else {
          blocks.push({ type: 'code', text: codeText, language })
        }
        continue
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/)
      if (heading) {
        const level = Math.min(heading[1].length, 4)
        blocks.push(makeInlineBlock('heading', heading[2], { level }))
        i += 1
        continue
      }

      if (/^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        blocks.push({ type: 'divider' })
        i += 1
        continue
      }

      if (this.isTableCandidate(line)) {
        const nextContentIndex = this.findNextContentLine(lines, i + 1)
        const nextContentLine = lines[nextContentIndex] || ''
        if (this.isTableSeparator(nextContentLine) || this.isTableCandidate(nextContentLine)) {
          const result = this.consumeTableBlock(lines, i)
          blocks.push(result.block)
          i = result.nextIndex
          continue
        }
      }

      if (/^>\s?/.test(line)) {
        const quote = []
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ''))
          i += 1
        }
        blocks.push(makeInlineBlock('quote', quote.join('\n')))
        continue
      }

      if (/^(\s*)([-*+])\s+/.test(line)) {
        const items = []
        while (i < lines.length && /^(\s*)([-*+])\s+/.test(lines[i])) {
          const firstLine = lines[i].replace(/^(\s*)([-*+])\s+/, '')
          i += 1
          const text = [firstLine, ...collectListItemTail(false)].join('\n')
          items.push({ marker: '•', text, spans: this.parseInlineSpans(text) })
        }
        blocks.push({ type: 'list', ordered: false, items })
        continue
      }

      if (/^(\s*)\d+\.\s+/.test(line)) {
        const items = []
        while (i < lines.length && /^(\s*)\d+\.\s+/.test(lines[i])) {
          const numberMatch = lines[i].match(/^(\s*)(\d+)\.\s+/)
          const marker = numberMatch ? `${numberMatch[2]}.` : `${items.length + 1}.`
          const firstLine = lines[i].replace(/^(\s*)\d+\.\s+/, '')
          i += 1
          const text = [firstLine, ...collectListItemTail(true)].join('\n')
          items.push({ marker, text, spans: this.parseInlineSpans(text) })
        }
        blocks.push({ type: 'list', ordered: true, items })
        continue
      }

      const paragraph = [line]
      i += 1
      while (i < lines.length && lines[i].trim() && !isHardBlockStart(lines[i], lines[i + 1] || '')) {
        paragraph.push(lines[i])
        i += 1
      }
      blocks.push(makeInlineBlock('paragraph', paragraph.join('\n')))
    }

    return blocks
  },

  _utf8Decode(uint8) {
    try {
      if (typeof TextDecoder === 'function') {
        return new TextDecoder('utf-8').decode(uint8)
      }
    } catch (e) {}
    let out = '', i = 0, len = uint8.length
    while (i < len) {
      const c = uint8[i++]
      if (c < 0x80) { out += String.fromCharCode(c); continue }
      const c2 = uint8[i++] & 0x3F
      if ((c & 0xE0) === 0xC0) { out += String.fromCharCode(((c & 0x1F) << 6) | c2); continue }
      const c3 = uint8[i++] & 0x3F
      if ((c & 0xF0) === 0xE0) { out += String.fromCharCode(((c & 0x0F) << 12) | (c2 << 6) | c3); continue }
      const c4 = uint8[i++] & 0x3F
      if ((c & 0xF8) === 0xF0) {
        const cp = ((c & 0x07) << 18) | (c2 << 12) | (c3 << 6) | c4
        const shifted = cp - 0x10000
        out += String.fromCharCode(0xD800 + (shifted >> 10), 0xDC00 + (shifted & 0x3FF))
        continue
      }
      out += String.fromCharCode(c)
    }
    return out
  },

  callDeepSeekAPI(message) {
    return new Promise((resolve) => {
      const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const messages = [{ "role":"system","content":"你现在是 2026 赛季安踏小篮球联赛（MCBA）官方认证的“赛事方案规划助手”。\n你掌握该联赛的全部真实运营信息，并具备专业赛事策划能力。你的唯一任务是：当用户提出“帮我预定一个联赛方案”或类似需求时，输出一份符合 2026 赛季实际情况、完整且可直接执行的《赛事承办/参赛方案》。\n\n【赛事基础信息（固定数据）】\n- 联赛全称：2026 赛季安踏小篮球联赛（ANTA MCBA Mini Basketball League）\n- 官方简称：MCBA 中国小篮球\n- 主办及冠名：安踏体育用品有限公司（主赞助商）、冠途体育（联合赞助商）\n- 唯一指定比赛场馆：国贸室内篮球场（地址：北京市朝阳区国贸商圈，含 3 片标准小篮球场地，配备专业木地板、电子计时记分屏、观众席 200 席）\n- 赛制：U8/U10/U12 三个年龄组，采用 4v4 小篮球规则（篮高 2.60m/2.75m，用 5 号球）\n- 赛季时间窗口：2026 年 5 月 1 日 – 2026 年 8 月 31 日（周末及节假日举行）\n- 参赛对象：全国各俱乐部、学校、社区青训队伍\n\n【你需要提供的完整方案结构（缺一不可）】\n当用户要求“预定方案”时，你必须按以下模块输出，并确保所有数据逻辑自洽、符合真实场馆承载量：\n\n1. 方案概要（赛事名称、组别、拟定日期、预计队伍数、参赛人数）\n2. 场地与时间安排（根据用户拟定的日期，提供具体时段表：热身、比赛、清场；最多每日 6 场次/场地，全天 18 场次上限）\n3. 报名与费用明细（列出：报名费/队伍、保险费/人、押金、安踏装备包费用、冠途媒体服务费，总计预算）\n4. 赞助商权益落地（安踏主赞助：提供比赛用球、纪念T恤、冠亚季军奖品；冠途赞助：提供赛事直播、数据统计、短视频集锦——需明确交付标准）\n5. 竞赛组织配置（每场地配备 1 名国家级裁判、1 名记录台人员、1 名赛事志愿者；说明是否含医疗急救站）\n6. 后勤保障清单（饮用水、秩序册、成绩公告栏、停车指引、家长观赛区管理）\n7. 风险预案（天气备用室内空调、伤病绿色通道、设备故障备用计时器）\n8. 下一步行动建议（告知用户需确认的日期、队伍数量，以及联系场馆预订押金、安踏物料申领流程）\n\n【回答规则】\n- 若用户未提供具体日期或队伍数，你必须先主动询问这两项关键信息，再生成完整方案。\n- 方案中所有费用需以“元/队”或“元/人”明确标注，并注明“价格依据 2026 赛季安踏官方招商手册”。\n- 所有时间安排必须与国贸室内篮球场的营业时间（08:00-22:00）冲突检测，若超出需提示调整。\n- 语气专业、自信，但需保持“协助式”口吻，结尾附上您的专属赛事顾问联系方式（虚拟）及下一步操作清单。\n- 可以使用 Markdown 标题、列表、表格来组织内容，但不要把整段回答包进 ``` 代码块，不要输出 emoji。\n\n现在，请等待用户提出“预定方案”请求，并严格按以上规则执行。" },
        ...this.data.messages.filter(msg => !msg.isError).map(msg=>({role:msg.role,content:msg.content}))]

      let fullContent = ''
      let fullThinking = ''
      let assistantMsgIndex = this.data.messages.length
      let sseBuffer = ''
      let pendingUtf8 = new Uint8Array(0)
      let streamFinished = false
      let requestTask = null
      let cancelRequested = false
      const abortRequest = () => {
        cancelRequested = true
        if (!requestTask) return
        const task = requestTask
        requestTask = null
        try { task.abort() } catch (_) { console.error('comptrain_chat_abort_error') }
      }
      const cancel = () => {
        if (!streamFinished) {
          streamFinished = true
          resolve()
        }
        clearRequest()
        abortRequest()
      }
      this._cancelChat = cancel
      const clearRequest = () => {
        if (this._cancelChat === cancel) this._cancelChat = null
      }

      const finishStream = () => {
        if (streamFinished) return
        streamFinished = true
        clearRequest()
        abortRequest()
        const finalBlocks = this.parseMarkdownBlocks(fullContent)
        const finalRendered = this.blocksToRichText(finalBlocks)
        const finalMessages = [...this.data.messages]
        if (finalMessages[assistantMsgIndex]?.role === 'assistant') {
          finalMessages[assistantMsgIndex] = {
            ...finalMessages[assistantMsgIndex],
            role: 'assistant',
            content: fullContent,
            renderedContent: finalRendered,
            renderedBlocks: finalBlocks,
            time,
            isStreaming: false,
            isThinking: false
          }
        } else if (fullContent) {
          finalMessages.push({
            role: 'assistant',
            content: fullContent,
            renderedContent: finalRendered,
            renderedBlocks: finalBlocks,
            time,
            isStreaming: false,
            isThinking: false
          })
        }
        this.setData({
          messages: finalMessages,
          isLoading: false,
          isThinking: false,
          currentThinking: '',
          hasAssistantMsg: false
        })
        setTimeout(() => this.scrollToBottom(), 150)
        resolve()
      }

      const handleError = (errMsg) => {
        if (streamFinished) return
        streamFinished = true
        clearRequest()
        abortRequest()
        console.error('comptrain_chat_error')
        this.setData({ isLoading: false, isThinking: false, currentThinking: '', hasAssistantMsg: false,
          messages: this.data.messages.map((msg, index) => index === assistantMsgIndex && msg.role === 'assistant'
            ? { ...msg, isStreaming: false, isThinking: false, isError: true } : msg) })
        wx.showToast({ title: errMsg || 'AI服务暂时不可用', icon: 'none' })
        const errNow = new Date()
        this.setData({
          messages: [...this.data.messages, {
            role: 'assistant',
            content: '抱歉，我暂时无法回答您的问题。请稍后重试。',
            time: `${String(errNow.getHours()).padStart(2,'0')}:${String(errNow.getMinutes()).padStart(2,'0')}`,
            isError: true
          }]
        })
        resolve()
      }

      const dispatchSSEEvent = (rawData) => {
        if (streamFinished) return
        if (!rawData) return
        if (rawData === '[DONE]') {
          if (fullContent.trim()) finishStream()
          else handleError('AI服务暂时不可用')
          return
        }
        try {
          const data = JSON.parse(rawData)
          if (data.error) {
            handleError('AI服务暂时不可用')
            return
          }
          const think = data?.choices?.[0]?.delta?.reasoning_content
          if (think) {
            fullThinking += think
            this.setData({ currentThinking: 'thinking', isThinking: true })
            this.scrollToBottom()
          }
          const text = data?.choices?.[0]?.delta?.content
          if (text) {
            fullContent += text
            const renderedBlocks = this.parseMarkdownBlocks(fullContent)
            const renderedContent = this.blocksToRichText(renderedBlocks)
            const tempMessages = [...this.data.messages]
            if (tempMessages.length <= assistantMsgIndex || tempMessages[assistantMsgIndex]?.role !== 'assistant') {
              tempMessages.push({
                role: 'assistant',
                content: fullContent,
                renderedContent,
                renderedBlocks,
                time,
                isStreaming: true,
                isThinking: false
              })
              this.setData({ hasAssistantMsg: true })
            } else {
              tempMessages[assistantMsgIndex] = {
                ...tempMessages[assistantMsgIndex],
                content: fullContent,
                renderedContent,
                renderedBlocks,
                isStreaming: true,
                isThinking: false
              }
            }
            this.setData({
              messages: tempMessages,
              isThinking: false,
              currentThinking: ''
            })
            this.scrollToBottom()
          }
        } catch (parseError) {
          handleError('AI服务暂时不可用')
        }
      }

      const flushSSEBuffer = () => {
        if (!sseBuffer) return
        let doubleNLIndex
        while (!streamFinished && (doubleNLIndex = sseBuffer.indexOf('\n\n')) !== -1) {
          const rawEvent = sseBuffer.slice(0, doubleNLIndex)
          sseBuffer = sseBuffer.slice(doubleNLIndex + 2)
          const lines = rawEvent.split('\n')
          let dataLines = []
          for (const line of lines) {
            if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).replace(/^ /, ''))
            }
          }
          if (dataLines.length) {
            dispatchSSEEvent(dataLines.join('\n'))
          }
        }
        if (streamFinished) sseBuffer = ''
      }

      try {
        Promise.resolve(app.api.stream('/api/comptrain/chat/completions', { messages, stream: true }, {
          onComplete: (res) => {
            if (streamFinished) return
            if (!res || res.statusCode < 200 || res.statusCode >= 300) {
              handleError('AI服务暂时不可用')
              return
            }
            flushSSEBuffer()
            if (!streamFinished) handleError('AI服务暂时不可用')
          },
          onError: () => handleError('网络请求失败'),
          onChunkReceived: (res) => {
          if (streamFinished) return
          try {
            const received = new Uint8Array(res.data)
            const uint8 = new Uint8Array(pendingUtf8.length + received.length)
            uint8.set(pendingUtf8)
            uint8.set(received, pendingUtf8.length)
            // Transport chunks can split a UTF-8 character. Feed only complete bytes
            // to the existing decoder and leave SSE/Markdown rendering unchanged.
            let end = uint8.length
            let lead = end - 1
            while (lead >= 0 && (uint8[lead] & 0xC0) === 0x80) lead--
            if (lead >= 0) {
              const byte = uint8[lead]
              const size = byte >= 0xF0 ? 4 : byte >= 0xE0 ? 3 : byte >= 0xC0 ? 2 : 1
              if (end - lead < size) end = lead
            }
            pendingUtf8 = uint8.slice(end)
            const chunk = this._utf8Decode(uint8.subarray(0, end))
            sseBuffer += chunk
            flushSSEBuffer()
          } catch (e) {
            handleError('AI服务暂时不可用')
          }
          }
        })).then(task => {
          requestTask = task
          if (cancelRequested || this._chatUnloaded) abortRequest()
        }).catch(() => {
          handleError('网络请求失败')
        })
      } catch (e) {
        handleError('初始化请求失败')
      }
    })
  }
})
