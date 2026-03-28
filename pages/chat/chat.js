// chat.js - 优化版AI对话
Page({
  data: {
    userInput: '',
    messages: [],
    isLoading: false,
    scrollToView: ''
  },

  onLoad() {
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(2)
    }
  },

  goBack() {
    wx.navigateBack()
  },

  onInputChange(e) {
    this.setData({ userInput: e.detail.value })
  },

  sendQuickQuestion(e) {
    const question = e.currentTarget.dataset.question
    this.setData({ userInput: question })
    this.sendMessage()
  },

  sendMessage() {
    const message = this.data.userInput.trim()
    if (!message) {
      wx.showToast({
        title: '请输入消息',
        icon: 'none'
      })
      return
    }
    
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const newMessages = [...this.data.messages, { role: 'user', content: message, time }]
    this.setData({ 
      messages: newMessages,
      userInput: '',
      isLoading: true,
      scrollToView: 'msg-loading'
    })
    
    setTimeout(() => {
      this.setData({ scrollToView: `msg-${newMessages.length}` })
    }, 100)
    
    this.callOpenAIAPI(message)
  },

  callOpenAIAPI(message) {
    const apiKey = '12ce65e7-4cfd-4385-bf8b-bb47898e0a61'
    const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const messages = [
      { "role": "system", "content": "你是昇梦AI助手，一位专业的篮球训练顾问。你深度了解用户的训练数据、比赛记录和技能雷达图，能够提供个性化的篮球训练建议。你的回答应该专业、实用、有针对性，并且要体现出你了解用户的具体情况。" },
      ...this.data.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { "role": "user", "content": message }
    ]
    
    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: {
        "model": "ep-20260322162122-hgksb",
        "messages": messages
      },
      success: (res) => {
        console.log('API调用成功:', res)
        if (res.data && res.data.choices && res.data.choices[0]) {
          const aiResponse = res.data.choices[0].message.content
          const newMessages = [...this.data.messages, { role: 'assistant', content: aiResponse, time }]
          this.setData({ 
            messages: newMessages,
            isLoading: false 
          })
          setTimeout(() => {
            this.setData({ scrollToView: `msg-${newMessages.length}` })
          }, 100)
        } else {
          this.setData({ isLoading: false })
          wx.showToast({
            title: 'API返回格式错误',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.log('API调用失败:', err)
        this.setData({ isLoading: false })
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
      }
    })
  }
})