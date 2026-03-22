// training.js
Page({
  data: {
    // 能力雷达图数据
    radarData: {
      dimensions: ['投篮', '身体素质', '突破/上篮', '组织', '控球/运球', '防守'],
      values: [75, 65, 80, 70, 85, 60]
    }
  },

  onLoad() {
    // 绘制雷达图
    this.drawRadarChart()
  },

  onShow() {
    // 更新自定义TabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(2)
    }
  },

  // 导航到聊天页面
  navigateToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    })
  },

  // 绘制雷达图
  drawRadarChart() {
    const ctx = wx.createCanvasContext('radarChart')
    const data = this.data.radarData
    const width = wx.getSystemInfoSync().windowWidth - 40
    const height = 400
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 40

    // 绘制网格
    for (let i = 1; i <= 5; i++) {
      const r = radius * i / 5
      ctx.beginPath()
      for (let j = 0; j < data.dimensions.length; j++) {
        const angle = (j * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
        const x = centerX + r * Math.cos(angle)
        const y = centerY + r * Math.sin(angle)
        if (j === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.setStrokeStyle('#e0e0e0')
      ctx.stroke()
    }

    // 绘制轴线
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.setStrokeStyle('#e0e0e0')
      ctx.stroke()
    }

    // 绘制数据区域
    ctx.beginPath()
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const r = radius * data.values[i] / 100
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.setFillStyle('rgba(26, 115, 232, 0.2)')
    ctx.fill()
    ctx.setStrokeStyle('#1A73E8')
    ctx.setLineWidth(2)
    ctx.stroke()

    // 绘制标签
    ctx.setFontSize(12)
    ctx.setFillStyle('#fff')
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const r = radius + 20
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      ctx.fillText(data.dimensions[i], x - 20, y + 5)
    }

    ctx.draw()
  },


})