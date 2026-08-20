import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const MOCK_DATA = {
  hr: {
    referees: [
      { id: 7, name: '费斯语', age: 31, years: 13, certificate: '国际级裁判', tags: ['国家级', '劳资协议', '东莞'], avatar: '/images/resources/hr/referees/ref-7.png', experience: '广东篮协注册裁判，多次执裁国家级篮球赛事' },
      { id: 8, name: '潘荣远', age: 48, years: 23, certificate: '国际级裁判', tags: ['广东篮协', '国家级', '广东'], avatar: '/images/resources/hr/referees/ref-8.png', experience: '东莞理工学院副教授，东莞篮协裁委会委员，国家荣誉级裁判员' },
      { id: 9, name: '刘存', age: 37, years: 13, certificate: '国际级裁判', tags: ['广东篮协', '国家级', '广东'], avatar: '/images/resources/hr/referees/ref-9.png', experience: '东莞理工学院讲师，国家级篮球裁判员，国家篮球一级运动员，东莞篮协裁委会委员，曾执裁全国、省级、地级市等比赛' },
      { id: 10, name: '张明', age: 60, years: 40, certificate: '国际级裁判', tags: ['广东篮协', '劳资协议', '东莞'], avatar: '/images/resources/hr/referees/ref-10.png', experience: '东莞理工学院体育高级讲师，东莞市篮协裁判委员会主任，多次执裁国家级篮球赛事' },
      { id: 11, name: '林广宇', age: 42, years: 15, certificate: '国际级裁判', tags: ['广东篮协', '国家级', '广东'], avatar: '/images/resources/hr/referees/ref-11.png', experience: '广东省篮球协会秘书长、法定代表人，多次执裁国家级篮球赛事' },
      { id: 12, name: '陈新键', age: 57, years: 36, certificate: '国际级裁判', tags: ['广东篮协', '国家级', '广东'], avatar: '/images/resources/hr/referees/ref-12.png', experience: '广州体育学院教授、硕士生导师，是篮球国家级裁判员及CBA职业联赛裁判员' },
      { id: 13, name: '雷荔宁', age: 48, years: 22, certificate: '国际级裁判', tags: ['广东篮协', '佛山', '国家级'], avatar: '/images/resources/hr/referees/ref-13.png', experience: '南海区篮球协会会长，执裁经验丰富' },
      { id: 14, name: '杨炯恩', age: 41, years: 21, certificate: '国际级裁判', tags: ['广东篮协', '佛山', '国家级'], avatar: '/images/resources/hr/referees/ref-14.png', experience: '佛山市篮球裁判培训班的讲解师，执裁经验丰富' },
      { id: 15, name: '霍丽棉', age: 42, years: 22, certificate: '国际级裁判', tags: ['广东篮协', '佛山', '国家级'], avatar: '/images/resources/hr/referees/ref-15.png', experience: '佛山篮球协会裁判讲师，执裁经验丰富' },
      { id: 16, name: '张嘉豪', age: 38, years: 18, certificate: '国际级裁判', tags: ['广东篮协', '佛山', '国家级'], avatar: '/images/resources/hr/referees/ref-16.png', experience: '佛山篮球协会裁判讲师，执裁经验丰富' },
      { id: 17, name: '赵晟彬', age: 28, years: 8, certificate: '国际级裁判', tags: ['广东篮协', '佛山', '国家级'], avatar: '/images/resources/hr/referees/ref-17.png', experience: '佛山篮球协会裁判讲师，执裁经验丰富' },
    ],
    coaches: [
      { id: 7, name: '张兆旭', age: 38, years: 3, tags: ['北京', '三冠王'], avatar: '/images/resources/hr/coaches/coach-7.png', achievements: '曾是CBA优秀内线球员，三夺盖帽王', teachingTime: '2023至今' },
      { id: 8, name: '韩硕', age: 39, years: 1, tags: ['北京', 'CBA核心球员'], avatar: '/images/resources/hr/coaches/coach-8.png', achievements: '曾三次入选CBA全明星阵容，带领四川男篮征战CBA', teachingTime: '2024年至今' },
      { id: 9, name: '丹尼', age: 30, years: 9, tags: ['广东', '国家二级运动员'], avatar: '/images/resources/hr/coaches/coach-9.png', achievements: '自2016年起从事培训教学工作，10年运动训练经验', teachingTime: '2016年至今' },
      { id: 10, name: '鲍勃·邓德华', age: 55, years: 16, tags: ['上海'], avatar: '/images/resources/hr/coaches/coach-10.png', achievements: '上海男篮第一任外教，执教新疆男篮', teachingTime: '2009年至今' },
      { id: 11, name: '宫鲁鸣', age: 68, years: 34, tags: ['国家队', '最佳抢断手', '最远投手'], avatar: '/images/resources/hr/coaches/coach-11.png', achievements: '带国家队打进奥运前八，入选中国篮球名人堂', teachingTime: '1991年至今' },
      { id: 12, name: '李楠', age: 51, years: 7, tags: ['北京', '8冠', '奥运第八'], avatar: '/images/resources/hr/coaches/coach-12.png', achievements: '执教北京首钢男篮', teachingTime: '2018年至今' },
      { id: 13, name: '乔尔杰维奇', age: 58, years: 3, tags: ['塞尔维亚', '欧洲联赛冠军', '后卫'], avatar: '/images/resources/hr/coaches/coach-13.png', achievements: '夺得过欧洲联赛冠军，曾任中国国家男子篮球队主教练', teachingTime: '2022年至今' },
      { id: 14, name: '朱雨芳', age: 42, years: 8, tags: ['广东宏远', '总决赛MVP', '常规赛MVP'], avatar: '/images/resources/hr/coaches/coach-14.png', achievements: 'CBA史上首位总得分超过一万分的球员，曾任广东宏远篮球俱乐部总经理', teachingTime: '2017年至今' },
      { id: 15, name: '孙悦', age: 40, years: 4, tags: ['北京', '首位亚洲后卫', 'NBA总冠军'], avatar: '/images/resources/hr/coaches/coach-15.png', achievements: '获得NBA总冠军，现任篮球青训教练', teachingTime: '2021年至今' },
      { id: 16, name: '王怀玉', age: 56, years: 27, tags: ['广东宏远', '青训教父'], avatar: '/images/resources/hr/coaches/coach-16.png', achievements: '曾是广东宏远篮球俱乐部的功勋教练，曾长期担任广东宏远一线队助理教练', teachingTime: '1998至今' },
      { id: 17, name: '曲绍斌', age: 39, years: 10, tags: ['后卫', 'CBA联赛总冠军'], avatar: '/images/resources/hr/coaches/coach-17.png', achievements: '二连冠，现任广东宏远青年队主教练、广东青年队主教练', teachingTime: '2025至今' },
      { id: 18, name: '博斯科・拉多维奇', age: 46, years: 6, tags: ['黑山', '前锋'], avatar: '/images/resources/hr/coaches/coach-18.png', achievements: '曾任黑山国家男子篮球队主教练，加盟CBA广东宏远俱乐部担任助理教练', teachingTime: '2019至今' },
      { id: 19, name: '任骏飞', age: 35, years: 1, tags: ['前锋', 'CBA总冠军', '国家队'], avatar: '/images/resources/hr/coaches/coach-19.png', achievements: '6次CBA总冠军，宏远青年队主教练兼任一线队助理教练', teachingTime: '2024至今' },
    ]
  },
  venues: [
    { id: 10, name: '大朗体育馆', region: '东莞', type: '室内', image: '/images/resources/venues/10.png', gallery: ['/images/resources/venues/10.png', '/images/resources/venues/10.png', '/images/resources/venues/10.png'], address: '广东省东莞市大朗镇美景中路', specs: '标准篮球场1片', facilities: '观众席/更衣室/淋浴/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-dayun.jpg' },
    { id: 17, name: '塘厦体育馆', region: '东莞', type: '室内', image: '/images/resources/venues/17.png', gallery: ['/images/resources/venues/17.png', '/images/resources/venues/17.png', '/images/resources/venues/17.png'], address: '广东省东莞市塘厦镇塘龙西路79号', specs: '标准篮球场1片', facilities: '更衣室/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-szbay.jpg' },
    { id: 18, name: '黄江体育馆', region: '东莞', type: '室内', image: '/images/resources/venues/18.png', gallery: ['/images/resources/venues/18.png', '/images/resources/venues/18.png', '/images/resources/venues/18.png'], address: '广东省东莞市黄江镇黄江大道173号', specs: '标准篮球场1片', facilities: '更衣室/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-dgcenter.jpg' },
    { id: 20, name: '建博体育馆', region: '东莞', type: '室内', image: '/images/resources/venues/20.png', gallery: ['/images/resources/venues/20.png', '/images/resources/venues/20.png', '/images/resources/venues/20.png'], address: '广东省东莞市南城街道宏远路建博体育馆', specs: '标准篮球场1片', facilities: '更衣室/淋浴', openTime: '10:00-22:00', map: '/images/resources/maps/map-shijilian.jpg' },
    { id: 16, name: '荔枝湾体育馆', region: '广州', type: '室内', image: '/images/resources/venues/16.png', gallery: ['/images/resources/venues/16.png', '/images/resources/venues/16.png', '/images/resources/venues/16.png'], address: '广州市荔湾区荔湾路54号', specs: '标准篮球场1片', facilities: '更衣室/淋浴/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-dayun.jpg' },
    { id: 15, name: '中山体育馆', region: '中山', type: '室内', image: '/images/resources/venues/15.png', gallery: ['/images/resources/venues/15.png', '/images/resources/venues/15.png', '/images/resources/venues/15.png'], address: '广东省中山市兴中道32号', specs: '标准篮球场2片', facilities: '观众席/更衣室/淋浴/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-tianhe.jpg' },
    { id: 1, name: '东莞理工学院体育馆（松山湖校区）', region: '东莞', type: '室内', image: '/images/resources/venues/dgut-1.jpg', gallery: ['/images/resources/venues/dgut-1.jpg', '/images/resources/venues/dgut-2.jpg', '/images/resources/venues/dgut-3.jpg'], address: '广东省东莞市松山湖大学路1号', specs: '标准篮球场1片', facilities: '综合馆一座，更衣室/淋浴/停车', openTime: '16:00-22:00', map: '/images/resources/maps/map-dgut.jpg' },
    { id: 11, name: '东莞市体育中心', region: '东莞', type: '室内', image: '/images/resources/venues/11.png', gallery: ['/images/resources/venues/11.png', '/images/resources/venues/11.png', '/images/resources/venues/11.png'], address: '广东省东莞市南城区体育路3号', specs: '标准篮球场1片', facilities: '观众席/更衣室/淋浴/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-szbay.jpg' },
    { id: 12, name: '西湾体育馆', region: '深圳', type: '室内', image: '/images/resources/venues/12.png', gallery: ['/images/resources/venues/12.png', '/images/resources/venues/12.png', '/images/resources/venues/12.png'], address: '广东省深圳市宝安区金湾大道西湾体育公园', specs: '标准篮球场1片', facilities: '更衣室/淋浴/停车', openTime: '09:00-22:00', map: '/images/resources/maps/map-shijilian.jpg' },
    { id: 19, name: '广东省人民体育馆', region: '广州', type: '室内', image: '/images/resources/venues/19.png', gallery: ['/images/resources/venues/19.png', '/images/resources/venues/19.png', '/images/resources/venues/19.png'], address: '广州市越秀区较场西路18号', specs: '标准篮球场1片', facilities: '观众席/更衣室/淋浴/停车', openTime: '09:00-21:30', map: '/images/resources/maps/map-dgut.jpg' },
    { id: 7, name: '青田体育中心', region: '丽水', type: '室内', image: '/images/resources/venues/7.png', gallery: ['/images/resources/venues/7.png', '/images/resources/venues/7.png', '/images/resources/venues/7.png'], address: '浙江省丽水市青田县油竹街道体育馆路', specs: '标准篮球场2片', facilities: '综合馆，更衣室/淋浴/停车', openTime: '08:00-22:00', map: '/images/resources/maps/map-dgut.jpg' },
    { id: 9, name: '池州市体育馆', region: '池州', type: '室内', image: '/images/resources/venues/9.png', gallery: ['/images/resources/venues/9.png', '/images/resources/venues/9.png', '/images/resources/venues/9.png'], address: '安徽省池州市贵池区长江南路188号', specs: '标准篮球场1片', facilities: '综合馆，更衣室/停车', openTime: '08:00-21:00', map: '/images/resources/maps/map-tianhe.jpg' },
    { id: 13, name: '武威市体育馆', region: '武威', type: '室内', image: '/images/resources/venues/13.png', gallery: ['/images/resources/venues/13.png', '/images/resources/venues/13.png', '/images/resources/venues/13.png'], address: '甘肃省武威市凉州区宣武街30号', specs: '标准篮球场1片', facilities: '综合馆，更衣室/停车', openTime: '08:00-20:00', map: '/images/resources/maps/map-dgut.jpg' },
    { id: 2, name: '东莞篮球中心（CBA第一馆）', region: '东莞', type: '室内', image: '/images/resources/venues/dgcenter-1.jpg', gallery: ['/images/resources/venues/dgcenter-1.jpg', '/images/resources/venues/dgcenter-2.jpg', '/images/resources/venues/dgcenter-3.jpg'], address: '东莞市寮步镇东部快速路与松山湖大道交汇处', specs: 'NBA标准场地1片', facilities: '16000人，LED大屏/音响/VIP', openTime: '09:00-22:00', map: '/images/resources/maps/map-dgcenter.jpg' },
    { id: 4, name: '深圳大运中心体育馆', region: '深圳', type: '室内', image: '/images/resources/venues/dayun-1.jpg', gallery: ['/images/resources/venues/dayun-1.jpg', '/images/resources/venues/dayun-2.jpg', '/images/resources/venues/dayun-3.jpg'], address: '深圳市龙岗区龙翔大道3001号', specs: 'NBA标准场地1片', facilities: '17964人，VIP/媒体区/转播', openTime: '10:00-22:00', map: '/images/resources/maps/map-dayun.jpg' },
    { id: 5, name: '深圳湾体育中心（春茧）', region: '深圳', type: '室内', image: '/images/resources/venues/szbay-1.jpg', gallery: ['/images/resources/venues/szbay-1.jpg', '/images/resources/venues/szbay-2.jpg', '/images/resources/venues/szbay-3.jpg'], address: '深圳市南山区滨海大道3001号', specs: '标准篮球场1片', facilities: '13000人，观众席/LED/音响', openTime: '10:00-22:00', map: '/images/resources/maps/map-szbay.jpg' },
    { id: 3, name: '广州天河体育馆', region: '广州', type: '室内', image: '/images/resources/venues/tianhe-1.jpg', gallery: ['/images/resources/venues/tianhe-1.jpg', '/images/resources/venues/tianhe-2.jpg', '/images/resources/venues/tianhe-3.jpg'], address: '广州市天河区天河路299号', specs: '标准篮球场1片', facilities: '8628人，观众席/媒体区', openTime: '09:00-21:00', map: '/images/resources/maps/map-tianhe.jpg' },
    { id: 21, name: '广州天河体育中心', region: '广州', type: '室内', image: '/images/resources/venues/21.png', gallery: ['/images/resources/venues/21.png', '/images/resources/venues/21.png', '/images/resources/venues/21.png'], address: '广州市天河区天河路299号', specs: '标准篮球场1片', facilities: '8628人，观众席/媒体区/更衣室/停车', openTime: '09:00-21:00', map: '/images/resources/maps/map-tianhe.jpg' },
    { id: 6, name: '佛山世纪莲体育中心', region: '佛山', type: '室内', image: '/images/resources/venues/shijilian-1.jpg', gallery: ['/images/resources/venues/shijilian-1.jpg', '/images/resources/venues/shijilian-2.jpg', '/images/resources/venues/shijilian-3.jpg'], address: '佛山市顺德区岭南大道南1号', specs: '标准篮球场2片', facilities: '36686人，观众席/照明/停车', openTime: '06:00-22:00', map: '/images/resources/maps/map-shijilian.jpg' },
    { id: 14, name: '佛山世纪莲体育中心体育馆', region: '佛山', type: '室内', image: '/images/resources/venues/14.png', gallery: ['/images/resources/venues/14.png', '/images/resources/venues/14.png', '/images/resources/venues/14.png'], address: '佛山市顺德区岭南大道南1号', specs: '标准篮球场2片', facilities: '36686人，观众席/照明/停车/更衣室', openTime: '06:00-22:00', map: '/images/resources/maps/map-shijilian.jpg' },
    { id: 8, name: '南昌国际体育中心', region: '南昌', type: '室内', image: '/images/resources/venues/8.png', gallery: ['/images/resources/venues/8.png', '/images/resources/venues/8.png', '/images/resources/venues/8.png'], address: '江西省南昌市红谷滩区国体大道333号', specs: '标准篮球场2片', facilities: '大型综合馆，观众席/LED屏/更衣室/停车', openTime: '09:00-21:00', map: '/images/resources/maps/map-dgcenter.jpg' },
  ],
  materials: {
    rental: [
      { id: 1, name: '电子计分牌', image: '/images/resources/materials/rental/scoreboard.jpg', ratio: 1.05, spec: 'Molten LED标准比赛用', status: '可租', details: 'Molten专业电子计分牌，支持24秒计时与全队犯规显示' },
      { id: 2, name: '全队犯规显示器', image: '/images/resources/materials/rental/foul-display.jpg', ratio: 0.97, spec: 'FIBA LED显示', status: '可租', details: 'FIBA认证LED全队犯规显示器，实时显示犯规次数' },
      { id: 3, name: '24秒计时器', image: '/images/resources/materials/rental/shot-clock.jpg', ratio: 0.96, spec: 'Spalding 8373 FIBA认证', status: '可租', details: 'Spalding 8373型24秒计时器，国际篮联认证设备' },
      { id: 4, name: '秒表', image: '/images/resources/materials/rental/stopwatch.jpg', ratio: 1.06, spec: 'Casio HS-80精度0.01秒', status: '可租', details: 'Casio HS-80高精度秒表，精确到0.01秒' },
      { id: 5, name: '口哨', image: '/images/resources/materials/rental/whistle.jpg', ratio: 1.05, spec: 'Fox 40 Classic裁判专用', status: '可租', details: 'Fox 40 Classic经典款裁判哨，无滚球设计' },
      { id: 6, name: '裁判服', image: '/images/resources/materials/rental/referee-jersey.jpg', ratio: 1, spec: '黑白条纹NBA Style', status: '可租', details: '黑白条纹裁判服，NBA风格标准尺码' },
      { id: 7, name: '裁判椅', image: '/images/resources/materials/rental/referee-chair.jpg', ratio: 0.64, spec: '可升降记录台用椅', status: '可租', details: '专业裁判记录台用椅，可升降调节' },
      { id: 8, name: '犯规牌', image: '/images/resources/materials/rental/foul-card.jpg', ratio: 1, spec: '红白双色FIBA', status: '可租', details: 'FIBA标准红白双色犯规指示牌' },
      { id: 9, name: '暂停牌', image: '/images/resources/materials/rental/timeout-card.jpg', ratio: 0.99, spec: '红绿双面FIBA', status: '可租', details: 'FIBA标准红绿双面暂停指示牌' },
      { id: 10, name: '换人牌', image: '/images/resources/materials/rental/substitute-card.jpg', ratio: 2, spec: '1-15号FIBA', status: '可租', details: 'FIBA标准1-15号球员换人牌' },
      { id: 11, name: '战术板', image: '/images/resources/materials/rental/tactics-board.jpg', ratio: 0.99, spec: '磁性KBA', status: '可租', details: 'KBA磁性战术板，教练战术布置专用' },
      { id: 12, name: '视教板', image: '/images/resources/materials/rental/video-board.jpg', ratio: 0.98, spec: 'iPad Pro 12.9大尺寸', status: '可租', details: 'iPad Pro 12.9寸视教板，用于视频分析教学' },
      { id: 13, name: '7号球', image: '/images/resources/materials/rental/rental1.png', ratio: 0.97, spec: '7号篮球', status: '可租', details: '标准7号比赛篮球，适用于成人比赛与训练' },
      { id: 14, name: '6号球', image: '/images/resources/materials/rental/rental2.png', ratio: 1.05, spec: '6号篮球', status: '可租', details: '标准6号篮球，适用于青少年比赛和训练' },
      { id: 15, name: '5号球', image: '/images/resources/materials/rental/rental3.png', ratio: 0.97, spec: '5号篮球', status: '可租', details: '标准5号篮球，适用于儿童训练与青少年赛事' },
      { id: 16, name: '篮板', image: '/images/resources/materials/rental/rental4.png', ratio: 1.41, spec: '可移动篮板', status: '可租', details: '可调高度篮球篮板，适合训练与对抗使用' },
      { id: 17, name: '篮筐', image: '/images/resources/materials/rental/rental5.png', ratio: 0.81, spec: '标准篮筐', status: '可租', details: 'FIBA标准篮球篮筐，含网和扣篮支撑' },
      { id: 18, name: '充气泵', image: '/images/resources/materials/rental/rental6.png', ratio: 1.47, spec: '手动/电动充气泵', status: '可租', details: '便携式篮球充气泵，适配所有球类' },
      { id: 19, name: '比赛记录表', image: '/images/resources/materials/rental/rental7.png', ratio: 0.65, spec: '比赛记录表单', status: '可租', details: '标准比赛记录表，用于统计得分、犯规和换人' },
      { id: 20, name: '笔', image: '/images/resources/materials/rental/rental8.png', ratio: 0.96, spec: '比赛专用笔', status: '可租', details: '比赛记录和裁判记录专用笔' },
      { id: 21, name: '交替拥有指示牌', image: '/images/resources/materials/rental/rental9.png', ratio: 2.12, spec: '交替拥有牌', status: '可租', details: '用于记录篮球比赛交替拥有权的标识牌' },
      { id: 22, name: '篮球车', image: '/images/resources/materials/rental/rental10.png', ratio: 1.45, spec: '篮球搬运车', status: '可租', details: '便携篮球运输车，方便场地摆放与收纳' },
      { id: 23, name: '场地吸水拖把', image: '/images/resources/materials/rental/rental11.png', ratio: 1.3, spec: '场地吸水拖把', status: '可租', details: '专业场地吸水拖把，快速清理地面水渍' },
      { id: 24, name: '防滑镁粉袋', image: '/images/resources/materials/rental/rental12.png', ratio: 1.34, spec: '镁粉袋', status: '可租', details: '运动员防滑镁粉袋，提升抓地力与摩擦力' },
      { id: 25, name: '急救医疗包', image: '/images/resources/materials/rental/rental13.png', ratio: 0.98, spec: '急救包', status: '可租', details: '标准急救医疗包，包含绷带、消毒液、冰袋等' },
      { id: 26, name: '便携音响', image: '/images/resources/materials/rental/rental14.png', ratio: 1.83, spec: '蓝牙便携音响', status: '可租', details: '便携式音响，支持赛事背景音乐与广播' },
      { id: 27, name: '无线麦克风', image: '/images/resources/materials/rental/rental15.png', ratio: 1.44, spec: '无线麦克风', status: '可租', details: '无线麦克风系统，适用于赛事解说与公告' },
      { id: 28, name: '饮用水', image: '/images/resources/materials/rental/rental16.png', ratio: 0.98, spec: '瓶装饮用水', status: '可租', details: '赛事专用补水饮用水，标准瓶装包装' },
      { id: 29, name: '冰块', image: '/images/resources/materials/rental/rental17.png', ratio: 1.33, spec: '冰块', status: '可租', details: '运动员冷敷及补水降温用冰块' },
    ],
    custom: [
      { id: 1, name: '球衣', image: '/images/resources/materials/custom/jersey.jpg', ratio: 1.02, range: 'Nike Dry-FIT定制LOGO、号码、名称', details: 'Nike Dry-FIT面料，支持团队定制，10件起订' },
      { id: 2, name: '广告围栏', image: '/images/resources/materials/custom/ad-fence.jpg', ratio: 1, range: '尺寸、图案定制', details: '赛事场地广告围栏，支持高清图案印刷' },
      { id: 3, name: '奖杯', image: '/images/resources/materials/custom/trophy.jpg', ratio: 0.48, range: '造型、刻字定制', details: '各类赛事奖杯定制，支持专属刻字' },
      { id: 4, name: '奖牌', image: '/images/resources/materials/custom/medal.jpg', ratio: 0.94, range: '材质、图案定制', details: '金、银、铜牌定制，支持图案设计' },
      { id: 5, name: '横幅', image: '/images/resources/materials/custom/banner.jpg', ratio: 1, range: '尺寸、内容定制', details: '赛事横幅、加油横幅定制印刷' },
    ]
  },
  suppliers: [
    { id: 1, name: '华体集团（华体体育发展股份有限公司）', tags: ['赛事运营', '场馆运营'], image: '/images/resources/suppliers/supplier-1.jpg', ratio: 0.82, intro: '助力十五运会，运营江门体育中心、佛山顺德德胜体育中心，国内领先体育产业集团', region: '全国', contact: 'contact@huati.com', cases: '十五运会、江门体育中心' },
    { id: 2, name: '中体产业（600158.SH）', tags: ['赛事运营', '体育IP'], image: '/images/resources/suppliers/supplier-2.jpg', ratio: 2.58, intro: 'A股上市体育企业，运营北马/武马/广马、环中国自行车赛等知名赛事IP', region: '全国', contact: 'contact@csssports.com', cases: '全运会市场开发、北京马拉松' },
    { id: 3, name: '广东省文化体育发展有限公司', tags: ['省级国企', '文体产业'], image: '/images/resources/suppliers/supplier-3.jpg', ratio: 1.31, intro: '广东省唯一省属文体国企，位于广州工美港，统筹省级文体项目', region: '广东', contact: 'contact@gdculture.com', cases: '省级文体项目运营' },
    { id: 4, name: '双鱼体育（广州轻工集团旗下）', tags: ['体育器材', '赛事服务'], image: '/images/resources/suppliers/supplier-4.jpg', ratio: 4.96, intro: '连续五次服务全运会，乒乓/羽毛球民族品牌，拓展篮球器材领域', region: '广东', contact: 'service@doublefish.com', cases: '五届全运会器材供应商' },
    { id: 5, name: '广州领赛体育发展有限公司', tags: ['赛事策划', '执行'], image: '/images/resources/suppliers/supplier-5.jpg', ratio: 0.74, intro: '2022年成立，注册资本4000万，专业体育竞赛组织与赛事执行', region: '广东', contact: 'contact@lingsai.com', cases: '粤港澳赛事策划执行' },
    { id: 6, name: '梅州华体文化体育有限公司', tags: ['区域运营', '足球/篮球'], image: '/images/resources/suppliers/supplier-6.jpg', ratio: 1, intro: '大湾区体育产业新锐，2026广东省城市足球超级联赛梅州赛区运营方', region: '大湾区', contact: 'contact@mzhuati.com', cases: '省足球超级联赛梅州赛区' },
    { id: 7, name: '华特迪士尼有限公司', tags: ['体育传媒', '赛事合作'], image: '/images/resources/suppliers/supplier-7.png', ratio: 2.16, intro: '体育文化与娱乐结合的赛事合作伙伴', region: '全国', contact: 'contact@disney-sports.com', cases: '大型体育娱乐活动' },
    { id: 8, name: '李宁体育用品有限公司', tags: ['体育用品', '专业装备'], image: '/images/resources/suppliers/supplier-8.png', ratio: 1.54, intro: '国内知名体育品牌，提供运动装备与专业比赛器材', region: '全国', contact: 'service@li-ning.com', cases: '全国性篮球赛事器材供应' },
    { id: 9, name: '露露乐蒙贸易有限公司', tags: ['饮品赞助', '体育饮水'], image: '/images/resources/suppliers/supplier-9.png', ratio: 1.83, intro: '提供专业体育饮品与赛事补给服务', region: '全国', contact: 'contact@lululemon-trade.com', cases: '赛事饮水赞助' },
    { id: 10, name: '舒华体育股份有限公司', tags: ['体育器材', '训练设备'], image: '/images/resources/suppliers/supplier-10.png', ratio: 1.97, intro: '国内领先体育器材制造商，提供训练与比赛设备', region: '全国', contact: 'support@shuhua.com', cases: '专业训练器材供应' },
    { id: 11, name: '人民网股份有限公司', tags: ['媒体', '体育传播'], image: '/images/resources/suppliers/supplier-11.png', ratio: 1.73, intro: '国家级新媒体平台，覆盖赛事报道与体育传播', region: '全国', contact: 'sports@people.cn', cases: '大型赛事报道' },
    { id: 12, name: '安踏体育用品集团有限公司', tags: ['体育用品', '品牌赞助'], image: '/images/resources/suppliers/supplier-12.png', ratio: 1.97, intro: '国内头部运动品牌，提供专业赛事及团队装备', region: '全国', contact: 'support@anta.com', cases: '赛事包装与赞助服务' },
    { id: 13, name: '三六一度有限公司', tags: ['体育用品', '运动装备'], image: '/images/resources/suppliers/supplier-13.png', ratio: 1.44, intro: '国内体育用品企业，提供团队装备与赛事支持', region: '全国', contact: 'info@361sport.com', cases: '篮球赛事装备供应' },
    { id: 14, name: '东莞市龙翔体育设施有限公司', tags: ['场馆设施', '体育工程'], image: '/images/resources/suppliers/supplier-14.png', ratio: 1.35, intro: '专业场馆设施施工与运营服务商', region: '广东', contact: 'contact@longxiang-sports.com', cases: '体育场馆建设与维护' },
    { id: 15, name: '万达体育', tags: ['赛事运营', '体育投资'], image: '/images/resources/suppliers/supplier-15.png', ratio: 3.04, intro: '国内体育赛事运营与综合服务提供商', region: '全国', contact: 'service@wanda-sports.com', cases: '大型赛事运营管理' },
    { id: 16, name: '阿里体育', tags: ['数字体育', '赛事平台'], image: '/images/resources/suppliers/supplier-16.png', ratio: 2.9, intro: '数字体育平台，提供赛事直播与数据服务', region: '全国', contact: 'support@ali-sports.com', cases: '在线赛事直播与运营' },
    { id: 17, name: '深圳市腾讯计算机系统有限公司', tags: ['数字体育', '媒体版权'], image: '/images/resources/suppliers/supplier-17.png', ratio: 3.19, intro: '数字体育与媒体版权平台，支持赛事转播与内容分发', region: '全国', contact: 'sports@qq.com', cases: '体育赛事数字版权服务' },
    { id: 18, name: '体奥动力（北京）体育传播有限公司', tags: ['体育传播', '赛事营销'], image: '/images/resources/suppliers/supplier-18.png', ratio: 3.16, intro: '体育传播与赛事营销服务品牌', region: '全国', contact: 'contact@ti-aodongli.com', cases: '体育传播与品牌推广' },
    { id: 19, name: '上海聚力传媒技术有限公司', tags: ['体育传媒', '数据技术'], image: '/images/resources/suppliers/supplier-19.png', ratio: 2.92, intro: '体育媒体与数据技术服务提供商', region: '全国', contact: 'info@pplive.com', cases: '赛事直播与数据服务' },
    { id: 20, name: '广州恒大淘宝', tags: ['俱乐部', '体育投资'], image: '/images/resources/suppliers/supplier-20.png', ratio: 0.9, intro: '知名体育俱乐部与体育投资平台', region: '广东', contact: 'contact@evergrande-taobao.com', cases: '俱乐部运营与体育赛事合作' },
  ],
  media: [
    { id: 1, name: '新浪体育', tags: ['综合体育', '新闻资讯'], image: '/images/resources/media/media-sina.png', intro: '中国最大的体育资讯门户之一，覆盖全球体育赛事报道', audience: '月活用户5000万+', coverage: '全球体育赛事报道', contact: 'sports@sina.com', cases: 'CBA、世界杯全程报道' },
    { id: 2, name: '荔枝网', tags: ['广电媒体', '视频直播'], image: '/images/resources/media/media-lizhi.png', intro: '广东广播电视台旗下新媒体平台，华南地区赛事直播主力', audience: '覆盖广东全省8000万+', coverage: '华南地区赛事直播', contact: 'www.gdtv.cn', cases: '广东省运会全程直播' },
    { id: 3, name: '南方+', tags: ['融媒体', '深度报道'], image: '/images/resources/media/media-nfplus.png', intro: '南方报业传媒集团官方客户端，深度体育新闻报道平台', audience: '下载量3000万+', coverage: '深度体育新闻报道', contact: 'www.southcn.com', cases: 'CUBAL专题报道' },
    { id: 4, name: '央视频', tags: ['国家级', '全媒体'], image: '/images/resources/media/media-yangshipin.png', intro: '中央广播电视总台5G新媒体平台，国家级赛事全程报道', audience: '用户规模3亿+', coverage: '国家级赛事全程报道', contact: 'www.yangshipin.cn', cases: '奥运会、世界杯转播' },
    { id: 5, name: '新华社体育', tags: ['权威媒体', '国际传播'], image: '/images/resources/media/media-xinhua.png', intro: '国家通讯社体育新闻部门，国际国内重大赛事权威报道', audience: '全球受众覆盖', coverage: '国际国内重大赛事', contact: 'sports@xinhuaet.com', cases: '篮球世界杯官方报道' },
    { id: 6, name: '腾讯体育', tags: ['数字体育', '赛事版权'], image: '/images/resources/media/media-qq.png', intro: '中国领先的数字体育平台，NBA中国大陆独家数字版权方', audience: '月活用户1亿+', coverage: 'NBA、CBA独家版权', contact: 'sports.qq.com', cases: 'NBA中国独家转播' },
    { id: 7, name: '东莞日报', tags: ['地方日报', '粤港澳'], image: '/images/resources/media/1.png', intro: '东莞本地权威日报，聚焦城市新闻与体育赛事报道', audience: '本地读者覆盖广泛', coverage: '东莞本地体育新闻', contact: 'sports@dgnews.cn', cases: '地方篮球赛事报道' },
    { id: 8, name: '东莞时报', tags: ['地方传媒', '生活资讯'], image: '/images/resources/media/2.png', intro: '东莞本地生活资讯媒体，提供体育新闻与社区报道', audience: '本地读者群体', coverage: '社区体育与大赛报道', contact: 'news@dgtimes.cn', cases: '本地赛事宣传' },
    { id: 9, name: '东莞阳光网', tags: ['数字媒体', '城市门户'], image: '/images/resources/media/3.png', intro: '东莞城市门户网站，覆盖城市新闻、体育赛事和生活服务', audience: '线上用户覆盖东莞全区域', coverage: '东莞体育赛事在线报道', contact: 'service@yangguangdg.com', cases: '城市体育赛事传播' },
    { id: 10, name: '东莞时间网', tags: ['数字媒体', '本地资讯'], image: '/images/resources/media/4.png', intro: '东莞本地资讯平台，聚焦新闻热点与体育赛事报道', audience: '本地在线用户', coverage: '城市体育新闻与赛事报道', contact: 'contact@dgtimes.cn', cases: '本地赛事报道与推广' },
    { id: 11, name: '东莞发布', tags: ['政府发布', '权威资讯'], image: '/images/resources/media/5.png', intro: '东莞官方发布平台，提供权威新闻与公众服务信息', audience: '政府及公众用户', coverage: '权威赛事信息发布', contact: 'service@dgfabu.gov.cn', cases: '官方赛事公告与发布' },
    { id: 12, name: '佛山日报', tags: ['地方日报', '体育新闻'], image: '/images/resources/media/6.png', intro: '佛山本地权威日报，报道佛山及周边区域体育赛事', audience: '佛山地区读者', coverage: '地方篮球赛事报道', contact: 'sports@fsdaily.com', cases: '佛山地区赛事宣传' },
    { id: 13, name: '珠江时报', tags: ['广州传媒', '新闻资讯'], image: '/images/resources/media/7.png', intro: '珠江时报覆盖广州及珠三角地区新闻，关注体育赛事报道', audience: '珠三角区域受众', coverage: '区级体育赛事报道', contact: 'news@pearlrivertimes.com', cases: '区域体育新闻传播' },
    { id: 14, name: '珠江商报', tags: ['财经媒体', '城市资讯'], image: '/images/resources/media/8.png', intro: '珠江商报兼顾财经与城市资讯，也涉及体育赛事内容', audience: '商界与城市读者', coverage: '体育赛事与商业报道', contact: 'sports@pearlriverbusiness.com', cases: '赛事商业报道与推广' },
    { id: 15, name: '佛山头条', tags: ['本地头条', '新闻平台'], image: '/images/resources/media/9.png', intro: '佛山本地新闻平台，聚焦体育新闻与城市头条', audience: '佛山本地用户', coverage: '本地体育热点报道', contact: 'contact@fsheadline.com', cases: '城市体育资讯传播' },
    { id: 16, name: '羊城晚报', tags: ['晚报', '广州资讯'], image: '/images/resources/media/10.png', intro: '广州知名晚报，覆盖新闻、体育和生活资讯', audience: '广州及周边读者', coverage: '体育赛事与本地新闻', contact: 'service@yangchengwanbao.com', cases: '大型体育赛事报道' },
    { id: 17, name: '广州日报', tags: ['省级日报', '权威资讯'], image: '/images/resources/media/11.png', intro: '广州日报是广东省权威日报之一，常年报道体育赛事', audience: '省内读者', coverage: '广东体育赛事报道', contact: 'sports@gzdaily.com', cases: '省级体育报道' },
    { id: 18, name: '新快报', tags: ['都市报', '快讯'], image: '/images/resources/media/12.png', intro: '广州市民快报媒体，及时报道新闻与赛事动态', audience: '都市用户', coverage: '体育快讯与赛事报道', contact: 'news@xkb.com', cases: '赛事快讯传播' },
    { id: 19, name: '大洋网', tags: ['门户网站', '体育新闻'], image: '/images/resources/media/13.png', intro: '大洋网作为广州日报旗下门户网站，覆盖综合新闻与体育报道', audience: '省内外互联网用户', coverage: '线上体育新闻传播', contact: 'service@dayoo.com', cases: '赛事网络传播' },
    { id: 20, name: '深圳新闻网', tags: ['深圳媒体', '新闻平台'], image: '/images/resources/media/14.png', intro: '深圳本地新闻网站，报道城市新闻与体育赛事', audience: '深圳及周边地区用户', coverage: '城市体育赛事报道', contact: 'service@sznews.com', cases: '本地赛事传播' },
    { id: 21, name: '金羊网', tags: ['本地门户', '体育资讯'], image: '/images/resources/media/15.png', intro: '金羊网是广州本地门户网站，提供体育资讯与赛事报道', audience: '本地互联网用户', coverage: '体育资讯与赛事报道', contact: 'news@yangyang.com', cases: '本地体育赛事传播' },
    { id: 22, name: '奥一网', tags: ['新媒体', '体育传播'], image: '/images/resources/media/16.png', intro: '奥一网覆盖广州及华南地区，提供体育报道与赛事内容', audience: '华南区域用户', coverage: '体育新闻与赛事传播', contact: 'sports@oeeee.com', cases: '赛事报道与线上传播' },
  ]
};

