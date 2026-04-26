// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: "cloud1-d8gg26do45365a017"
    })
    
    // 初始化数据
    this.globalData = {
      userInfo: null,
      careerStats: {
        points: 128,
        rebounds: 86,
        assists: 42,
        shootingPercentage: 38.7,
        totalGames: 24
      }
    }
  },
  globalData: {
    userInfo: null,
    careerStats: {
      points: 128,
      rebounds: 86,
      assists: 42,
      shootingPercentage: 38.7,
      totalGames: 24
    }
  },
  // API配置
  api: {
    baseURL: 'http://192.168.43.233:8080',
    // 简单的GET请求方法
    get: function(url, params) {
      const baseURL = this.baseURL;
      wx.showLoading({
        title: '加载中...'
      });
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: baseURL + url,
          method: 'GET',
          data: params,
          success: (res) => {
            wx.hideLoading();
            console.log('API响应:', res);
            if (res.statusCode === 200) {
              if (res.data.code === 0) {
                resolve(res.data.data);
              } else {
                reject(res.data);
              }
            } else {
              reject({ message: '网络错误' + res.statusCode });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.log('API请求失败:', err);
            reject(err);
          }
        });
      });
    }
  }
})