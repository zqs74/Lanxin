// index.js
const app = getApp()

Page({
  data: {
    careerStats: {
      points: 0,
      rebounds: 0,
      assists: 0,
      shootingPercentage: 0.0,
      totalGames: 0
    },
    activeVideoTab: 'collection',
    contentAnimClass: '',
  },

  onLoad() {
    console.log('页面加载');
    this.setData({
      careerStats: {
        points: 0,
        rebounds: 0,
        assists: 0,
        shootingPercentage: 0.0,
        totalGames: 0
      }
    });
    
    // 延迟执行API请求，避免生命周期冲突
    setTimeout(() => {
      this.testApiRequest();
    }, 100);
  },

  testApiRequest() {
    console.log('开始测试API请求...');
    
    // 测试网络连接
    console.log('测试网络连接...');
    
    // 尝试使用简单的URL
    const testUrl = 'http://192.168.43.233:8080';
    console.log('测试URL:', testUrl);
    
    wx.request({
      url: testUrl,
      method: 'GET',
      success: (res) => {
        console.log('基础连接测试成功:', res);
        // 基础连接成功后，再尝试API请求
        this.testApiEndpoint();
      },
      fail: (err) => {
        console.log('基础连接测试失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
      }
    });
  },

  testApiEndpoint() {
    console.log('测试API端点...');
    
    wx.showLoading({
      title: '加载中...'
    });
    
    // 使用API端点
    const apiUrl = 'http://192.168.43.233:8080/api/home/overview?userId=2';
    console.log('API URL:', apiUrl);
    
    // 检查URL格式
    console.log('URL长度:', apiUrl.length);
    console.log('URL是否包含空格:', apiUrl.includes(' '));
    console.log('URL是否以http开头:', apiUrl.startsWith('http'));
    
    wx.request({
      url: apiUrl,
      method: 'GET',
      success: (res) => {
        console.log('API请求成功:', res);
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            const data = res.data.data;
            console.log('API数据:', data);
            
            if (data.historyData && data.historyData.length > 0) {
              let totalPoints = 0, totalRebounds = 0, totalAssists = 0;
              data.historyData.forEach((game) => {
                totalPoints += game.points || 0;
                totalRebounds += game.rebounds || 0;
                totalAssists += game.assists || 0;
              });
              const careerStats = {
                points: totalPoints,
                rebounds: totalRebounds,
                assists: totalAssists,
                shootingPercentage: 0,
                totalGames: data.historyData.length
              };
              app.globalData.careerStats = careerStats;
              this.animateCareerStats();
            }
            
            wx.showToast({
              title: 'API请求成功！',
              icon: 'success'
            });
          } else {
            console.log('API返回错误:', res.data);
            wx.showToast({
              title: 'API返回错误: ' + res.data.message,
              icon: 'none'
            });
          }
        } else {
          console.log('HTTP错误:', res.statusCode);
          wx.showToast({
            title: 'HTTP错误: ' + res.statusCode,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('API请求失败:', err);
        console.log('错误详情:', JSON.stringify(err));
        wx.hideLoading();
        wx.showToast({
          title: '请求失败: ' + (err.errMsg || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  onShow() {
    console.log('页面显示');
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(0);
    }
  },

  animateCareerStats() {
    const targetStats = app.globalData.careerStats;
    const duration = 800;
    const steps = 20;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const currentStats = {
      points: 0,
      rebounds: 0,
      assists: 0,
      shootingPercentage: 0.0,
      totalGames: 0
    };
    
    const animationInterval = setInterval(() => {
      currentStep++;
      
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      currentStats.points = Math.floor(targetStats.points * easeProgress);
      currentStats.rebounds = Math.floor(targetStats.rebounds * easeProgress);
      currentStats.assists = Math.floor(targetStats.assists * easeProgress);
      currentStats.shootingPercentage = parseFloat((targetStats.shootingPercentage * easeProgress).toFixed(1));
      currentStats.totalGames = Math.floor(targetStats.totalGames * easeProgress);
      
      this.setData({ careerStats: currentStats });
      
      if (currentStep >= steps) {
        clearInterval(animationInterval);
        this.setData({ careerStats: targetStats });
      }
    }, stepDuration);
  },

  switchVideoTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeVideoTab) return;

    this.setData({ contentAnimClass: 'fade-out' });
    this.setData({ activeVideoTab: tab });

    setTimeout(() => {
      this.setData({ contentAnimClass: 'fade-in' });
    }, 300);
  },

  // 手动触发API请求的方法
  manualApiTest() {
    console.log('手动触发API测试');
    this.testApiRequest();
  }

})