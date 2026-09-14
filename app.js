const session = require('./utils/session');
App({ globalData: { city: '东莞' }, onLaunch() { session.init(); } });