const BASKETBALL_MODULES = [
  { id: 'hr', label: '人力资源库', shortLabel: '人力', icon: '👥' },
  { id: 'venues', label: '场地库', shortLabel: '场地', icon: '🏟️' },
  { id: 'materials', label: '物料库', shortLabel: '物料', icon: '📦' },
  { id: 'suppliers', label: '供应商库', shortLabel: '供应商', icon: '🤝' },
  { id: 'media', label: '媒体库', shortLabel: '媒体', icon: '📺' }
];

function ImageGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) return null;

  const goPrev = () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  const goNext = () => setCurrentIndex(prev => (prev + 1) % images.length);

  return (
    <>
      <div className="space-y-3">
        {/* Main large image with arrows */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-primary)] group cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[currentIndex]}
            alt={`gallery-${currentIndex}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full items-center justify-center text-5xl absolute inset-0">
            🖼️
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--bg-primary)]/80 border border-[var(--border)] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--bg-primary)]/80 border border-[var(--border)] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Index badge */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[var(--bg-primary)]/80 text-xs text-[var(--text-primary)] border border-[var(--border)]">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'}`}
              >
                <img
                  src={img}
                  alt={`thumb-${i}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="hidden w-full h-full items-center justify-center text-2xl absolute inset-0 bg-[var(--bg-primary)]">
                  🖼️
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--bg-primary)]/80 border border-[var(--border)] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--bg-primary)]/80 border border-[var(--border)] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--bg-primary)]/80 border border-[var(--border)] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentIndex]}
              alt={`lightbox-${currentIndex}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-[var(--border)]"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-[80vw] h-[60vh] items-center justify-center text-6xl" style={{ color: 'var(--accent)' }}>
              🖼️
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CustomSelect({ label, value, onChange, options, placeholder = '请选择' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && <label className="text-sm font-medium text-[var(--accent)]">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 card-base border-2 border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-300 flex items-center justify-between hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent-muted)] group"
        >
          <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
            {value || placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-[var(--accent)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 card-base border-2 border-[var(--border)] rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-[var(--border)]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索选项..."
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-custom">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center justify-between group ${
                      value === option
                        ? 'bg-[var(--accent-light)] text-[var(--accent-hover)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{option}</span>
                    {value === option && (
                      <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">无匹配结果</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BasketballCard({ module, onClick, isActive, isHovered }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer select-none transition-all duration-300 ease-out"
    >
      <div className="relative rounded-3xl border-2 backdrop-blur-sm p-5 flex flex-col items-center gap-3 group"
        style={{
          background: isHovered || isActive
            ? 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))'
            : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
          borderColor: isActive ? 'var(--accent)' : (isHovered ? 'var(--accent)' : 'var(--border)'),
          boxShadow: isActive
            ? '0 8px 32px var(--accent-muted)'
            : (isHovered ? '0 4px 20px var(--shadow)' : '0 2px 8px var(--shadow)')
        }}
      >
        {isActive && (
          <div className="absolute -inset-1 rounded-3xl blur-sm -z-10"
            style={{
              background: 'linear-gradient(135deg, var(--accent-muted), var(--accent-muted), transparent)'
            }}
          />
        )}
        <div className="w-20 h-20 rounded-full flex items-center justify-center relative transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--page-accent), var(--page-accent-secondary))',
            boxShadow: isHovered || isActive
              ? '0 8px 24px var(--accent-muted)'
              : '0 4px 12px var(--accent-muted)',
            border: '2px solid var(--border)',
            transform: isHovered || isActive ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <div className="absolute inset-2 rounded-full" style={{ border: '1px solid var(--border)' }} />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-3xl z-10 drop-shadow-lg">{module.icon}</span>
        </div>
        <div className="text-center">
          <h3 className={`font-black text-sm transition-colors duration-300 ${isActive ? 'gold-shine' : (isHovered ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}`}>
            {module.shortLabel}
          </h3>
          <p className={`text-xs mt-0.5 transition-colors duration-300 ${isHovered ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'}`}>
            {module.label}
          </p>
        </div>
      </div>
    </div>
  );
}

function HRModule({ onBack, onCollapse }) {
  const [activeTab, setActiveTab] = useState('referees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYears, setFilterYears] = useState('');

  const data = MOCK_DATA.hr[activeTab];
  const filtered = data.filter(item => {
    const matchSearch = !searchTerm || item.name.includes(searchTerm);
    const matchYears = !filterYears || item.years >= parseInt(filterYears);
    return matchSearch && matchYears;
  });

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <div className="flex gap-3">
            {['referees', 'coaches'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black shadow-lg shadow-[var(--accent-muted)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                {tab === 'referees' ? '裁判' : '教练'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          收起
        </button>
      </div>

      <div className="card-base rounded-2xl p-6 mb-6 border border-[var(--border)] shadow-xl shadow-[var(--shadow)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomSelect
            label="搜索姓名"
            value={searchTerm || ''}
            onChange={setSearchTerm}
            options={data.map(d => d.name)}
            placeholder="输入姓名搜索"
          />
          <CustomSelect
            label="年限筛选"
            value={filterYears}
            onChange={setFilterYears}
            options={['5年以上', '10年以上', '15年以上']}
            placeholder="选择年限"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-custom" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filtered.map(item => (
          <div key={item.id} className="card-base rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent-muted)] to-[var(--accent-hover)]/20 rounded-xl overflow-hidden flex items-center justify-center text-3xl border border-[var(--border)]">
                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <span className="hidden w-full h-full items-center justify-center text-3xl">{activeTab === 'referees' ? '⚖️' : '📋'}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors">{item.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-[var(--text-tertiary)] space-y-1">
              <p>年龄: {item.age} | {activeTab === 'referees' ? '执裁' : '执教'}年限: {item.years}年</p>
              <p>{activeTab === 'referees' ? item.certificate : `执教时间: ${item.teachingTime}`}</p>
              <p className="text-[var(--accent)]">{activeTab === 'referees' ? item.experience : item.achievements}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VenuesModule({ onBack, onCollapse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);

  const filtered = MOCK_DATA.venues.filter(item => {
    const matchSearch = !searchTerm || item.name.includes(searchTerm);
    const matchRegion = !filterRegion || item.region === filterRegion;
    const matchType = !filterType || item.type === filterType;
    return matchSearch && matchRegion && matchType;
  });

  const regions = [...new Set(MOCK_DATA.venues.map(v => v.region))];

  if (selectedVenue) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-custom">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedVenue(null)} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
          <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            收起
          </button>
        </div>

        <div className="card-base rounded-2xl p-6 border border-[var(--border)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{selectedVenue.name}</h2>
          <div className="mb-6">
            <ImageGallery images={selectedVenue.gallery} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📍 地理位置</h3>
                <p className="text-[var(--text-secondary)]">{selectedVenue.address}</p>
                <div className="mt-3 h-40 bg-[var(--bg-primary)] rounded-xl overflow-hidden relative border border-[var(--border)]">
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[var(--bg-primary)]/80 text-xs text-[var(--accent)] border border-[var(--border)]">📍地图位置示意</div>
                  <img src={selectedVenue.map} alt="map" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="hidden w-full h-full items-center justify-center text-6xl">🗺️</div>
                </div>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📐 场地规格</h3>
                <p className="text-[var(--text-secondary)]">{selectedVenue.specs}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">🏗️ 配套设施</h3>
                <p className="text-[var(--text-secondary)]">{selectedVenue.facilities}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">🕐 开放时间</h3>
                <p className="text-[var(--text-secondary)]">{selectedVenue.openTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          收起
        </button>
      </div>

      <div className="card-base rounded-2xl p-6 mb-6 border border-[var(--border)] shadow-xl shadow-[var(--shadow)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomSelect label="搜索场地" value={searchTerm || ''} onChange={setSearchTerm} options={MOCK_DATA.venues.map(v => v.name)} placeholder="输入场地名称" />
          <CustomSelect label="区域筛选" value={filterRegion} onChange={setFilterRegion} options={regions} placeholder="选择区域" />
          <CustomSelect label="类型筛选" value={filterType} onChange={setFilterType} options={['室内', '室外']} placeholder="选择类型" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-custom" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filtered.map(venue => (
          <div
            key={venue.id}
            onClick={() => setSelectedVenue(venue)}
            className="card-base rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group"
          >
            <div className="h-40 bg-[var(--bg-primary)] overflow-hidden flex items-center justify-center text-6xl relative">
              <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden w-full h-full items-center justify-center text-6xl">🏟️</div>
              <div className="absolute top-3 right-3 px-3 py-1 bg-[var(--bg-primary)]/80 rounded-full text-xs text-[var(--text-primary)]">{venue.type}</div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors mb-2">{venue.name}</h3>
              <p className="text-sm text-[var(--text-tertiary)]">📍 {venue.region} · {venue.specs}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsModule({ onBack, onCollapse }) {
  const [activeTab, setActiveTab] = useState('rental');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [colCount, setColCount] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setColCount(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const data = MOCK_DATA.materials[activeTab];
  const filtered = data.filter(item => {
    const matchSearch = !searchTerm || item.name.includes(searchTerm);
    const matchType = !filterType || item.name.includes(filterType);
    return matchSearch && matchType;
  });

  const allNames = [...MOCK_DATA.materials.rental, ...MOCK_DATA.materials.custom].map(d => d.name);

  const columns = useMemo(() => {
    const cols = Array.from({ length: Math.max(1, colCount) }, () => []);
    const heights = new Array(Math.max(1, colCount)).fill(0);
    filtered.forEach(item => {
      const imgW = 320;
      const imgH = imgW / (item.ratio > 0 ? item.ratio : 1);
      const h = imgH + 108;
      const idx = heights.indexOf(Math.min(...heights));
      cols[idx].push(item);
      heights[idx] += h;
    });
    return cols;
  }, [filtered, colCount]);

  if (selectedItem) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-custom">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedItem(null)} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
          <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            收起
          </button>
        </div>

        <div className="card-base rounded-2xl p-6 border border-[var(--border)]">
          <div className="max-w-md mb-6">
            <div className="w-full bg-[var(--bg-primary)] rounded-2xl overflow-hidden flex items-center justify-center text-6xl border border-[var(--border)]">
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-auto object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden w-full h-full items-center justify-center text-6xl">📦</div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedItem.name}</h2>
              <p className="text-[var(--text-tertiary)]">{selectedItem.spec || selectedItem.range}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[var(--accent)] font-bold mb-3">📋 详细信息</h3>
              <p className="text-[var(--text-secondary)]">{selectedItem.details}</p>
              <p className="text-[var(--text-secondary)] mt-2">规格: {selectedItem.spec || '标准'}</p>
            </div>
            <div>
              <h3 className="text-[var(--accent)] font-bold mb-3">📊 {activeTab === 'rental' ? '预约时段' : '定制流程'}</h3>
              <div className="space-y-2 text-[var(--text-secondary)]">
                {activeTab === 'rental' ? (
                  <><p>上午: 08:00-12:00</p><p>下午: 14:00-18:00</p><p>晚间: 18:00-22:00</p></>
                ) : (
                  <><p>1. 需求沟通</p><p>2. 设计方案</p><p>3. 材质确认</p><p>4. 打样确认</p><p>5. 批量生产</p></>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-tertiary)]">状态: <span className="text-[var(--accent-hover)] font-bold">{selectedItem.status || '可定制'}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div className="flex items-center gap-3">
          <div className="flex gap-3">
            {['rental', 'custom'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black shadow-lg shadow-[var(--accent-muted)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                {tab === 'rental' ? '租借服务' : '定制服务'}
              </button>
            ))}
          </div>
          <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            收起
          </button>
        </div>
      </div>

      <div className="card-base rounded-2xl p-6 mb-6 border border-[var(--border)] shadow-xl shadow-[var(--shadow)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomSelect label="搜索物料" value={searchTerm || ''} onChange={setSearchTerm} options={allNames} placeholder="输入物料名称" />
          <CustomSelect label="类型筛选" value={filterType} onChange={setFilterType} options={data.map(d => d.name)} placeholder="选择类型" />
        </div>
      </div>

      <div className="flex items-start gap-4 overflow-y-auto scrollbar-custom px-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex-1 min-w-0 flex flex-col gap-4">
            {col.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="card-base rounded-2xl p-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group"
              >
                <div className="w-full bg-[var(--bg-primary)] rounded-xl overflow-hidden flex items-center justify-center text-4xl mb-3 border border-[var(--border)]">
                  <img src={item.image} alt={item.name} className="w-full h-auto object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="hidden w-full h-full items-center justify-center text-4xl">📦</div>
                </div>
                <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors mb-1">{item.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)] mb-2">{item.spec || item.range}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${item.status === '可租' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {item.status || '可定制'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SuppliersModule({ onBack, onCollapse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [colCount, setColCount] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setColCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const services = [...new Set(MOCK_DATA.suppliers.flatMap(s => s.tags))];
  const regions = [...new Set(MOCK_DATA.suppliers.map(s => s.region))];

  const filtered = MOCK_DATA.suppliers.filter(item => {
    const matchSearch = !searchTerm || item.name.includes(searchTerm);
    const matchService = !filterService || item.tags.includes(filterService);
    const matchRegion = !filterRegion || item.region === filterRegion;
    return matchSearch && matchService && matchRegion;
  });

  const columns = useMemo(() => {
    const n = Math.max(1, colCount);
    const cols = Array.from({ length: n }, () => []);
    const heights = new Array(n).fill(0);
    filtered.forEach(item => {
      const imgW = 340;
      const imgH = imgW / (item.ratio > 0 ? item.ratio : 1);
      const h = imgH + 132;
      const idx = heights.indexOf(Math.min(...heights));
      cols[idx].push(item);
      heights[idx] += h;
    });
    return cols;
  }, [filtered, colCount]);

  if (selectedSupplier) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-custom">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedSupplier(null)} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
          <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            收起
          </button>
        </div>

        <div className="card-base rounded-2xl p-6 border border-[var(--border)]">
          <div className="max-w-md mb-6">
            <div className="w-full bg-[var(--bg-primary)] rounded-2xl overflow-hidden flex items-center justify-center text-6xl border border-[var(--border)]">
              <img src={selectedSupplier.image} alt={selectedSupplier.name} className="w-full h-auto object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden w-full h-full items-center justify-center text-6xl">🏢</div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedSupplier.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSupplier.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📄 公司简介</h3>
                <p className="text-[var(--text-secondary)]">{selectedSupplier.intro}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📜 资质证明</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['📜', '🏛️', '✅'].map((icon, i) => (
                    <div key={i} className="aspect-square bg-[var(--bg-primary)] rounded-xl flex items-center justify-center text-3xl border border-[var(--border)]">{icon}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">💼 核心服务</h3>
                <p className="text-[var(--text-secondary)]">{selectedSupplier.tags.join('、')}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">🏆 合作案例</h3>
                <p className="text-[var(--text-secondary)]">{selectedSupplier.cases}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📍 服务区域</h3>
                <p className="text-[var(--text-secondary)]">{selectedSupplier.region}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📞 联系方式</h3>
                <p className="text-[var(--text-secondary)]">{selectedSupplier.contact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

    return (
     <div className="w-full h-full">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
         <button onClick={onBack} className="card-base px-4 py-2 rounded-xl transition-all flex items-center gap-2" style={{ color: 'var(--accent)' }}>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
           </svg>
           返回
         </button>
         <button onClick={onCollapse} className="card-base px-4 py-2 rounded-xl transition-all flex items-center gap-2" style={{ color: 'var(--accent)' }}>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
           收起
         </button>
       </div>

       <div className="card-base rounded-2xl p-6 mb-6 shadow-xl">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <CustomSelect label="搜索供应商" value={searchTerm || ''} onChange={setSearchTerm} options={MOCK_DATA.suppliers.map(s => s.name)} placeholder="输入供应商名称" />
           <CustomSelect label="服务类型" value={filterService} onChange={setFilterService} options={services} placeholder="选择服务类型" />
           <CustomSelect label="服务区域" value={filterRegion} onChange={setFilterRegion} options={regions} placeholder="选择区域" />
         </div>
       </div>

<div className="flex items-start gap-4 overflow-y-auto scrollbar-custom px-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
         {columns.map((col, ci) => (
           <div key={ci} className="flex-1 min-w-0 flex flex-col gap-4">
             {col.map(supplier => (
               <div
                 key={supplier.id}
                 onClick={() => setSelectedSupplier(supplier)}
                 className="card-base rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group"
               >
                 <div className="w-full overflow-hidden flex items-center justify-center text-5xl border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                   <img src={supplier.image} alt={supplier.name} className="w-full h-auto object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="hidden w-full h-full items-center justify-center text-5xl">🏢</div>
                 </div>
               <div className="p-4">
                 <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors mb-2">{supplier.name}</h3>
                 <div className="flex flex-wrap gap-2 mb-3">
                   {supplier.tags.map((tag, i) => (
                     <span key={i} className="px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs rounded-full">{tag}</span>
                   ))}
                 </div>
                 <p className="text-sm text-[var(--text-tertiary)]">📍 {supplier.region}</p>
               </div>
             </div>
           ))}
         </div>
       ))}
     </div>
    </div>
  );
}

function MediaModule({ onBack, onCollapse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const filtered = MOCK_DATA.media.filter(item => {
    const matchSearch = !searchTerm || item.name.includes(searchTerm);
    const matchType = !filterType || item.tags.includes(filterType);
    return matchSearch && matchType;
  });

  const mediaTypes = [...new Set(MOCK_DATA.media.flatMap(m => m.tags))];

  if (selectedMedia) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-custom">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedMedia(null)} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
          <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            收起
          </button>
        </div>

        <div className="card-base rounded-2xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-muted)] to-[var(--accent-hover)]/20 rounded-2xl overflow-hidden flex items-center justify-center text-5xl border border-[var(--border)]">
              <img src={selectedMedia.image} alt={selectedMedia.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden w-full h-full items-center justify-center text-5xl">📺</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedMedia.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMedia.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📖 平台简介</h3>
                <p className="text-[var(--text-secondary)]">{selectedMedia.intro}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">👥 覆盖受众</h3>
                <p className="text-[var(--text-secondary)]">{selectedMedia.audience}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📡 服务范围</h3>
                <p className="text-[var(--text-secondary)]">{selectedMedia.coverage}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">🏆 合作案例</h3>
                <p className="text-[var(--text-secondary)]">{selectedMedia.cases}</p>
              </div>
              <div>
                <h3 className="text-[var(--accent)] font-bold mb-2">📞 对接方式</h3>
                <p className="text-[var(--text-secondary)]">{selectedMedia.contact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="px-4 py-2 card-base text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <button onClick={onCollapse} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl border border-[var(--border)] hover:bg-[var(--accent-light)] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          收起
        </button>
      </div>

      <div className="card-base rounded-2xl p-6 mb-6 border border-[var(--border)] shadow-xl shadow-[var(--shadow)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomSelect label="搜索媒体平台" value={searchTerm || ''} onChange={setSearchTerm} options={MOCK_DATA.media.map(m => m.name)} placeholder="输入平台名称" />
          <CustomSelect label="类型筛选" value={filterType} onChange={setFilterType} options={mediaTypes} placeholder="选择类型" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-custom" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filtered.map(media => (
          <div
            key={media.id}
            onClick={() => setSelectedMedia(media)}
            className="card-base rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent-muted)] to-[var(--accent-hover)]/20 rounded-xl overflow-hidden flex items-center justify-center text-3xl border border-[var(--border)]">
                <img src={media.image} alt={media.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="hidden w-full h-full items-center justify-center text-3xl">📺</div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors">{media.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {media.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] line-clamp-2">{media.intro}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [expandedModule, setExpandedModule] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [basketballPositions, setBasketballPositions] = useState([
    { index: 0, x: 0, y: 0, state: 'bottom', opacity: 1 },
    { index: 1, x: 0, y: 0, state: 'bottom', opacity: 1 },
    { index: 2, x: 0, y: 0, state: 'bottom', opacity: 1 },
    { index: 3, x: 0, y: 0, state: 'bottom', opacity: 1 },
    { index: 4, x: 0, y: 0, state: 'bottom', opacity: 1 }
  ]);
  const containerRef = useRef(null);

  const _currentTitle = expandedModule !== null
    ? BASKETBALL_MODULES[expandedModule].label
    : '资源管理';

  useEffect(() => {
    if (!containerRef.current) return;

    const updatePositions = () => {
      if (expandedModule === null) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const cardWidth = 140;
        const gap = 20;
        const totalWidth = cardWidth * 5 + gap * 4;
        const startX = (containerWidth - totalWidth) / 2 + cardWidth / 2;
        const y = containerHeight / 2 + 40;

        setBasketballPositions(prev =>
          prev.map((pos, idx) => ({
            ...pos,
            x: startX + idx * (cardWidth + gap),
            y: y,
            state: 'bottom',
            opacity: 1
          }))
        );
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [expandedModule]);

  const handleBasketballClick = useCallback((moduleIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setExpandedModule(prev => {
      if (prev === moduleIndex) return null;
      return moduleIndex;
    });

    setBasketballPositions(prev => {
      if (!containerRef.current) return prev;
      const containerWidth = containerRef.current.offsetWidth;
      const _containerHeight = containerRef.current.offsetHeight;

      return prev.map((pos, idx) => {
        if (idx === moduleIndex) {
          return { ...pos, x: -200, y: -200, state: 'expanded', opacity: 0 };
        } else {
          const adjustedIndex = idx < moduleIndex ? idx : idx - 1;
          return {
            ...pos,
            x: containerWidth - 80,
            y: 180 + adjustedIndex * 75,
            state: 'side',
            opacity: 0.6
          };
        }
      });
    });

    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const handleCollapse = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setExpandedModule(null);

    setBasketballPositions(prev => {
      if (!containerRef.current) return prev;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const cardWidth = 140;
      const gap = 20;
      const totalWidth = cardWidth * 5 + gap * 4;
      const startX = (containerWidth - totalWidth) / 2 + cardWidth / 2;
      const y = containerHeight / 2 + 40;

      return prev.map((pos, idx) => ({
        index: idx,
        x: startX + idx * (cardWidth + gap),
        y: y,
        state: 'bottom',
        opacity: 1
      }));
    });

    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating]);

  const handleBack = useCallback(() => {
    setExpandedModule(null);
    setBasketballPositions(prev => {
      if (!containerRef.current) return prev;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const cardWidth = 140;
      const gap = 20;
      const totalWidth = cardWidth * 5 + gap * 4;
      const startX = (containerWidth - totalWidth) / 2 + cardWidth / 2;
      const y = containerHeight / 2 + 40;

      return prev.map((pos, idx) => ({
        index: idx,
        x: startX + idx * (cardWidth + gap),
        y: y,
        state: 'bottom',
        opacity: 1
      }));
    });
  }, []);

  const renderModuleContent = () => {
    if (expandedModule === null) return null;

    const module = BASKETBALL_MODULES[expandedModule];
    const props = { onBack: handleBack, onCollapse: handleCollapse };
    switch (module.id) {
      case 'hr': return <HRModule {...props} />;
      case 'venues': return <VenuesModule {...props} />;
      case 'materials': return <MaterialsModule {...props} />;
      case 'suppliers': return <SuppliersModule {...props} />;
      case 'media': return <MediaModule {...props} />;
      default: return null;
    }
  };

  return (
    <div className="page-resources relative w-full min-h-screen pt-20 overflow-hidden theme-transition" style={{ background: 'var(--page-bg)' }}>

      {expandedModule === null && (
        <>
          {/* Decorative particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[var(--accent-muted)] rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          {/* Center title */}
          <div className="absolute top-24 left-0 right-0 z-30 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black gold-shine mb-4">资源管理</h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>点击卡片展开对应模块，探索篮球赛事全生态资源</p>
          </div>

          {/* Stats bar */}
          <div className="absolute top-52 sm:top-56 left-0 right-0 z-30">
            <div className="max-w-md mx-auto px-4">
              <div className="card-base rounded-xl p-3 sm:p-4 grid grid-cols-5 gap-2 sm:gap-4 shadow-lg" style={{ boxShadow: '0 4px 16px var(--shadow)' }}>
                {BASKETBALL_MODULES.map(module => (
                  <div key={module.id} className="text-center">
                    <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--accent)' }}>{module.shortLabel}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                      {module.id === 'hr' ? `${MOCK_DATA.hr.referees.length + MOCK_DATA.hr.coaches.length}人` : module.id === 'venues' ? `${MOCK_DATA.venues.length}个` : module.id === 'materials' ? `${MOCK_DATA.materials.rental.length + MOCK_DATA.materials.custom.length}项` : module.id === 'suppliers' ? `${MOCK_DATA.suppliers.length}家` : `${MOCK_DATA.media.length}家`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none">
        {basketballPositions.map((pos, idx) => {
          const isHovered = hoveredCard === idx;
          const displayOpacity = pos.state === 'side'
            ? (isHovered ? 1 : 0.65)
            : pos.opacity;
          const displayScale = pos.state === 'side'
            ? (isHovered ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)')
            : 'translate(-50%, -50%)';

          return (
            <div
              key={pos.index}
              className="absolute pointer-events-auto transition-all duration-300 ease-out"
              style={{
                left: pos.x,
                top: pos.y,
                transform: displayScale,
                opacity: displayOpacity,
                zIndex: isHovered ? 50 : (pos.state === 'expanded' ? 0 : 30)
              }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <BasketballCard
                module={BASKETBALL_MODULES[pos.index]}
                onClick={() => handleBasketballClick(pos.index)}
                isActive={expandedModule === pos.index}
                isCollapsed={pos.state === 'side'}
                isHovered={isHovered}
              />
            </div>
          );
        })}
      </div>

      {expandedModule !== null && (
        <div className="absolute inset-0 z-10 animate-in fade-in"
          style={{ backgroundColor: 'var(--bg-overlay)' }}
        >
          <div className="w-full h-full overflow-y-auto scrollbar-custom pt-24 sm:pt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
              {renderModuleContent()}
            </div>
          </div>
        </div>
      )}

      {/* Footer hints */}
      {expandedModule === null && (
        <div className="absolute bottom-8 left-0 right-0 z-30 text-center">
          <p className="text-xs text-[var(--text-muted)] animate-pulse">
            ⬆ 向上滑动或点击卡片开始探索 ⬆
          </p>
        </div>
      )}
    </div>
  );
}
