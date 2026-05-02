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
    this.initLayout()
    this.initTheme()
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
    this.setData({
      scrollToView: '',
      thinkingScrollToView: ''
    })
    setTimeout(() => {
      this.setData({
        scrollToView: 'msg-bottom',
        thinkingScrollToView: 'thinking-bottom'
      })
    }, 20)
  },

  sendMessage() {
    const message = this.data.userInput.trim()
    if (!message) { wx.showToast({ title: '请输入消息', icon: 'none' }); return }
    const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const newMessages = [...this.data.messages, { role: 'user', content: message, time }]
    this.setData({ messages: newMessages, userInput: '', isLoading: true, isThinking: true, currentThinking: '', hasAssistantMsg: false, scrollToView: 'msg-bottom' })
    setTimeout(() => this.scrollToBottom(), 80)
    this.callCloudAI(message)
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

  isTableSeparator(line = '') {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line) ||
      /^\s*\|?[\s\-:|]+\|?\s*$/.test(line)
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
    const lines = this.normalizeMarkdown(text).replace(/\r\n/g, '\n').split('\n')
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
        (line.includes('|') && this.isTableSeparator(nextLine))
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

      if (line.includes('|') && this.isTableSeparator(nextLine)) {
        const headers = this.parseTableRow(line)
        i += 2
        const rows = []
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          rows.push(this.parseTableRow(lines[i]))
          i += 1
        }
        blocks.push({
          type: 'table',
          headers,
          rows: rows.map(row => headers.map((header, cellIndex) => ({
            header,
            value: row[cellIndex] || ''
          })))
        })
        continue
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

  async callCloudAI(message) {
    try {
      const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const messages = [{ "role":"system","content":"你是昇梦AI助手，一位专业的篮球训练顾问。你深度了解用户的训练数据、比赛记录和技能雷达图，能够提供个性化的篮球训练建议。回答要专业、实用、有针对性。可以使用 Markdown 标题、列表、表格来组织内容，但不要把整段回答包进 ``` 代码块，不要输出 emoji。" },
        ...this.data.messages.map(msg=>({role:msg.role,content:msg.content}))]
      const res = await wx.cloud.extend.AI.createModel("deepseek").streamText({data:{model:"deepseek-r1-0528",messages}})
      let fullContent='';let fullThinking='';let assistantMsgIndex=this.data.messages.length
      for await(let event of res.eventStream) {
        if(event.data==="[DONE]")break
        try{const data=JSON.parse(event.data);const think=data?.choices?.[0]?.delta?.reasoning_content
          if(think){fullThinking+=think
            this.setData({currentThinking:'thinking',isThinking:true})
            this.scrollToBottom()}
          const text=data?.choices?.[0]?.delta?.content
          if(text){fullContent+=text;const renderedBlocks=this.parseMarkdownBlocks(fullContent);const renderedContent=this.blocksToRichText(renderedBlocks);const tempMessages=[...this.data.messages]
            if(tempMessages.length<=assistantMsgIndex||tempMessages[assistantMsgIndex]?.role!=='assistant'){tempMessages.push({role:'assistant',content:fullContent,renderedContent,renderedBlocks,time,isStreaming:true,isThinking:false});this.setData({hasAssistantMsg:true})}
            else{tempMessages[assistantMsgIndex]={...tempMessages[assistantMsgIndex],content:fullContent,renderedContent,renderedBlocks,isStreaming:true,isThinking:false}}
            this.setData({messages:tempMessages,isThinking:false,currentThinking:''})
            this.scrollToBottom()}}
        catch(parseError){console.log('解析事件数据失败:',parseError)}}
      const finalBlocks=this.parseMarkdownBlocks(fullContent);const finalRendered=this.blocksToRichText(finalBlocks);const finalMessages=[...this.data.messages]
      if(finalMessages[assistantMsgIndex]?.role==='assistant'){finalMessages[assistantMsgIndex]={...finalMessages[assistantMsgIndex],role:'assistant',content:fullContent,renderedContent:finalRendered,renderedBlocks:finalBlocks,time,isStreaming:false,isThinking:false}}
      else if(fullContent){finalMessages.push({role:'assistant',content:fullContent,renderedContent:finalRendered,renderedBlocks:finalBlocks,time,isStreaming:false,isThinking:false})}
      this.setData({messages:finalMessages,isLoading:false,isThinking:false,currentThinking:'',hasAssistantMsg:false});setTimeout(()=>this.scrollToBottom(),150)
    }catch(error){console.error('云开发AI调用失败:',error);this.setData({isLoading:false,isThinking:false,currentThinking:''})
      wx.showToast({title:error.errMsg||'AI服务暂时不可用',icon:'none'});const now=new Date()
      this.setData({messages:[...this.data.messages,{role:'assistant',content:'抱歉，我暂时无法回答您的问题。请稍后重试。',time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,isError:true}]})}
  }
})
