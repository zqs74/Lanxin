// training.js - 优化版训练中心
Page({
  data: {
    todayDate: '',
    overallScore: 72,
    showAddModal: false,
    newRecord: {
      title: '',
      duration: '',
      intensity: '中等强度',
      highlightsText: ''
    },
    // 优化后的技能雷达图数据
    radarData: {
      dimensions: ['投篮', '身体素质', '突破/上篮', '组织', '控球/运球', '防守'],
      values: [75, 65, 80, 70, 85, 60],
      colors: [
        'rgba(68, 206, 255, 0.8)',
        'rgba(89, 168, 255, 0.8)',
        'rgba(115, 180, 255, 0.8)',
        'rgba(140, 192, 255, 0.8)',
        'rgba(165, 204, 255, 0.8)',
        'rgba(190, 216, 255, 0.8)'
      ]
    },
    // 本周训练计划
    weeklyPlans: [
      {
        id: 1,
        day: '周一',
        date: '03-24',
        title: '投篮专项训练',
        description: '中距离跳投 × 200次',
        status: 'completed',
        statusText: '已完成'
      },
      {
        id: 2,
        day: '周二',
        date: '03-25',
        title: '力量训练',
        description: '核心肌群强化',
        status: 'completed',
        statusText: '已完成'
      },
      {
        id: 3,
        day: '周三',
        date: '03-26',
        title: '技术综合训练',
        description: '运球 + 传球练习',
        status: 'today',
        statusText: '今日'
      },
      {
        id: 4,
        day: '周四',
        date: '03-27',
        title: '体能训练',
        description: '耐力跑 + 变速跑',
        status: 'upcoming',
        statusText: '待进行'
      }
    ],
    // 最近训练记录
    recentRecords: [
      {
        id: 1,
        day: '26',
        month: '03月',
        title: '投篮专项训练',
        duration: 60,
        intensity: '高强度',
        highlights: ['三分命中率提升', '手感火热']
      },
      {
        id: 2,
        day: '25',
        month: '03月',
        title: '团队对抗训练',
        duration: 90,
        intensity: '中等强度',
        highlights: ['5次助攻', '防守积极']
      },
      {
        id: 3,
        day: '24',
        month: '03月',
        title: '个人技术训练',
        duration: 45,
        intensity: '低强度',
        highlights: ['运球熟练']
      }
    ],
    // 快速训练
    quickTrain: [
      {
        id: 1,
        icon: '🏀',
        title: '投篮练习',
        duration: '30分钟',
        bgColor: 'linear-gradient(135deg, #44ceff 0%, #59a8ff 100%)'
      },
      {
        id: 2,
        icon: '💪',
        title: '力量训练',
        duration: '20分钟',
        bgColor: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
      },
      {
        id: 3,
        icon: '🏃',
        title: '体能训练',
        duration: '25分钟',
        bgColor: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)'
      },
      {
        id: 4,
        icon: '🎯',
        title: '技巧训练',
        duration: '35分钟',
        bgColor: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)'
      }
    ]
  },

  onLoad() {
    this.setTodayDate()
    this.calculateOverallScore()
    this.drawRadarChart()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(2)
    }
  },

  setTodayDate() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    this.setData({
      todayDate: `${month}-${day}`
    })
  },

  calculateOverallScore() {
    const values = this.data.radarData.values
    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = Math.round(sum / values.length)
    this.setData({ overallScore: avg })
  },

  // 简化版雷达图绘制
  drawRadarChart() {
    const ctx = wx.createCanvasContext('radarChart')
    const data = this.data.radarData
    const systemInfo = wx.getSystemInfoSync()
    const width = systemInfo.windowWidth - 60
    const height = 400
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 50

    ctx.clearRect(0, 0, width, height)

    // 绘制背景六边形
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
      const alpha = 0.15 - (i - 1) * 0.025
      ctx.setFillStyle(`rgba(68, 206, 255, ${alpha})`)
      ctx.setStrokeStyle(`rgba(68, 206, 255, ${alpha * 0.5})`)
      ctx.setLineWidth(1)
      ctx.fill()
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
      ctx.setStrokeStyle('rgba(68, 206, 255, 0.3)')
      ctx.setLineWidth(1)
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
    ctx.setFillStyle('rgba(68, 206, 255, 0.3)')
    ctx.fill()
    ctx.setStrokeStyle('#44ceff')
    ctx.setLineWidth(2)
    ctx.stroke()

    // 绘制数据点
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const r = radius * data.values[i] / 100
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.setFillStyle('#ffffff')
      ctx.fill()
      ctx.setStrokeStyle(data.colors[i])
      ctx.setLineWidth(2)
      ctx.stroke()
    }

    // 绘制标签
    ctx.setFontSize(12)
    ctx.setFillStyle('#333')
    ctx.setTextAlign('center')
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const r = radius + 25
      const x = centerX + r * Math.cos(angle)
      let y = centerY + r * Math.sin(angle) + 4
      ctx.fillText(data.dimensions[i], x, y)
    }

    ctx.draw()
  },

  selectPlan(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: `选择计划 ${id}`,
      icon: 'none'
    })
  },

  addRecord() {
    this.setData({ 
      showAddModal: true,
      newRecord: {
        title: '',
        duration: '',
        intensity: '中等强度',
        highlightsText: ''
      }
    })
  },

  closeAddModal() {
    this.setData({ showAddModal: false })
  },

  stopPropagation() {
  },

  onRecordTitleInput(e) {
    this.setData({
      'newRecord.title': e.detail.value
    })
  },

  onRecordDurationInput(e) {
    this.setData({
      'newRecord.duration': e.detail.value
    })
  },

  onRecordHighlightsInput(e) {
    this.setData({
      'newRecord.highlightsText': e.detail.value
    })
  },

  selectIntensity(e) {
    const intensity = e.currentTarget.dataset.intensity
    this.setData({
      'newRecord.intensity': intensity
    })
  },

  saveRecord() {
    const { title, duration, intensity, highlightsText } = this.data.newRecord
    
    if (!title || !duration) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0') + '月'
    
    const highlights = highlightsText ? highlightsText.split(',').map(h => h.trim()).filter(h => h) : []
    
    const newRecord = {
      id: Date.now(),
      day,
      month,
      title,
      duration: parseInt(duration),
      intensity,
      highlights
    }

    const recentRecords = [newRecord, ...this.data.recentRecords]
    
    this.setData({
      recentRecords,
      showAddModal: false
    })

    wx.showToast({
      title: '记录添加成功',
      icon: 'success'
    })
  },

  startQuickTrain(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.quickTrain.find(t => t.id === id)
    wx.showModal({
      title: '开始训练',
      content: `确定开始「${item.title}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '训练已开始',
            icon: 'success'
          })
        }
      }
    })
  }
})