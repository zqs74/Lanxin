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
    hasAssistantMsg: false
  },

  onLoad() { this.initTheme() },

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
    this._syncTheme()
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
      return
    }
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  toggleThinking(e) {
    const index = e.currentTarget.dataset.index
    const messages = [...this.data.messages]
    if (messages[index] && messages[index].thinking) { messages[index].showThinking = !messages[index].showThinking; this.setData({ messages }) }
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

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  },

  escapeAttr(text = '') {
    return this.escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  },

  normalizeMarkdown(text = '') {
    return String(text)
      .replace(/\\([*_`~\[\]()#+\-.!|>])/g, '$1')
      .replace(/[✅☑️]/g, '- ')
      .replace(/^\s*[•·]\s+/gm, '- ')
      .replace(/^\s*-\s+/gm, '- ')
  },

  parseInlineMarkdown(text = '') {
    const codeBlocks = []
    let html = this.normalizeMarkdown(text).replace(/`([^`]+)`/g, (_, code) => {
      const token = `@@INLINE_CODE_${codeBlocks.length}@@`
      codeBlocks.push(`<code>${this.escapeHtml(code)}</code>`)
      return token
    })

    html = this.escapeHtml(html)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src="${this.escapeAttr(src)}" alt="${this.escapeAttr(alt)}" style="max-width:100%;border-radius:12rpx;margin:16rpx 0;"/>`)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${this.escapeAttr(href)}">${label}</a>`)
    html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
    html = html.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>')
    html = html.replace(/(^|[^\*])\*([^\*\n]+)\*/g, '$1<em>$2</em>')
    html = html.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>')
    codeBlocks.forEach((code, index) => { html = html.replace(`@@INLINE_CODE_${index}@@`, code) })
    return html
  },

  parseTableRow(row = '') {
    let cells = row.trim()
    if (cells.startsWith('|')) cells = cells.slice(1)
    if (cells.endsWith('|')) cells = cells.slice(0, -1)
    return cells.split('|').map(cell => cell.trim())
  },

  isTableSeparator(line = '') {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
  },

  isBlockStart(line = '', nextLine = '') {
    return /^```/.test(line) || /^(#{1,6})\s+/.test(line) || /^>\s?/.test(line) ||
      /^(\s*)([-*+])\s+/.test(line) || /^(\s*)\d+\.\s+/.test(line) ||
      /^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line) || (line.includes('|') && this.isTableSeparator(nextLine))
  },

  parseMarkdown(text) {
    if (!text) return ''
    const lines = this.normalizeMarkdown(text).replace(/\r\n/g, '\n').split('\n')
    const html = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()
      const nextLine = lines[i + 1] || ''

      if (!trimmed) { i += 1; continue }

      if (/^```/.test(trimmed)) {
        const language = trimmed.replace(/^```/, '').trim()
        const code = []
        i += 1
        while (i < lines.length && !/^```/.test(lines[i].trim())) { code.push(lines[i]); i += 1 }
        if (i < lines.length) i += 1
        html.push(`<pre><code data-language="${this.escapeAttr(language)}">${this.escapeHtml(code.join('\n'))}</code></pre>`)
        continue
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/)
      if (heading) {
        const level = Math.min(heading[1].length, 4)
        html.push(`<h${level}>${this.parseInlineMarkdown(heading[2])}</h${level}>`)
        i += 1
        continue
      }

      if (/^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        html.push('<hr/>')
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
        html.push(`<table><thead><tr>${headers.map(cell => `<th>${this.parseInlineMarkdown(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${this.parseInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`)
        continue
      }

      if (/^>\s?/.test(line)) {
        const quote = []
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ''))
          i += 1
        }
        html.push(`<blockquote>${this.parseInlineMarkdown(quote.join('\n')).replace(/\n/g, '<br/>')}</blockquote>`)
        continue
      }

      if (/^(\s*)([-*+])\s+/.test(line)) {
        const items = []
        while (i < lines.length && /^(\s*)([-*+])\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^(\s*)([-*+])\s+/, ''))
          i += 1
        }
        html.push(`<ul>${items.map(item => `<li>${this.parseInlineMarkdown(item)}</li>`).join('')}</ul>`)
        continue
      }

      if (/^(\s*)\d+\.\s+/.test(line)) {
        const items = []
        while (i < lines.length && /^(\s*)\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^(\s*)\d+\.\s+/, ''))
          i += 1
        }
        html.push(`<ol>${items.map(item => `<li>${this.parseInlineMarkdown(item)}</li>`).join('')}</ol>`)
        continue
      }

      const paragraph = [line]
      i += 1
      while (i < lines.length && lines[i].trim() && !this.isBlockStart(lines[i], lines[i + 1] || '')) {
        paragraph.push(lines[i])
        i += 1
      }
      html.push(`<p>${this.parseInlineMarkdown(paragraph.join('\n')).replace(/\n/g, '<br/>')}</p>`)
    }

    return html.join('')
  },

  async callCloudAI(message) {
    try {
      const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const messages = [{ "role":"system","content":"你是昇梦AI助手，一位专业的篮球训练顾问。你深度了解用户的训练数据、比赛记录和技能雷达图，能够提供个性化的篮球训练建议。你的回答应该专业、实用、有针对性，并且要体现出你了解用户的具体情况。回答时可以使用Markdown格式来组织内容。" },
        ...this.data.messages.map(msg=>({role:msg.role,content:msg.content}))]
      const res = await wx.cloud.extend.AI.createModel("deepseek").streamText({data:{model:"deepseek-r1-0528",messages}})
      let fullContent='';let fullThinking='';let assistantMsgIndex=this.data.messages.length
      for await(let event of res.eventStream) {
        if(event.data==="[DONE]")break
        try{const data=JSON.parse(event.data);const think=data?.choices?.[0]?.delta?.reasoning_content
          if(think){fullThinking+=think;const tempMessages=[...this.data.messages]
            if(tempMessages[assistantMsgIndex]?.role==='assistant'){tempMessages[assistantMsgIndex]={...tempMessages[assistantMsgIndex],thinking:fullThinking,showThinking:false,isStreaming:true,isThinking:true};this.setData({messages:tempMessages,currentThinking:fullThinking,isThinking:true,hasAssistantMsg:true})}
            else{this.setData({currentThinking:fullThinking,isThinking:true,hasAssistantMsg:false})}
            this.scrollToBottom()}
          const text=data?.choices?.[0]?.delta?.content
          if(text){fullContent+=text;const renderedContent=this.parseMarkdown(fullContent);const tempMessages=[...this.data.messages]
            if(tempMessages.length<=assistantMsgIndex||tempMessages[assistantMsgIndex]?.role!=='assistant'){tempMessages.push({role:'assistant',content:fullContent,renderedContent,thinking:fullThinking,showThinking:false,time,isStreaming:true,isThinking:false});this.setData({hasAssistantMsg:true})}
            else{tempMessages[assistantMsgIndex]={...tempMessages[assistantMsgIndex],content:fullContent,renderedContent,thinking:fullThinking,showThinking:false,isStreaming:true,isThinking:false}}
            this.setData({messages:tempMessages,isThinking:false,currentThinking:''})
            this.scrollToBottom()}}
        catch(parseError){console.log('解析事件数据失败:',parseError)}}
      const finalRendered=this.parseMarkdown(fullContent);const finalMessages=[...this.data.messages]
      if(finalMessages[assistantMsgIndex]?.role==='assistant'){finalMessages[assistantMsgIndex]={...finalMessages[assistantMsgIndex],role:'assistant',content:fullContent,renderedContent:finalRendered,thinking:fullThinking,showThinking:false,time,isStreaming:false,isThinking:false}}
      else if(fullContent){finalMessages.push({role:'assistant',content:fullContent,renderedContent:finalRendered,thinking:fullThinking,showThinking:false,time,isStreaming:false,isThinking:false})}
      this.setData({messages:finalMessages,isLoading:false,isThinking:false,currentThinking:'',hasAssistantMsg:false});setTimeout(()=>this.scrollToBottom(),150)
    }catch(error){console.error('云开发AI调用失败:',error);this.setData({isLoading:false,isThinking:false,currentThinking:''})
      wx.showToast({title:error.errMsg||'AI服务暂时不可用',icon:'none'});const now=new Date()
      this.setData({messages:[...this.data.messages,{role:'assistant',content:'抱歉，我暂时无法回答您的问题。请稍后重试。',time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,isError:true}]})}
  }
})
