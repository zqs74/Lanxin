// match-detail.js - 昇梦体育 比赛详情
const app = getApp()
Page({
  data: {
    navHeight: 0,
    themeClass: '',
    activeTab: 0,
    selectedCount: 0,
    clips: [
      { id: 1, time: '第一节 08:24', type: '两分跳投', result: '命中', selected: false },
      { id: 2, time: '第一节 06:12', type: '突破上篮', result: '命中', selected: false },
      { id: 3, time: '第二节 10:05', type: '三分远投', result: '命中', selected: false }
    ],
    score: { redTeam: 109, blueTeam: 105, time: '03.13 21:05' },
    scoreTrend: {
      quarters: ['第一节','第二节','第三节','第四节'],
      redTeam: [25,50,78,109],
      blueTeam: [23,48,76,105]
    },
    performance: [
      { name: '得分', redTeam: 109, blueTeam: 105 },
      { name: '篮板', redTeam: 57, blueTeam: 45 },
      { name: '助攻', redTeam: 19, blueTeam: 27 },
      { name: '投篮命中率', redTeam: '39.4%', blueTeam: '35.9%' },
      { name: '三分命中率', redTeam: '24.0%', blueTeam: '29.7%' },
      { name: '三分', redTeam: 12, blueTeam: 11 },
      { name: '罚球', redTeam: 19, blueTeam: 11 }
    ],
    shootingData: {
      quarters: ['第一节','第二节','第三节','第四节'],
      made: [3,4,2,5],
      attempted: [6,8,7,9]
    }
  },

  onLoad: function(options) {
    this.initTheme()
    this.setNavHeight()
  },

  initTheme() {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
  },

  setTheme(t) {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
  },

  onShow: function() {
    const ut = app.getUserTheme()
    this.setData({ themeClass: ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') })
    this.drawScoreTrend()
    this.drawShootingChart()
  },

  setNavHeight: function() {
    const s = wx.getSystemInfoSync()
    const sh = s.statusBarHeight || 44
    const nh = s.platform === 'ios' ? 44 : 48
    this.setData({ navHeight: (sh + nh) * 2 })
  },

  goBack: function() { wx.navigateBack() },

  switchTab: function(e) { this.setData({ activeTab: Number(e.currentTarget.dataset.index) }) },

  playVideo: function() { console.log('播放视频') },

  selectClip: function(e) {
    const index = e.currentTarget.dataset.index
    const clips = this.data.clips
    clips[index].selected = !clips[index].selected
    this.setData({ clips, selectedCount: clips.filter(c => c.selected).length })
  },

  startEdit: function() {
    if (this.data.selectedCount > 0) { console.log('开始剪辑') }
  },

  startCustomMatch: function() {
    wx.navigateTo({ url: `/pages/custom-match-setup/custom-match-setup?matchId=custom_${Date.now()}` })
  },

  drawScoreTrend: function() {
    const ctx=wx.createCanvasContext('scoreTrendCanvas'); const d=this.data.scoreTrend
    const W=343,H=200,P=40; ctx.clearRect(0,0,W,H)
    for(let i=0;i<=6;i++){const y=P+(H-2*P)/6*i;ctx.beginPath();ctx.moveTo(P,y);ctx.lineTo(W-P,y);ctx.stroke()}
    for(let i=0;i<d.quarters.length;i++){const x=P+(W-2*P)/(d.quarters.length-1)*i;ctx.beginPath();ctx.moveTo(x,P);ctx.lineTo(x,H-P);ctx.stroke()}
    ctx.setStrokeStyle('#D4AF37');ctx.setLineWidth(2);ctx.beginPath()
    for(let i=0;i<d.redTeam.length;i++){const x=P+(W-2*P)/(d.redTeam.length-1)*i;const y=H-P-(d.redTeam[i]/120)*(H-2*P);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()
    ctx.setStrokeStyle('#1890ff');ctx.setLineWidth(2);ctx.beginPath()
    for(let i=0;i<d.blueTeam.length;i++){const x=P+(W-2*P)/(d.blueTeam.length-1)*i;const y=H-P-(d.blueTeam[i]/120)*(H-2*P);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();ctx.draw()
  },

  drawShootingChart: function() {
    const ctx=wx.createCanvasContext('shootingChartCanvas');const d=this.data.shootingData
    const W=343,H=200,P=40;ctx.clearRect(0,0,W,H)
    for(let i=0;i<=5;i++){const y=P+(H-2*P)/5*i;ctx.beginPath();ctx.moveTo(P,y);ctx.lineTo(W-P,y);ctx.stroke()}
    const bW=(W-2*P)/(d.quarters.length*2+d.quarters.length-1)
    for(let i=0;i<d.quarters.length;i++){const madeX=P+(bW*3)*i;const mH=(d.made[i]/10)*(H-2*P);ctx.setFillStyle('#D4AF37');ctx.fillRect(madeX,H-P-mH,bW,mH)
      const aX=P+(bW*3)*i+bW*2;const aH=(d.attempted[i]/10)*(H-2*P);ctx.setFillStyle('#faad14');ctx.fillRect(aX,H-P-aH,bW,aH)};ctx.draw()
  }
})
