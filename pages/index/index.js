// index.js - 现代化UI
Page({
  data: {
    currentDate: '',
    careerStats: {
      points: 0,
      rebounds: 0,
      assists: 0,
      shootingPercentage: 0.0,
      totalGames: 0
    },
    statsData: [
      { id: 1, icon: '🏆', value: '0', label: '得分' },
      { id: 2, icon: '📊', value: '0', label: '篮板' },
      { id: 3, icon: '🎯', value: '0', label: '助攻' },
      { id: 4, icon: '🎪', value: '0%', label: '命中率' },
      { id: 5, icon: '⚡', value: '0', label: '场次' }
    ],
    quickActions: [
      { id: 1, icon: '📝', label: '创建比赛', action: 'createMatch', bgColor: 'linear-gradient(135deg, #44ceff 0%, #59a8ff 100%)' },
      { id: 2, icon: '📺', label: '查看训练', action: 'goTraining', bgColor: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' },
      { id: 3, icon: '🤖', label: 'AI助手', action: 'goChat', bgColor: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' },
      { id: 4, icon: '👤', label: '个人中心', action: 'goProfile', bgColor: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }
    ],
    activeVideoTab: 'collection',
    contentAnimClass: '',
  },

  onLoad() {
    console.log('页面加载');
    this.setCurrentDate();
    this.loadCareerStats();
  },

  onShow() {
    console.log('页面显示');
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(0);
    }
  },

  setCurrentDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[now.getDay()];
    this.setData({
      currentDate: `${month}月${day}日 ${weekday}`
    });
  },

  loadCareerStats() {
    try {
      const stats = wx.getStorageSync('careerStats');
      if (stats) {
        this.setData({
          careerStats: stats,
          statsData: [
            { id: 1, icon: '🏆', value: stats.points.toString(), label: '得分' },
            { id: 2, icon: '📊', value: stats.rebounds.toString(), label: '篮板' },
            { id: 3, icon: '🎯', value: stats.assists.toString(), label: '助攻' },
            { id: 4, icon: '🎪', value: stats.shootingPercentage + '%', label: '命中率' },
            { id: 5, icon: '⚡', value: stats.totalGames.toString(), label: '场次' }
          ]
        });
      }
    } catch (e) {
      console.error('加载生涯数据失败', e);
    }
  },

  switchVideoTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeVideoTab) return;

    this.setData({ contentAnimClass: 'fade-out' });
    
    setTimeout(() => {
      this.setData({ activeVideoTab: tab, contentAnimClass: 'fade-in' });
    }, 150);
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  handleAction(e) {
    const action = e.currentTarget.dataset.action;
    
    switch(action) {
      case 'createMatch':
        wx.navigateTo({
          url: '/pages/create/create'
        });
        break;
      case 'goTraining':
        wx.switchTab({
          url: '/pages/training/training'
        });
        break;
      case 'goChat':
        wx.navigateTo({
          url: '/pages/chat/chat'
        });
        break;
      case 'goProfile':
        wx.switchTab({
          url: '/pages/profile/profile'
        });
        break;
    }
  }
})
