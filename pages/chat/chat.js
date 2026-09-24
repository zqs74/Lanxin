const privacy = require('../../utils/privacy')
// chat.js - 昇梦体育 AI辅助 AI对话
const app = getApp()

Page({
  ...privacy.pageMethods,

  // 微信要求页面实现 onShareAppMessage 才允许转发，否则右上角菜单置灰并提示「当前页面不可转发」
  onShareAppMessage() {
    return { title: '昇梦体育 · AI 篮球赛训助手', path: '/pages/index/index' }
  },

  // 「分享到朋友圈」由 onShareTimeline 提供（仅 Android 微信支持该入口）
  onShareTimeline() {
    return { title: '昇梦体育 · AI 篮球赛训助手' }
  },

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
    this.cancelPrivacyAuthorization()
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

  onHide() {
    this.cancelPrivacyAuthorization()
    if (this._cancelChat) this._cancelChat()
    this.setData({ isLoading: false, isThinking: false })
  },

  onShow() {
    if (this._chatOwner && app.api.getUser() !== this._chatOwner) {
      if (this._cancelChat) this._cancelChat()
      this._chatOwner = null
      this.setData({ messages: [], userInput: '', isLoading: false, isThinking: false, currentThinking: '' })
    }
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

  sendQuickQuestion(e) { this.setData({ userInput: e.currentTarget.dataset.question }); return this.sendMessage() },

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

  async sendMessage() {
    if (this.data.isLoading || this._chatUnloaded || this._sendPending) return
    const message = this.data.userInput.trim()
    if (!message) { wx.showToast({ title: '请输入消息', icon: 'none' }); return }
    const generation = this._privacyGeneration || 0
    this._sendPending = true
    try {
      if (!await privacy.ensurePrivacy(this) || this._chatUnloaded) return
      await app.api.ensureLogin()
      const owner = app.api.getUser()
      if (!owner || this._chatUnloaded || generation !== (this._privacyGeneration || 0)) return
      if (this._chatOwner !== owner) {
        this.setData({ messages: [] })
        this._chatOwner = owner
      }
      // Per-send consent is never stored or reused, even for the same account.
      if (!await privacy.confirmNotice(privacy.AI_NOTICE, 'AI 对话数据告知')) return
      if (this._chatUnloaded || generation !== (this._privacyGeneration || 0) || app.api.getUser() !== owner) return
      const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const newMessages = [...this.data.messages, { role: 'user', content: message, time }]
      this.setData({ messages: newMessages, userInput: '', isLoading: true, isThinking: true, currentThinking: '', hasAssistantMsg: false, scrollToView: 'msg-bottom' })
      setTimeout(() => this.scrollToBottom(), 80)
      return this.callAIAPI(message)
    } catch (_) { wx.showToast({ title: '发送前检查失败，请重试', icon: 'none' }) }
    finally { this._sendPending = false }
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

  callAIAPI(message) {
    return new Promise((resolve) => {
      const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const messages = [{ role: 'system', content: "你是面向东莞篮球爱好者的 AI 辅助助手，提供通用训练、参赛和赛事筹备建议。你不代表任何联赛、品牌、场馆或官方机构，没有官方认证，不能办理预约或保证名额。对具体赛事、赛季、场馆、档期、价格、赞助权益和联系人，只能依据用户提供或已核实的信息；未知时明确说明待核实，不得编造或声称掌握实时数据。预算可列费用项目；若用户要求估算，必须标为假设示例，不能当作真实报价，不得虚构报价依据、固定场馆或联系方式。以东莞为默认讨论地区；拟定方案前询问日期、人数或队伍数、预算等必要条件，不索取敏感信息或未成年人资料。方案和 AI 输出仅供参考，具体规则、价格、档期请向实际主办方或场馆核实。可以使用 Markdown 标题、列表和表格，不要把整段回答放入代码块。" },
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
      const currentAccount = () => {
        if (streamFinished) return false
        if (this._chatUnloaded) { cancel(); return false }
        if (this._chatOwner && app.api.getUser() !== this._chatOwner) {
          cancel()
          this._chatOwner = null
          this.setData({ messages: [], userInput: '', isLoading: false, isThinking: false, currentThinking: '' })
          return false
        }
        return true
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
          expectedUser: this._chatOwner,
          onComplete: (res) => {
            if (!currentAccount()) return
            if (streamFinished) return
            if (!res || res.statusCode < 200 || res.statusCode >= 300) {
              handleError('AI服务暂时不可用')
              return
            }
            flushSSEBuffer()
            if (!streamFinished) handleError('AI服务暂时不可用')
          },
          onError: () => { if (currentAccount()) handleError('网络请求失败') },
          onChunkReceived: (res) => {
          if (!currentAccount()) return
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
          if (currentAccount()) handleError('网络请求失败')
        })
      } catch (e) {
        handleError('初始化请求失败')
      }
    })
  }
})
