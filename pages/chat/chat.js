// chat.js - 昇梦体育 DeepSeek-R1 AI对话
const app = getApp()

Page({
  data: {
    themeClass: '',
    userInput: '',
    messages: [],
    isLoading: false,
    scrollToView: '',
    currentThinking: '',
    isThinking: false,
    hasAssistantMsg: false
  },

  onLoad() { this.initTheme() },

  initTheme() {
    const userTheme = app.getUserTheme()
    this.setData({ themeClass: userTheme === 'auto' ? '' : (userTheme === 'light' ? 'theme-light' : 'theme-dark') })
  },

  setTheme(theme) {
    const userTheme = app.getUserTheme()
    this.setData({ themeClass: userTheme === 'auto' ? '' : (userTheme === 'light' ? 'theme-light' : 'theme-dark') })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().updateSelected(2) }
    const userTheme = app.getUserTheme()
    this.setData({ themeClass: userTheme === 'auto' ? '' : (userTheme === 'light' ? 'theme-light' : 'theme-dark') })
  },

  goBack() { wx.navigateBack() },

  toggleThinking(e) {
    const index = e.currentTarget.dataset.index
    const messages = [...this.data.messages]
    if (messages[index] && messages[index].thinking) { messages[index].showThinking = !messages[index].showThinking; this.setData({ messages }) }
  },

  onInputChange(e) { this.setData({ userInput: e.detail.value }) },

  sendQuickQuestion(e) { this.setData({ userInput: e.currentTarget.dataset.question }); this.sendMessage() },

  sendMessage() {
    const message = this.data.userInput.trim()
    if (!message) { wx.showToast({ title: '请输入消息', icon: 'none' }); return }
    const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const newMessages = [...this.data.messages, { role: 'user', content: message, time }]
    this.setData({ messages: newMessages, userInput: '', isLoading: true, isThinking: true, currentThinking: '', hasAssistantMsg: false, scrollToView: 'msg-loading' })
    setTimeout(() => { this.setData({ scrollToView: `msg-${newMessages.length}` }) }, 100)
    this.callCloudAI(message)
  },

  parseMarkdown(text) {
    if (!text) return ''
    let html = text; html = html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g,'<pre><code>$2</code></pre>')
    html = html.replace(/`([^`]+)`/g,'<code>$1</code>')
    html = html.replace(/^#### (.+)$/gm,'<h4>$1</h4>'); html = html.replace(/^### (.+)$/gm,'<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm,'<h2>$1</h2>'); html = html.replace(/^# (.+)$/gm,'<h1>$1</h1>')
    html = html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); html = html.replace(/__(.+?)__/g,'<strong>$1</strong>')
    html = html.replace(/\*([^*]+)\*/g,'<em>$1</em>'); html = html.replace(/_([^_]+)_/g,'<em>$1</em>')
    html = html.replace(/~~(.+?)~~/g,'<del>$1</del>')
    html = html.replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>')
    html = html.replace(/^[\-\*] (.+)$/gm,'<li>$1</li>'); html = html.replace(/(<li>.*<\/li>\n?)+/g,'<ul>$&</ul>')
    html = html.replace(/^\d+\. (.+)$/gm,'<li>$1</li>'); html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm,'<hr/>')
    html = html.replace(/\|(.+?)\|\n\|(-+\|)+\n((?:\|.+?\|\n)*)/g, (match,headerRow,separator,contentRows) => {
      let tableHtml='<table>\n<thead>\n<tr>'; const headers=headerRow.split('|').map(h=>h.trim()).filter(h=>h)
      headers.forEach(header=>{tableHtml+=`<th>${header}</th>`}); tableHtml+='</tr>\n</thead>\n<tbody>'
      const rows=contentRows.trim().split('\n'); rows.forEach(row=>{ if(row.trim()){ tableHtml+='\n<tr>'
        const cells=row.split('|').map(cell=>cell.trim()).filter(cell=>cell); cells.forEach(cell=>{tableHtml+=`<td>${cell}</td>`})
        tableHtml+='</tr>'}}); tableHtml+='\n</tbody>\n</table>'; return tableHtml })
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" style="max-width:100%;border-radius:12rpx;margin:16rpx 0;"/>')
    html = html.replace(/\n\n+/g,'</p><p>'); html = html.replace(/\n/g,'<br/>')
    html = html.replace(/<p><\/p>/g,''); html = html.replace(/<p>(<h[1-6]>)/g,'$1'); html = html.replace(/(<\/h[1-6]>)<\/p>/g,'$1')
    html = html.replace(/<p>(<ul>)/g,'$1'); html = html.replace(/(<\/ul>)<\/p>/g,'$1')
    html = html.replace(/<p>(<blockquote>)/g,'$1'); html = html.replace(/(<\/blockquote>)<\/p>/g,'$1')
    html = html.replace(/<p>(<pre>)/g,'$1'); html = html.replace(/(<\/pre>)<\/p>/g,'$1'); html = html.replace(/<p>(<hr\/>)<\/p>/g,'$1')
    return html
  },

  async callCloudAI(message) {
    try {
      const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const messages = [{ "role":"system","content":"你是昇梦AI助手，一位专业的篮球训练顾问。你深度了解用户的训练数据、比赛记录和技能雷达图，能够提供个性化的篮球训练建议。你的回答应该专业、实用、有针对性，并且要体现出你了解用户的具体情况。回答时可以使用Markdown格式来组织内容。" },
        ...this.data.messages.map(msg=>({role:msg.role,content:msg.content})), {"role":"user","content":message}]
      const res = await wx.cloud.extend.AI.createModel("deepseek").streamText({data:{model:"deepseek-r1-0528",messages}})
      let fullContent='';let fullThinking='';let assistantMsgIndex=this.data.messages.length
      for await(let event of res.eventStream) {
        if(event.data==="[DONE]")break
        try{const data=JSON.parse(event.data);const think=data?.choices?.[0]?.delta?.reasoning_content
          if(think){fullThinking+=think;this.setData({currentThinking:fullThinking,isThinking:true,hasAssistantMsg:false})}
          const text=data?.choices?.[0]?.delta?.content
          if(text){fullContent+=text;const renderedContent=this.parseMarkdown(fullContent);const tempMessages=[...this.data.messages]
            if(tempMessages.length<=assistantMsgIndex||tempMessages[assistantMsgIndex]?.role!=='assistant'){tempMessages.push({role:'assistant',content:fullContent,renderedContent,time,isStreaming:true});this.setData({hasAssistantMsg:true})}
            else{tempMessages[assistantMsgIndex]={...tempMessages[assistantMsgIndex],content:fullContent,renderedContent,isStreaming:true}}
            this.setData({messages:tempMessages,scrollToView:`msg-${tempMessages.length-1}`})}}
        catch(parseError){console.log('解析事件数据失败:',parseError)}}
      const finalRendered=this.parseMarkdown(fullContent);const finalMessages=[...this.data.messages]
      if(finalMessages[assistantMsgIndex]?.role==='assistant'){finalMessages[assistantMsgIndex]={role:'assistant',content:fullContent,renderedContent:finalRendered,time,isStreaming:false}}
      else if(fullContent){finalMessages.push({role:'assistant',content:fullContent,renderedContent:finalRendered,time,isStreaming:false})}
      this.setData({messages:finalMessages,isLoading:false,isThinking:false,currentThinking:''});setTimeout(()=>{this.setData({scrollToView:`msg-${finalMessages.length-1}`})},150)
    }catch(error){console.error('云开发AI调用失败:',error);this.setData({isLoading:false,isThinking:false,currentThinking:''})
      wx.showToast({title:error.errMsg||'AI服务暂时不可用',icon:'none'});const now=new Date()
      this.setData({messages:[...this.data.messages,{role:'assistant',content:'抱歉，我暂时无法回答您的问题。请稍后重试。',time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,isError:true}]})}
  }
})
