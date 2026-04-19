// match-detail.js
Page({
  data: {
    navHeight: 0,
    // 当前选中的标签
    activeTab: 0,
    // 已选择的片段数量
    selectedCount: 0,
    // 片段列表
    clips: [
      { id: 1, time: '第一节 08:24', type: '两分跳投', result: '命中', selected: false },
      { id: 2, time: '第一节 06:12', type: '突破上篮', result: '命中', selected: false },
      { id: 3, time: '第二节 10:05', type: '三分远投', result: '命中', selected: false }
    ],
    // 比分数据
    score: {
      redTeam: 109,
      blueTeam: 105,
      time: '03.13 21:05'
    },
    // 比分走势数据
    scoreTrend: {
      quarters: ['第一节', '第二节', '第三节', '第四节'],
      redTeam: [25, 50, 78, 109],
      blueTeam: [23, 48, 76, 105]
    },
    // 比赛表现数据
    performance: [
      { name: '得分', redTeam: 109, blueTeam: 105 },
      { name: '篮板', redTeam: 57, blueTeam: 45 },
      { name: '助攻', redTeam: 19, blueTeam: 27 },
      { name: '投篮命中率', redTeam: '39.4%', blueTeam: '35.9%' },
      { name: '三分命中率', redTeam: '24.0%', blueTeam: '29.7%' },
      { name: '三分', redTeam: 12, blueTeam: 11 },
      { name: '罚球', redTeam: 19, blueTeam: 11 }
    ],
    // 投篮数据
    shootingData: {
      quarters: ['第一节', '第二节', '第三节', '第四节'],
      made: [3, 4, 2, 5],
      attempted: [6, 8, 7, 9]
    }
  },

  // 页面加载
  onLoad: function(options) {
    this.setNavHeight()
  },

  setNavHeight: function() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
    this.setData({
      navHeight: (statusBarHeight + navBarHeight) * 2
    })
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack()
  },

  // 切换标签
  switchTab: function(e) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({ activeTab: index })
  },

  // 播放视频
  playVideo: function() {
    // 预留视频播放逻辑
    console.log('播放视频')
  },

  // 选择片段
  selectClip: function(e) {
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips
    clips[index].selected = !clips[index].selected
    
    // 计算已选择的片段数量
    const selectedCount = clips.filter(clip => clip.selected).length
    
    this.setData({ clips, selectedCount })
  },

  // 开始剪辑
  startEdit: function() {
    if (this.data.selectedCount > 0) {
      // 预留剪辑逻辑
      console.log('开始剪辑')
    }
  },

  // 进入自定义比赛
  startCustomMatch: function() {
    const matchId = 'custom_' + Date.now()
    wx.navigateTo({
      url: `/pages/custom-match-setup/custom-match-setup?matchId=${matchId}`
    })
  },

  // 绘制比分走势折线图
  drawScoreTrend: function() {
    const ctx = wx.createCanvasContext('scoreTrendCanvas')
    const data = this.data.scoreTrend
    const width = 343
    const height = 200
    const padding = 40
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    
    // 绘制网格
    ctx.setStrokeStyle('#333')
    ctx.setLineWidth(1)
    
    // 绘制纵轴
    for (let i = 0; i <= 6; i++) {
      const y = padding + (height - 2 * padding) / 6 * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      
      // 绘制刻度
      ctx.setFillStyle('#999')
      ctx.setFontSize(12)
      ctx.textAlign = 'right'
      ctx.fillText(120 - i * 20, padding - 5, y + 4)
    }
    
    // 绘制横轴
    for (let i = 0; i < data.quarters.length; i++) {
      const x = padding + (width - 2 * padding) / (data.quarters.length - 1) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      
      // 绘制刻度
      ctx.setFillStyle('#999')
      ctx.setFontSize(12)
      ctx.textAlign = 'center'
      ctx.fillText(data.quarters[i], x, height - padding + 15)
    }
    
    // 绘制红队数据线
    ctx.setStrokeStyle('#7A41FF')
    ctx.setLineWidth(2)
    ctx.beginPath()
    for (let i = 0; i < data.redTeam.length; i++) {
      const x = padding + (width - 2 * padding) / (data.redTeam.length - 1) * i
      const y = height - padding - (data.redTeam[i] / 120) * (height - 2 * padding)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    
    // 绘制红队数据点
    for (let i = 0; i < data.redTeam.length; i++) {
      const x = padding + (width - 2 * padding) / (data.redTeam.length - 1) * i
      const y = height - padding - (data.redTeam[i] / 120) * (height - 2 * padding)
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#7A41FF'
      ctx.fill()
    }
    
    // 绘制蓝队数据线
    ctx.setStrokeStyle('#5A21CF')
    ctx.setLineWidth(2)
    ctx.beginPath()
    for (let i = 0; i < data.blueTeam.length; i++) {
      const x = padding + (width - 2 * padding) / (data.blueTeam.length - 1) * i
      const y = height - padding - (data.blueTeam[i] / 120) * (height - 2 * padding)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    
    // 绘制蓝队数据点
    for (let i = 0; i < data.blueTeam.length; i++) {
      const x = padding + (width - 2 * padding) / (data.blueTeam.length - 1) * i
      const y = height - padding - (data.blueTeam[i] / 120) * (height - 2 * padding)
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#5A21CF'
      ctx.fill()
    }
    
    ctx.draw()
  },

  // 绘制投篮数直方图
  drawShootingChart: function() {
    const ctx = wx.createCanvasContext('shootingChartCanvas')
    const data = this.data.shootingData
    const width = 343
    const height = 200
    const padding = 40
    const barWidth = (width - 2 * padding) / (data.quarters.length * 2 + data.quarters.length - 1)
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    
    // 绘制网格
    ctx.setStrokeStyle('#333')
    ctx.setLineWidth(1)
    
    // 绘制纵轴
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) / 5 * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      
      // 绘制刻度
      ctx.setFillStyle('#999')
      ctx.setFontSize(12)
      ctx.textAlign = 'right'
      ctx.fillText(10 - i * 2, padding - 5, y + 4)
    }
    
    // 绘制横轴
    for (let i = 0; i < data.quarters.length; i++) {
      const x = padding + (barWidth * 3) * i + barWidth * 1.5
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      
      // 绘制刻度
      ctx.setFillStyle('#999')
      ctx.setFontSize(12)
      ctx.textAlign = 'center'
      ctx.fillText(data.quarters[i], x, height - padding + 15)
    }
    
    // 绘制柱状图
    for (let i = 0; i < data.quarters.length; i++) {
      // 进球数柱子
      const madeX = padding + (barWidth * 3) * i
      const madeHeight = (data.made[i] / 10) * (height - 2 * padding)
      ctx.setFillStyle('#7A41FF')
      ctx.fillRect(madeX, height - padding - madeHeight, barWidth, madeHeight)
      
      // 出手数柱子
      const attemptedX = padding + (barWidth * 3) * i + barWidth * 2
      const attemptedHeight = (data.attempted[i] / 10) * (height - 2 * padding)
      ctx.setFillStyle('#5A21CF')
      ctx.fillRect(attemptedX, height - padding - attemptedHeight, barWidth, attemptedHeight)
    }
    
    ctx.draw()
  },

  // 页面显示时绘制图表
  onShow: function() {
    this.drawScoreTrend()
    this.drawShootingChart()
  }
})