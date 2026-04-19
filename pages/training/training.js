// training.js - 奢华黑金风格训练中心
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
    // 奢华金色系技能雷达图数据
    radarData: {
      dimensions: ['投篮', '身体素质', '突破/上篮', '组织', '控球/运球', '防守'],
      values: [75, 65, 80, 70, 85, 60],
      colors: [
        'rgba(212, 175, 55, 0.9)',
        'rgba(255, 215, 0, 0.9)',
        'rgba(244, 196, 48, 0.9)',
        'rgba(218, 165, 32, 0.9)',
        'rgba(184, 134, 11, 0.85)',
        'rgba(255, 193, 37, 0.9)'
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
    // 快速训练 - 奢华金色系
    quickTrain: [
      {
        id: 1,
        icon: '🏀',
        title: '投篮练习',
        duration: '30分钟',
        bgColor: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)'
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

  // 奢华风格雷达图绘制 - 金色渐变 + 发光效果
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

    // 绘制背景六边形 - 金色渐变层次
    for (let i = 5; i >= 1; i--) {
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

      // 金色渐变透明度，越往外越淡
      const alpha = 0.12 - (i - 1) * 0.02
      const strokeAlpha = 0.15 - (i - 1) * 0.025

      ctx.setFillStyle(`rgba(212, 175, 55, ${alpha})`)
      ctx.setStrokeStyle(`rgba(212, 175, 55, ${strokeAlpha})`)
      ctx.setLineWidth(1)
      ctx.fill()
      ctx.stroke()
    }

    // 绘制轴线 - 金色半透明
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // 轴线渐变效果（从中心到边缘）
      const gradient = ctx.createLinearGradient(centerX, centerY, x, y)
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.4)')
      gradient.addColorStop(1, 'rgba(212, 175, 55, 0.08)')

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.setStrokeStyle(gradient)
      ctx.setLineWidth(1.5)
      ctx.stroke()
    }

    // 绘制数据区域 - 金色渐变填充
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

    // 数据区域填充 - 金色渐变
    const fillGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.8)
    fillGradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)')
    fillGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.3)')
    fillGradient.addColorStop(1, 'rgba(184, 134, 11, 0.2)')
    ctx.setFillStyle(fillGradient)
    ctx.fill()

    // 数据区域边框 - 金色发光
    ctx.setStrokeStyle('#FFD700')
    ctx.setLineWidth(3)
    ctx.stroke()

    // 绘制外发光效果
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
    ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
    ctx.setLineWidth(6)
    ctx.stroke()

    // 绘制数据点 - 金色圆点 + 发光效果
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const r = radius * data.values[i] / 100
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      // 外发光圈
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(255, 215, 0, ${0.15 + (data.values[i] / 100) * 0.15})`
      ctx.fill()

      // 中间光晕
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(212, 175, 55, ${0.3 + (data.values[i] / 100) * 0.2})`
      ctx.fill()

      // 内部实心点
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      const pointGradient = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, 5)
      pointGradient.addColorStop(0, '#FFFFFF')
      pointGradient.addColorStop(0.4, '#FFE066')
      pointGradient.addColorStop(1, '#D4AF37')
      ctx.fillStyle = pointGradient
      ctx.fill()

      // 边框
      ctx.strokeStyle = '#B8860B'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // 绘制标签 - 深色文字配金色强调
    ctx.setFontSize(12)
    ctx.setTextAlign('center')
    for (let i = 0; i < data.dimensions.length; i++) {
      const angle = (i * 2 * Math.PI) / data.dimensions.length - Math.PI / 2
      const r = radius + 30
      const x = centerX + r * Math.cos(angle)
      let y = centerY + r * Math.sin(angle) + 4

      // 标签背景（可选）
      ctx.fillStyle = '#E0E0E0'
      ctx.fillText(data.dimensions[i], x, y)
    }

    // 中心装饰 - 金色小圆点
    ctx.beginPath()
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI)
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 4)
    centerGradient.addColorStop(0, '#FFD700')
    centerGradient.addColorStop(1, '#D4AF37')
    ctx.fillStyle = centerGradient
    ctx.fill()

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
