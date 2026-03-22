// chat.js
Page({
  data: {
    userInput: '',
    messages: [],
    isLoading: false
  },

  onLoad() {
    // 初始化页面
  },

  onShow() {
    // 更新自定义TabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(2)
    }
  },

  // 返回按钮点击事件
  goBack() {
    wx.navigateBack()
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({ userInput: e.detail.value })
  },

  // 发送消息
  sendMessage() {
    const message = this.data.userInput.trim()
    if (!message) {
      wx.showToast({
        title: '请输入消息',
        icon: 'none'
      })
      return
    }
    
    // 添加用户消息到列表
    const newMessages = [...this.data.messages, { role: 'user', content: message }]
    this.setData({ 
      messages: newMessages,
      userInput: '',
      isLoading: true 
    })
    
    // 调用OpenAI API
    this.callOpenAIAPI(message)
  },

  // 调用OpenAI API
  callOpenAIAPI(message) {
    const apiKey = '12ce65e7-4cfd-4385-bf8b-bb47898e0a61'
    const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    
    // 构建消息历史
    const messages = [
      { "role": "system", "content": "你是人工智能助手" },
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
          const newMessages = [...this.data.messages, { role: 'assistant', content: aiResponse }]
          this.setData({ 
            messages: newMessages,
            isLoading: false 
          })
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
  },


})