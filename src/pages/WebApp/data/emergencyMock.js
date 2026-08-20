export const INCIDENTS = [
  { id: 'i1', planId: 'p1', dateDay: 6, venueName: '东莞篮球中心主馆', summary: '广东德比中球员突破落地崴脚，队医进场处置', severity: 'medium', status: 'resolved', reporter: '王医生', resolvedBy: '现场医疗组' },
  { id: 'i2', planId: 'p7', dateDay: 9, venueName: '东莞篮球中心主馆', summary: '德比战双方球迷看台上互掷饮料杯，安保隔离处置', severity: 'high', status: 'resolved', reporter: '李队长', resolvedBy: '安保一队+辖区派出所' },
  { id: 'i3', planId: 'p13', dateDay: 4, venueName: '大朗体育馆', summary: '餐饮后厨油烟管烟感报警，现场确认无明火', severity: 'medium', status: 'resolved', reporter: '陈主管', resolvedBy: '场馆消防组' },
  { id: 'i4', planId: 'p19', dateDay: 12, venueName: '东莞市青少年活动中心篮球馆', summary: '赛事进行中突发雷暴警报，临时停电5分钟', severity: 'high', status: 'resolved', reporter: '刘指挥', resolvedBy: '现场指挥中心+电力保障组' },
  { id: 'i5', planId: 'p25', dateDay: 7, venueName: '深圳体育中心体育馆', summary: '比赛24秒计时器第三节突发故障，切换备用设备', severity: 'medium', status: 'resolved', reporter: '赵技师', resolvedBy: '现场技术保障组' },
  { id: 'i6', planId: 'p3', dateDay: 3, venueName: '广州天河体育馆', summary: '观众席中老年球迷突发晕厥，AED成功除颤', severity: 'high', status: 'resolved', reporter: '孙医生', resolvedBy: '现场医疗组+120急救中心' },
  { id: 'i7', planId: 'p9', dateDay: 11, venueName: '东莞篮球中心主馆', summary: '球迷硬闯球员通道围堵客队球员，安保制服带离', severity: 'high', status: 'resolved', reporter: '王队长', resolvedBy: '安保二队+场馆保卫科' },
  { id: 'i8', planId: 'p15', dateDay: 5, venueName: '厚街体育馆', summary: '地下室仓库纸箱阴燃，喷淋系统自动启动', severity: 'medium', status: 'resolved', reporter: '周消防员', resolvedBy: '场馆专职消防队' },
  { id: 'i9', planId: 'p22', dateDay: 14, venueName: '松山湖篮球公园', summary: '台风预警提前中止比赛，观众有序疏散', severity: 'medium', status: 'resolved', reporter: '吴场长', resolvedBy: '赛事组委会+现场指挥中心' },
  { id: 'i10', planId: 'p28', dateDay: 8, venueName: '广东体育职业技术学院体育馆', summary: '记录台记分牌电脑死机，重启后数据恢复', severity: 'low', status: 'resolved', reporter: '郑记录员', resolvedBy: '记录台+技术保障组' },
  { id: 'i11', planId: 'p2', dateDay: 2, venueName: '东莞篮球中心主馆', summary: '球员争抢篮板落地后脑震荡，离场评估观察', severity: 'high', status: 'resolved', reporter: '林队医', resolvedBy: '主队医疗组+脑震荡评估专员' },
  { id: 'i12', planId: 'p18', dateDay: 10, venueName: '广州宝能观致文化中心', summary: '消防警报误报触发全馆疏散广播，10分钟内解除', severity: 'low', status: 'resolved', reporter: '黄消防主管', resolvedBy: '消防控制中心+安保大队' }
]

export const EMERGENCY_PLANS = [
  {
    id: 'p1',
    title: '球员脚踝扭伤场边RICE处置流程',
    category: '医疗',
    severity: 'medium',
    triggerCondition: '球员在比赛或训练中发生踝关节内翻或外翻损伤，表现为局部疼痛、肿胀、行走困难，但未出现明显畸形或开放性伤口。通常发生在突破变向、争抢篮板落地或踩在他人脚上时。',
    slaMinutes: 2,
    steps: [
      { id: 's1', role: '就近裁判员', action: '立即暂停比赛，示意场边医疗人员进场', expectedMinutes: 0.5, toolTip: '注意保护受伤球员，避免其他球员碰撞' },
      { id: 's2', role: '主队/客队队医', action: '场边评估伤情，检查踝关节稳定性，排除骨折风险', expectedMinutes: 2, toolTip: '重点检查距腓前韧带、压痛部位和肿胀程度' },
      { id: 's3', role: '场馆医务主管', action: '执行RICE原则：加压包扎、冰袋冷敷、抬高患肢', expectedMinutes: 5 },
      { id: 's4', role: '球队主教练', action: '根据队医评估决定是否换人，填写换人登记表', expectedMinutes: 1 },
      { id: 's5', role: '场馆医务组', action: '赛后跟进球员恢复情况，必要时安排影像检查', expectedMinutes: 10 }
    ],
    contacts: [
      { name: '王明辉', position: '场馆医务主管', phone: '138 0256 8877', backupPhone: null },
      { name: '林志远', position: '广东华南虎队医', phone: '139 2288 3344', backupPhone: '136 8899 1122' },
      { name: '陈思雨', position: '现场急救护士', phone: '135 7788 9900', backupPhone: null }
    ],
    relatedMatches: ['m1', 'm2', 'm46', 'm47']
  },
  {
    id: 'p2',
    title: '球员脑震荡评估与返场判定流程',
    category: '医疗',
    severity: 'high',
    triggerCondition: '球员头部受到直接撞击或加速/减速损伤，出现头痛、头晕、恶心、意识模糊、短暂失忆或平衡失调等症状。常见于争抢篮板头部碰撞、突破被犯规倒地头部着地等场景。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '裁判员', action: '立即吹停比赛，禁止受伤球员自行起身走动', expectedMinutes: 0.5 },
      { id: 's2', role: '脑震荡评估专员', action: '场边执行SCAT5评估：症状评估、认知筛查、平衡测试', expectedMinutes: 8, toolTip: '评估期间严禁任何人员干扰，包括教练和队友' },
      { id: 's3', role: '赛事医疗总监', action: '根据评估结果判定：立即送医/更衣室观察/可否返场', expectedMinutes: 2 },
      { id: 's4', role: '现场医务组', action: '如需送医，立即联系120并安排绿色通道，同步通知球员家属', expectedMinutes: 5 },
      { id: 's5', role: '记录台', action: '登记球员伤情和出场情况，赛后提交报告至联赛医务委员会', expectedMinutes: 3 },
      { id: 's6', role: '球队医疗组', action: '赛后24小时、48小时、72小时持续随访，完成脑震荡恢复阶梯评估', expectedMinutes: 15 }
    ],
    contacts: [
      { name: '张伟华', position: '赛事医疗总监', phone: '137 0011 2233', backupPhone: '139 5566 7788' },
      { name: '刘建国', position: '脑震荡评估专家', phone: '138 4455 6677', backupPhone: null },
      { name: '赵丽娜', position: '主队随队医生', phone: '136 2233 4455', backupPhone: null },
      { name: '钱文博', position: '联赛医务委员会专员', phone: '135 6677 8899', backupPhone: '137 1122 3344' }
    ],
    relatedMatches: ['m3', 'm4', 'm48', 'm49', 'm50']
  },
  {
    id: 'p3',
    title: '观众席观众晕厥急救与AED使用流程',
    category: '医疗',
    severity: 'high',
    triggerCondition: '观众席出现观众突然倒地、意识丧失、呼之不应，可能伴有抽搐、面色苍白或紫绀。多发生于中老年观众、高温高湿环境下或有基础心脏病史人群。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '就近安保人员', action: '立即通过对讲机报告指挥中心，说明具体区域和座位号', expectedMinutes: 0.5 },
      { id: 's2', role: '场馆急救组', action: '携带AED和急救箱在2分钟内到达现场，评估患者意识和呼吸', expectedMinutes: 2 },
      { id: 's3', role: '场馆医务主管', action: '如无呼吸心跳立即启动CPR，准备AED除颤，清理周围空间', expectedMinutes: 3, toolTip: 'CPR按压深度5-6cm，频率100-120次/分' },
      { id: 's4', role: '现场指挥中心', action: '同步拨打120，安排急救通道，协调电梯和场馆出入口畅通', expectedMinutes: 1 },
      { id: 's5', role: '安保组', action: '维持现场秩序，疏散周围观众开辟急救空间，禁止拍摄传播', expectedMinutes: 2 },
      { id: 's6', role: '医务组', action: '患者恢复意识或120到达后交接情况，填写急救事件报告', expectedMinutes: 8 }
    ],
    contacts: [
      { name: '孙志强', position: '场馆急救组组长', phone: '138 9900 1122', backupPhone: '136 7788 9900' },
      { name: '李秀兰', position: '心内科急诊医生', phone: '139 3344 5566', backupPhone: null },
      { name: '周明远', position: '120急救对接专员', phone: '135 8899 0011', backupPhone: null },
      { name: '吴晓燕', position: '急救护士', phone: '137 2233 4455', backupPhone: '138 1122 3344' }
    ],
    relatedMatches: ['m5', 'm6', 'm51', 'm52']
  },
  {
    id: 'p4',
    title: '球员跟腱断裂紧急处置与转运流程',
    category: '医疗',
    severity: 'high',
    triggerCondition: '球员在起跳落地或急停变向时突发足跟部剧烈疼痛，不能单脚站立、不能踮脚，触诊跟腱连续性中断或出现凹陷，Thompson试验阳性。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '当值裁判员', action: '立即暂停比赛，禁止球员试图站立或行走', expectedMinutes: 0.3 },
      { id: 's2', role: '双方队医+医务主管', action: '场边快速评估，确认跟腱断裂体征，严禁按摩或强行活动', expectedMinutes: 3 },
      { id: 's3', role: '场馆担架组', action: '使用脊柱板硬担架将球员平移抬出场，避免二次损伤', expectedMinutes: 2, toolTip: '固定踝关节于自然中立位，禁止背屈' },
      { id: 's4', role: '现场指挥中心', action: '联系定点合作医院，通知骨科医生待命，安排救护车从最近通道进入', expectedMinutes: 2 },
      { id: 's5', role: '球队医疗组', action: '陪同球员前往医院，携带球员医疗档案和过敏史信息', expectedMinutes: 10 },
      { id: 's6', role: '赛事新闻官', action: '赛后发布官方伤情说明，避免不实信息传播', expectedMinutes: 5 }
    ],
    contacts: [
      { name: '陈永强', position: '骨科副主任医师', phone: '138 6677 8899', backupPhone: '139 2233 4455' },
      { name: '王建军', position: '场馆担架组组长', phone: '136 1122 3344', backupPhone: null },
      { name: '郑海涛', position: '赛事新闻官', phone: '137 5566 7788', backupPhone: null }
    ],
    relatedMatches: ['m7', 'm8', 'm53', 'm54', 'm55']
  },
  {
    id: 'p5',
    title: '场边球员碰撞面部出血止血包扎流程',
    category: '医疗',
    severity: 'medium',
    triggerCondition: '球员在比赛中面部、眉骨、鼻梁或嘴唇受到肘部、手指或篮球撞击，出现开放性伤口出血，或牙齿松动、脱落情况。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '裁判员', action: '暂停比赛，示意医疗人员入场，允许球员暂时下场处理', expectedMinutes: 0.5 },
      { id: 's2', role: '队医', action: '评估伤口深度和出血情况，排除颅脑损伤和颈椎损伤', expectedMinutes: 2, toolTip: '如有意识变化、呕吐症状立即升级为脑震荡预案' },
      { id: 's3', role: '医务组护士', action: '生理盐水冲洗伤口，碘伏消毒，加压包扎止血', expectedMinutes: 4 },
      { id: 's4', role: '球队训练师', action: '检查球员视野和咬合功能，确认无视力障碍和骨折', expectedMinutes: 2 },
      { id: 's5', role: '裁判员+记录台', action: '确认包扎不影响比赛安全，登记出场时间，允许返场', expectedMinutes: 1 }
    ],
    contacts: [
      { name: '马文博', position: '颌面外科医生', phone: '138 7788 9900', backupPhone: null },
      { name: '胡小丽', position: '医务组护士', phone: '136 3344 5566', backupPhone: '135 7788 9900' },
      { name: '林剑锋', position: '客队队医', phone: '139 1122 3344', backupPhone: null }
    ],
    relatedMatches: ['m9', 'm10', 'm56', 'm57']
  },
  {
    id: 'p6',
    title: '工作人员中暑急救与补水流程',
    category: '医疗',
    severity: 'low',
    triggerCondition: '场馆工作人员（保洁、安保、志愿者）在高温高湿环境下长时间工作后，出现头晕、乏力、大量出汗、恶心、体温升高等中暑先兆或轻症中暑症状。',
    slaMinutes: 3,
    steps: [
      { id: 's1', role: '就近同事或主管', action: '将患者转移至阴凉通风处休息，立即报告医务组', expectedMinutes: 1 },
      { id: 's2', role: '场馆医务组', action: '测量体温和血压，评估中暑分级（先兆/轻症/重症）', expectedMinutes: 2 },
      { id: 's3', role: '医务人员', action: '解开衣物散热，冰袋物理降温，补充电解质饮料', expectedMinutes: 5, toolTip: '体温超过38.5度或意识改变立即升级重症处置' },
      { id: 's4', role: '患者部门主管', action: '安排换岗替班，确保患者充分休息，禁止带病上岗', expectedMinutes: 10 },
      { id: 's5', role: '人力资源部', action: '事后复盘，调整高温时段排班和休息频次', expectedMinutes: 15 }
    ],
    contacts: [
      { name: '黄丽华', position: '场馆职业健康护士', phone: '138 5566 7788', backupPhone: null },
      { name: '吴大伟', position: '人力资源主管', phone: '136 2233 4455', backupPhone: '137 8899 0011' },
      { name: '徐明哲', position: '志愿者协调员', phone: '135 1122 3344', backupPhone: null }
    ],
    relatedMatches: ['m11', 'm12', 'm58', 'm59', 'm60']
  },
  {
    id: 'p7',
    title: '德比战球迷双方冲突升级处置预案',
    category: '安保',
    severity: 'high',
    triggerCondition: '同城德比或季后赛关键场次，双方球迷因争议判罚、言语挑衅发生肢体冲突，出现互掷杂物、多人推搡、看台局部混乱，有扩大蔓延趋势。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '冲突区域安保员', action: '立即吹响警哨，使用盾牌/防暴叉隔离冲突双方，同时报告指挥中心', expectedMinutes: 0.5 },
      { id: 's2', role: '安保队长', action: '调动预备队5分钟内到达冲突区域，形成人墙分割看台，防止扩散', expectedMinutes: 3 },
      { id: 's3', role: '现场指挥中心', action: '通过全场广播警告冲突人员，同时通知辖区派出所和驻场民警介入', expectedMinutes: 1 },
      { id: 's4', role: '安保处置组', action: '将挑事者和积极参与者强行带离至安保室，全程录像留存证据', expectedMinutes: 5 },
      { id: 's5', role: '公安民警', action: '完成笔录，根据情节轻重处以警告、罚款或行政拘留，列入观赛黑名单', expectedMinutes: 20 },
      { id: 's6', role: '赛事组委会', action: '赛后发布公告，公布处理结果，俱乐部视情况追加处罚', expectedMinutes: 15 }
    ],
    contacts: [
      { name: '李铁刚', position: '场馆安保大队长', phone: '138 0011 2233', backupPhone: '136 9900 1122' },
      { name: '王卫东', position: '辖区派出所副所长', phone: '139 8877 6655', backupPhone: null },
      { name: '张宏涛', position: '赛事安保总监', phone: '137 5544 3322', backupPhone: null },
      { name: '赵磊', position: '防暴处置组组长', phone: '135 2211 0099', backupPhone: '138 7766 5544' }
    ],
    relatedMatches: ['m13', 'm14', 'm61', 'm62']
  },
  {
    id: 'p8',
    title: '观众向场内投掷矿泉水瓶应急处置',
    category: '安保',
    severity: 'medium',
    triggerCondition: '观众因不满判罚或球队表现，向场内投掷矿泉水瓶、打火机、纸巾等杂物，危及球员、裁判员或工作人员人身安全。',
    slaMinutes: 2,
    steps: [
      { id: 's1', role: '场边安保员', action: '立即定位投掷者位置和座位号，通知看台安保员控制人员', expectedMinutes: 0.5 },
      { id: 's2', role: '看台安保组', action: '2-3名安保员迅速到位，禁止当事人离场，收缴剩余可疑物品', expectedMinutes: 2 },
      { id: 's3', role: '当值主裁判', action: '根据场内情况决定是否暂停比赛，保护球员安全', expectedMinutes: 0.5 },
      { id: 's4', role: '安保室', action: '将投掷者带离看台，核实身份信息，调取监控录像固定证据', expectedMinutes: 8 },
      { id: 's5', role: '赛事新闻官', action: '必要时通过MC和公告提醒全场观众文明观赛，重申观赛纪律', expectedMinutes: 3 }
    ],
    contacts: [
      { name: '孙浩然', position: '看台安保组长', phone: '138 3344 5566', backupPhone: null },
      { name: '刘文华', position: '场边安保负责人', phone: '139 1122 3344', backupPhone: '137 5566 7788' },
      { name: '陈志明', position: '安保信息员（监控调阅）', phone: '136 2233 4455', backupPhone: null }
    ],
    relatedMatches: ['m15', 'm16', 'm63', 'm64', 'm65']
  },
  {
    id: 'p9',
    title: '球迷硬闯球员通道与更衣室门口处置',
    category: '安保',
    severity: 'high',
    triggerCondition: '狂热球迷或滋事人员绕过安检、趁乱强行闯入球员通道、球员热身区或更衣室门口，试图索要签名、合影或骚扰球员。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '通道口哨兵', action: '立即上前拦截，使用身体屏障和话术驱离，同时呼叫增援', expectedMinutes: 0.3 },
      { id: 's2', role: '机动巡逻组', action: '1分钟内到达增援，合力将闯入者控制并带离敏感区域', expectedMinutes: 1 },
      { id: 's3', role: '安保队长', action: '加强更衣室、球员通道双层警戒，增派暗哨加强巡逻', expectedMinutes: 3 },
      { id: 's4', role: '安保室', action: '对闯入者进行身份核验和训诫，属于未成年人通知监护人到场', expectedMinutes: 10, toolTip: '首次闯入口头警告，再次闯入移交公安列入黑名单' },
      { id: 's5', role: '球队联络官', action: '安抚球队和球员情绪，评估是否需要额外安保护送', expectedMinutes: 5 }
    ],
    contacts: [
      { name: '王晓军', position: '球员通道安保主管', phone: '138 9988 7766', backupPhone: null },
      { name: '张立群', position: '机动巡逻组组长', phone: '137 1100 2233', backupPhone: '136 5544 3322' },
      { name: '周丽娜', position: '球队联络官', phone: '135 9988 7766', backupPhone: null }
    ],
    relatedMatches: ['m17', 'm18', 'm66', 'm67']
  },
  {
    id: 'p10',
    title: '贵宾区疑似可疑物品排查处置',
    category: '安保',
    severity: 'high',
    triggerCondition: '贵宾包厢、主席台或商务贵宾区发现无主背包、手提袋、纸箱等可疑物品，无人认领且外观异常或有可疑粉末/液体痕迹。',
    slaMinutes: 2,
    steps: [
      { id: 's1', role: '发现人（服务员/安保）', action: '不要触碰任何物品，立即撤离并封锁该区域，报告指挥中心', expectedMinutes: 0.5 },
      { id: 's2', role: '安保队长', action: '调动防爆安检组携带排爆装备前往，疏散同区域VIP人员至安全区', expectedMinutes: 3 },
      { id: 's3', role: '防爆安检组', action: '使用X光机、金属探测器、搜爆犬进行非接触式初检', expectedMinutes: 8, toolTip: '确认安全前严禁开箱、翻包、移动可疑物品' },
      { id: 's4', role: '驻场公安/特警', action: '如需开检由专业排爆人员操作，排除爆炸物或危险品风险', expectedMinutes: 12 },
      { id: 's5', role: 'VIP接待主管', action: '安抚贵宾情绪，提供临时休息区和饮品，说明情况但不夸大', expectedMinutes: 5 },
      { id: 's6', role: '安保档案员', action: '调取监控排查遗留人，记录处置全过程存档', expectedMinutes: 10 }
    ],
    contacts: [
      { name: '冯志刚', position: '防爆安检组组长', phone: '138 7700 1122', backupPhone: '139 5566 7788' },
      { name: '魏东', position: '驻场特警分队长', phone: '137 2211 0099', backupPhone: null },
      { name: '苏雅婷', position: 'VIP接待主管', phone: '136 3322 1144', backupPhone: null },
      { name: '马文斌', position: '安保情报分析师', phone: '135 6677 8899', backupPhone: null }
    ],
    relatedMatches: ['m19', 'm20', 'm68', 'm69', 'm70']
  },
  {
    id: 'p11',
    title: '赛后球迷聚集围堵球队大巴处置',
    category: '安保',
    severity: 'medium',
    triggerCondition: '比赛结束后大量球迷在球队大巴停靠区聚集围堵，试图围堵球员、要求签名，或因输球情绪激动出现拍打车窗、辱骂球员等行为，影响球队正常离场。',
    slaMinutes: 5,
    steps: [
      { id: 's1', role: '大巴区安保岗', action: '观察聚集规模，超过20人或出现过激行为立即报告指挥中心', expectedMinutes: 1 },
      { id: 's2', role: '安保队长', action: '增派大巴区安保力量，设置人墙和警戒带，预留球队撤离通道', expectedMinutes: 4 },
      { id: 's3', role: '现场指挥中心', action: '协调球队推迟离场10-15分钟，或启用备用出口和备用大巴', expectedMinutes: 2 },
      { id: 's4', role: '安保疏导组', action: '对围堵球迷进行劝离，重点引导未成年人和女性球迷离开', expectedMinutes: 8, toolTip: '避免与情绪激动球迷发生正面冲突，优先疏散核心人群' },
      { id: 's5', role: '安保室', action: '对持续挑衅、损坏车辆的人员强制带离，移交公安机关', expectedMinutes: 12 }
    ],
    contacts: [
      { name: '韩雪峰', position: '球队离场安保负责人', phone: '138 6699 0011', backupPhone: null },
      { name: '邓伟明', position: '外围疏导组组长', phone: '139 4455 6677', backupPhone: '137 2233 4455' },
      { name: '曹文轩', position: '公安联勤联络员', phone: '136 8877 6655', backupPhone: null }
    ],
    relatedMatches: ['m21', 'm22', 'm71', 'm72']
  },
  {
    id: 'p12',
    title: '安保人员发现持假票观众强行入场处置',
    category: '安保',
    severity: 'low',
    triggerCondition: '检票口或门禁系统识别出伪造门票、过期门票、无票人员，当事人拒不听劝、情绪激动强行闯闸机或翻越围栏入场。',
    slaMinutes: 3,
    steps: [
      { id: 's1', role: '检票口检票员', action: '立即关闭闸机通道，呼叫就近安保员前来增援', expectedMinutes: 0.5 },
      { id: 's2', role: '检票区安保员', action: '拦截当事人，带至一边进行核查，避免堵住检票通道', expectedMinutes: 2 },
      { id: 's3', role: '安保核查员', action: '使用验票系统核验门票真伪，调取购票人身份信息比对', expectedMinutes: 3 },
      { id: 's4', role: '安保主管', action: '初犯且认错态度好：批评教育后劝离；态度恶劣或累犯：移交公安机关', expectedMinutes: 5 },
      { id: 's5', role: '票务组', action: '汇总假票信息，向公安机关报案，追查假票制作和销售链条', expectedMinutes: 20 }
    ],
    contacts: [
      { name: '彭海涛', position: '检票区安保主管', phone: '138 5588 9900', backupPhone: null },
      { name: '曾祥瑞', position: '票务系统管理员', phone: '137 3344 5566', backupPhone: '136 7788 9900' },
      { name: '肖博文', position: '驻场警务室民警', phone: '139 1122 3344', backupPhone: null }
    ],
    relatedMatches: ['m23', 'm24', 'm73', 'm74', 'm75']
  },
  {
    id: 'p13',
    title: '场馆餐饮后厨油烟管起火与烟感报警处置',
    category: '消防',
    severity: 'medium',
    triggerCondition: '场馆餐饮区后厨油烟管道因油垢堆积遇高温起火，烟感探测器报警，或工作人员发现烟道有冒烟、明火窜出，伴有烧焦异味。',
    slaMinutes: 2,
    steps: [
      { id: 's1', role: '后厨员工', action: '立即关闭燃气总阀和排油烟风机，切勿用水扑救油类火灾', expectedMinutes: 0.5, toolTip: '油锅火灾用锅盖或灭火毯覆盖，严禁泼水' },
      { id: 's2', role: '后厨负责人', action: '按下手动报警按钮，通过对讲机报告消防控制中心和后厨区域位置', expectedMinutes: 0.5 },
      { id: 's3', role: '消防控制中心', action: '确认报警位置，启动厨房自动灭火系统，联动排烟风机', expectedMinutes: 1 },
      { id: 's4', role: '场馆专职消防队', action: '携带灭火器和灭火毯3分钟内到达现场扑救烟道余火', expectedMinutes: 3 },
      { id: 's5', role: '安保组', action: '疏散餐饮区就餐观众，封锁后厨入口防止无关人员进入', expectedMinutes: 4 },
      { id: 's6', role: '消防维保组', action: '火灭后清洗烟道，检查设备损坏，确认安全后24小时可恢复营业', expectedMinutes: 30 }
    ],
    contacts: [
      { name: '陈永明', position: '消防控制中心值班长', phone: '138 0099 8877', backupPhone: '136 1122 3344' },
      { name: '周国栋', position: '场馆专职消防队长', phone: '139 5566 7788', backupPhone: null },
      { name: '王建国', position: '餐饮区后厨负责人', phone: '137 2233 4455', backupPhone: null }
    ],
    relatedMatches: ['m25', 'm26', 'm76', 'm77']
  },
  {
    id: 'p14',
    title: '观众席烟头引燃座椅阴燃处置流程',
    category: '消防',
    severity: 'high',
    triggerCondition: '观众违规携带并在禁烟区吸烟，未熄灭的烟头掉入座椅缝隙引燃座套海绵，出现局部冒烟、焦糊味、座椅阴燃但尚未形成明火。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '发现人（观众/保洁/安保）', action: '立即告知就近安保员，不要自行随意翻动座椅', expectedMinutes: 0.3 },
      { id: 's2', role: '区域安保员', action: '携带灭火器到达，疏散该区域前后3排观众，设置警戒区域', expectedMinutes: 1 },
      { id: 's3', role: '安保员', action: '拆除阴燃座椅座套，用水浇灭或灭火器扑灭阴燃部位', expectedMinutes: 2, toolTip: '海绵阴燃深入内部，必须彻底拆解确认无复燃隐患' },
      { id: 's4', role: '消防控制中心', action: '密切关注该区域烟感状态，必要时启动区域排烟', expectedMinutes: 1 },
      { id: 's5', role: '保洁组', action: '清理现场灰烬和积水，更换受损座椅，安排禁烟巡查加强', expectedMinutes: 10 },
      { id: 's6', role: '安保稽查组', action: '调取监控锁定吸烟者，依法处以罚款并移交公安机关', expectedMinutes: 15 }
    ],
    contacts: [
      { name: '林海峰', position: '观众席区域安保主管', phone: '138 1144 7700', backupPhone: null },
      { name: '何志强', position: '消防控制中心值班员', phone: '139 2255 8811', backupPhone: '137 3366 9922' },
      { name: '马晓东', position: '保洁组组长', phone: '136 4477 0033', backupPhone: null }
    ],
    relatedMatches: ['m27', 'm28', 'm78', 'm79', 'm80']
  },
  {
    id: 'p15',
    title: '设备间配电柜过载冒烟处置预案',
    category: '消防',
    severity: 'high',
    triggerCondition: '比赛期间设备间配电柜因大功率设备同时运行导致过载，配电柜冒出刺鼻白烟、伴有焦糊味，空开频繁跳闸或发出异常嗡嗡声。',
    slaMinutes: 2,
    steps: [
      { id: 's1', role: '巡检电工', action: '立即切断该配电柜上级总电源开关，切勿直接接触冒烟部位', expectedMinutes: 0.5, toolTip: '断电前确认断电范围，避免误切比赛核心设备电源' },
      { id: 's2', role: '电工班长', action: '报告消防控制中心和指挥中心，通知技术组切换备用供电回路', expectedMinutes: 1 },
      { id: 's3', role: '场馆专职消防队', action: '携带CO2和干粉灭火器到达设备间，做好灭火准备，强制通风排烟', expectedMinutes: 3 },
      { id: 's4', role: '强电工程师', action: '使用红外测温仪排查过载原因，更换烧毁的空开和线路', expectedMinutes: 10 },
      { id: 's5', role: '技术保障组', action: '恢复关键设备供电，确认比赛设备（记分牌、计时器、音响）运行正常', expectedMinutes: 5 },
      { id: 's6', role: '维保组', action: '事后排查全馆配电柜负载情况，升级容量，避免再次过载', expectedMinutes: 60 }
    ],
    contacts: [
      { name: '徐鹏飞', position: '强电工程师', phone: '138 0077 8899', backupPhone: '139 4455 6677' },
      { name: '罗晓峰', position: '电工班长', phone: '137 1122 3344', backupPhone: null },
      { name: '梁文博', position: '专职消防处置员', phone: '136 5566 7788', backupPhone: null }
    ],
    relatedMatches: ['m29', 'm30', 'm81', 'm82']
  },
  {
    id: 'p16',
    title: '地下室仓库纸箱起火喷淋启动处置',
    category: '消防',
    severity: 'medium',
    triggerCondition: '地下室物资仓库内因电气短路、自燃或违规吸烟引燃堆放的纸箱、纸质宣传物料等可燃物，烟感报警触发，自动喷淋系统启动喷水。',
    slaMinutes: 3,
    steps: [
      { id: 's1', role: '消防控制中心', action: '收到报警和喷淋动作信号，立即通知值班长和专职消防队', expectedMinutes: 0.3 },
      { id: 's2', role: '专职消防队', action: '佩戴呼吸器进入地下室，确认火情大小，关闭防火门隔离区域', expectedMinutes: 3 },
      { id: 's3', role: '消防队', action: '如火势被喷淋控制，辅助灭火；如有蔓延趋势出枪扑救', expectedMinutes: 5, toolTip: '地下室注意防烟和窒息，必须双人以上进入' },
      { id: 's4', role: '安保组', action: '封锁地下室各出入口，引导无关人员撤离，清点仓库值班人员', expectedMinutes: 4 },
      { id: 's5', role: '物业工程组', action: '火灾扑灭后关停喷淋系统，排水清理，除湿防霉，防止物资二次受损', expectedMinutes: 40 },
      { id: 's6', role: '消防主管部门', action: '配合火灾调查，提交监控和巡检记录，整改安全隐患', expectedMinutes: 120 }
    ],
    contacts: [
      { name: '宋雨辰', position: '物业工程主管', phone: '138 2299 0011', backupPhone: null },
      { name: '唐建华', position: '消防维保工程师', phone: '139 6677 8899', backupPhone: '137 4455 6677' },
      { name: '许立军', position: '安保副队长（地下区域）', phone: '136 8899 0011', backupPhone: null }
    ],
    relatedMatches: ['m31', 'm32', 'm83', 'm84', 'm85']
  },
  {
    id: 'p17',
    title: '烟花表演火星点燃顶棚横幅处置',
    category: '消防',
    severity: 'high',
    triggerCondition: '开幕式、中场表演或赛后庆祝活动燃放烟花，火星飘落引燃场馆顶棚悬挂的宣传横幅、旗帜或装饰织物，出现明火和冒烟。',
    slaMinutes: 1,
    steps: [
      { id: 's1', role: '烟花现场安全员', action: '立即停止烟花燃放，通过对讲机紧急通知消防中心和全场', expectedMinutes: 0.2 },
      { id: 's2', role: '消防控制中心', action: '启动顶部排烟系统，通知所有消防岗位进入戒备状态', expectedMinutes: 0.5 },
      { id: 's3', role: '专职消防队', action: '使用登高车或室内消防水炮对准燃烧部位喷水灭火', expectedMinutes: 4 },
      { id: 's4', role: '高空作业组', action: '火灭后取下烧毁横幅，清理顶棚残留易燃装饰物', expectedMinutes: 15 },
      { id: 's5', role: '现场指挥中心', action: '如火星有掉落观众席风险，立即广播通知观众低头保护', expectedMinutes: 0.5 },
      { id: 's6', role: '活动策划组', action: '复盘烟花距离和角度，后续活动增加防火安全距离和阻燃措施', expectedMinutes: 30 }
    ],
    contacts: [
      { name: '韩雪峰', position: '烟花表演安全负责人', phone: '138 1100 9988', backupPhone: null },
      { name: '冯志刚', position: '专职消防队水炮组', phone: '139 3322 1100', backupPhone: '137 5544 3322' },
      { name: '邓伟明', position: '高空作业组组长', phone: '136 7766 5544', backupPhone: null }
    ],
    relatedMatches: ['m33', 'm34', 'm86', 'm87']
  },
  {
    id: 'p18',
    title: '消防警报误报全馆疏散解除流程',
    category: '消防',
    severity: 'low',
    triggerCondition: '消防控制中心收到全馆性火灾警报，但多区域巡检人员确认无火情、无烟雾、无热源，判断为系统误报或测试触发，需按规范解除警报。',
    slaMinutes: 5,
    steps: [
      { id: 's1', role: '消防控制中心值班长', action: '立即查看报警点位分布，同步通知指挥中心和安保队长', expectedMinutes: 0.5 },
      { id: 's2', role: '巡检确认组', action: '按报警分区派人现场确认，拍照片和视频传回控制中心', expectedMinutes: 3 },
      { id: 's3', role: '现场指挥中心', action: '如已启动疏散广播，追加临时通知"正在核实请保持冷静"', expectedMinutes: 1 },
      { id: 's4', role: '消防维保工程师', action: '现场确认无误报后，在主机上复位并消音，记录误报点位和原因', expectedMinutes: 2 },
      { id: 's5', role: '指挥中心', action: '发布解除警报通知，通过MC和公告告知观众系统误报，比赛正常进行', expectedMinutes: 2 },
      { id: 's6', role: '安保组', action: '对已疏散观众进行有序引导返回座位，安抚情绪', expectedMinutes: 10 }
    ],
    contacts: [
      { name: '黄俊杰', position: '消防控制中心值班长', phone: '138 4400 1122', backupPhone: null },
      { name: '朱国平', position: '消防维保工程师', phone: '139 7788 9900', backupPhone: '137 2211 0033' },
      { name: '林海峰', position: '观众安抚组（安保）', phone: '136 3344 5566', backupPhone: null }
    ],
    relatedMatches: ['m35', 'm36', 'm88', 'm89', 'm90']
  },
  {
    id: 'p19',
    title: '赛事进行中雷暴警报与停电风险处置',
    category: '天气',
    severity: 'high',
    triggerCondition: '比赛期间收到气象部门雷暴橙色以上预警，场馆附近出现雷电，或市电供电不稳、有临时停电风险，可能影响比赛和观众安全。',
    slaMinutes: 5,
    steps: [
      { id: 's1', role: '现场指挥中心', action: '收到气象预警后立即召开3分钟紧急会议，评估是否暂停比赛', expectedMinutes: 2 },
      { id: 's2', role: '电力保障组', action: '检查UPS和应急发电机状态，确保核心设备、应急照明、广播系统电源可靠', expectedMinutes: 3 },
      { id: 's3', role: '当值裁判长', action: '根据指挥中心建议宣布暂停比赛，引导球员有序返回更衣室', expectedMinutes: 1 },
      { id: 's4', role: '安保+广播', action: '通过广播提醒观众保持座位就坐，不要在过道、出入口聚集避雨', expectedMinutes: 1 },
      { id: 's5', role: '外围安保', action: '检查场馆周边户外广告牌、临时围挡、顶棚悬挂物紧固情况', expectedMinutes: 8 },
      { id: 's6', role: '指挥中心', action: '雷暴过境后确认安全，通知裁判长恢复比赛，发布延期公告或择日重赛通知', expectedMinutes: 5 }
    ],
    contacts: [
      { name: '刘文华', position: '现场总指挥', phone: '138 0011 9988', backupPhone: '139 2233 7766' },
      { name: '赵文博', position: '电力保障组长', phone: '137 4455 6677', backupPhone: null },
      { name: '孙浩然', position: '裁判长联络官', phone: '136 8899 0011', backupPhone: null },
      { name: '周德海', position: '气象台预警对接人', phone: '135 2211 0099', backupPhone: null }
    ],
    relatedMatches: ['m37', 'm38', 'm91', 'm92']
  },
  {
    id: 'p20',
    title: '高温高湿天气球员补水与急救点设置',
    category: '天气',
    severity: 'medium',
    triggerCondition: '夏季赛事期间场馆室内温度超过30度、湿度超过70%，或室外公开训练时体感温度超过35度，球员出现中暑和抽筋风险显著升高。',
    slaMinutes: 10,
    steps: [
      { id: 's1', role: '赛事医务总监', action: '赛前24小时评估天气预报，启动高温应急预案，增设场边冰桶和降温喷雾', expectedMinutes: 5 },
      { id: 's2', role: '场馆运营组', action: '赛前2小时开启全场空调强冷模式，确保比赛区域温度控制在26度以下', expectedMinutes: 15, toolTip: '开赛前30分钟适当提高温度避免球员感冒' },
      { id: 's3', role: '球队装备师', action: '替补席配置4箱以上冰饮用水、运动饮料、冰毛巾和降温背心', expectedMinutes: 5 },
      { id: 's4', role: '医务组', action: '场边设置中暑急救点，准备冰袋、降温毯、电解质输液，专人观察替补席球员状态', expectedMinutes: 3 },
      { id: 's5', role: '裁判长', action: '在每节官方暂停基础上增加1次补水暂停（每节中间）', expectedMinutes: 2 },
      { id: 's6', role: '保洁组', action: '观众区增设饮水点，湿滑区域及时拖地，防止观众滑倒', expectedMinutes: 10 }
    ],
    contacts: [
      { name: '吴建军', position: '赛事医务总监', phone: '138 6677 0011', backupPhone: null },
      { name: '郑远航', position: '场馆空调运维工程师', phone: '139 8899 2233', backupPhone: '137 3322 1144' },
      { name: '冯志远', position: '裁判长助理', phone: '136 5544 3322', backupPhone: null }
    ],
    relatedMatches: ['m39', 'm40', 'm93', 'm94', 'm95']
  },
  {
    id: 'p21',
    title: '台风登陆预警赛事提前中止流程',
    category: '天气',
    severity: 'medium',
    triggerCondition: '比赛当日或次日发布台风黄色以上预警，预计赛事期间12小时内有强风暴雨，可能威胁观众返程安全和场馆结构安全。',
    slaMinutes: 30,
    steps: [
      { id: 's1', role: '赛事总监', action: '联合气象、应急、场馆、公安召开紧急会商，形成中止/延期决议', expectedMinutes: 20 },
      { id: 's2', role: '赛事新闻官', action: '通过官方公众号、短信、现场MC同步发布中止公告，说明后续安排', expectedMinutes: 3 },
      { id: 's3', role: '裁判长', action: '按规则裁定比赛结果：已过半场有效，未过半场择日重赛', expectedMinutes: 5 },
      { id: 's4', role: '安保大队', action: '提前1小时打开全部出入口，组织观众分批次有序离场，避免集中拥堵', expectedMinutes: 25, toolTip: '广播提示观众避开低洼积水路段和广告牌区域' },
      { id: 's5', role: '票务组', action: '开启退票和换票通道，观众凭票根或电子票7日内办理', expectedMinutes: 60 },
      { id: 's6', role: '物业工程组', action: '关紧门窗，加固户外设施，沙包封堵地下室和地下车库入口防涝', expectedMinutes: 60 }
    ],
    contacts: [
      { name: '王建国', position: '赛事总监', phone: '138 0022 8899', backupPhone: '139 5566 7788' },
      { name: '陈志明', position: '赛事新闻发言人', phone: '137 2244 6688', backupPhone: null },
      { name: '李晓光', position: '场馆物业总经理', phone: '136 8800 1122', backupPhone: null }
    ],
    relatedMatches: ['m41', 'm42', 'm96', 'm97']
  },
  {
    id: 'p22',
    title: '暴雨球迷进场雨伞滴水湿滑处置',
    category: '天气',
    severity: 'low',
    triggerCondition: '比赛当日遇中到大雨，观众进场时雨伞带入大量雨水造成前厅、通道、台阶地面湿滑，已有观众滑倒案例或滑倒风险极高。',
    slaMinutes: 10,
    steps: [
      { id: 's1', role: '前厅经理', action: '启动雨天预案，在检票口外发放雨伞袋，设置临时雨伞套机', expectedMinutes: 5 },
      { id: 's2', role: '保洁组', action: '各通道铺设防滑地毯，放置"小心地滑"警示牌，增派人员用干拖布巡回拖地', expectedMinutes: 5, toolTip: '楼梯、卫生间门口、电梯间等高风险区域重点铺设' },
      { id: 's3', role: '安保组', action: '检票口安排专人提醒观众收伞、套袋，湿雨伞不要带入观众席', expectedMinutes: 2 },
      { id: 's4', role: '医务组', action: '前厅设置擦伤处置点，准备碘伏、创可贴、绷带处理滑倒擦伤', expectedMinutes: 3 },
      { id: 's5', role: '物业工程组', action: '检查屋顶和窗户漏水点，用容器接水并放置警示标识', expectedMinutes: 10 }
    ],
    contacts: [
      { name: '张磊', position: '前厅服务经理', phone: '138 5599 8877', backupPhone: null },
      { name: '李晓光', position: '保洁公司主管', phone: '139 1155 6677', backupPhone: '137 2266 7788' },
      { name: '王建国', position: '物业维修组', phone: '136 3377 8899', backupPhone: null }
    ],
    relatedMatches: ['m43', 'm44', 'm98', 'm99', 'm100']
  },
  {
    id: 'p23',
    title: '冰雹大风场馆外部悬挂物坠落防范',
    category: '天气',
    severity: 'high',
    triggerCondition: '气象部门发布冰雹橙色预警和大风蓝色以上预警，预计有8级以上阵风并伴随冰雹，可能造成场馆户外广告、顶棚构件、高空装饰物坠落伤人。',
    slaMinutes: 15,
    steps: [
      { id: 's1', role: '物业安全主管', action: '立即停止一切户外作业，召回户外工作人员进入室内', expectedMinutes: 2 },
      { id: 's2', role: '安保大队', action: '封锁场馆外围所有临边区域、幕墙下方、广告牌下方通道，设置警戒带', expectedMinutes: 5 },
      { id: 's3', role: '工程抢修组', action: '如有可能，临时拆除或加固易坠落的旗帜、条幅、灯箱等悬挂物', expectedMinutes: 10, toolTip: '严禁在大风期间登高作业，可从底部剪断悬挂绳索' },
      { id: 's4', role: '指挥中心', action: '广播提醒靠近窗户观众远离幕墙，关闭靠窗高区观众席部分座位', expectedMinutes: 1 },
      { id: 's5', role: '指挥中心', action: '冰雹大风结束后，派工程人员全面检查外墙、幕墙、屋顶，确认安全后解除封锁', expectedMinutes: 20 }
    ],
    contacts: [
      { name: '李铁刚', position: '安保大队长（外围封锁）', phone: '138 6600 7788', backupPhone: '139 8811 9900' },
      { name: '徐鹏飞', position: '物业安全主管', phone: '137 2233 4455', backupPhone: null },
      { name: '罗晓峰', position: '高空抢修组组长', phone: '136 4455 6677', backupPhone: null }
    ],
    relatedMatches: ['m45', 'm46', 'm101', 'm102']
  },
  {
    id: 'p24',
    title: '寒潮低温球员更衣室供暖故障处置',
    category: '天气',
    severity: 'medium',
    triggerCondition: '冬季赛事期间球员更衣室、热身区供暖系统突发故障，室内温度低于15度，球员赛前热身和赛后更衣有感冒和肌肉僵硬受伤风险。',
    slaMinutes: 15,
    steps: [
      { id: 's1', role: '球队联络官', action: '第一时间报告指挥中心和场馆运维组，同步告知双方球队', expectedMinutes: 1 },
      { id: 's2', role: '暖通工程师', action: '排查供暖故障原因，切换备用锅炉或备用供暖回路', expectedMinutes: 10 },
      { id: 's3', role: '场馆运维组', action: '向每个更衣室配送电暖风机、暖风机油汀，临时提升温度', expectedMinutes: 5 },
      { id: 's4', role: '后勤保障组', action: '为球员提供姜茶、热饮、保温毯、暖宝宝贴', expectedMinutes: 3 },
      { id: 's5', role: '裁判长', action: '适当延长热身时间，中场休息时检查球员身体状态', expectedMinutes: 2 },
      { id: 's6', role: '暖通维保组', action: '赛后彻底检修供暖系统，排查冻裂管道风险，48小时内恢复正常', expectedMinutes: 180 }
    ],
    contacts: [
      { name: '黄俊杰', position: '暖通高级工程师', phone: '138 2211 5566', backupPhone: null },
      { name: '朱国平', position: '后勤保障主管', phone: '139 8877 4455', backupPhone: '137 3344 2211' },
      { name: '林海峰', position: '球队服务联络官', phone: '136 9900 1122', backupPhone: null }
    ],
    relatedMatches: ['m47', 'm48', 'm103', 'm104', 'm105']
  },
  {
    id: 'p25',
    title: '比赛24秒计时器故障3分钟切换备用',
    category: '设备故障',
    severity: 'medium',
    triggerCondition: '比赛中24秒进攻计时器突然黑屏、数字乱跳、无法归零或倒计时停止，经记录台技术人员简单操作无法恢复，需切换备用计时器。',
    slaMinutes: 3,
    steps: [
      { id: 's1', role: '记录台24秒操作员', action: '立即按下暂停按钮，举手示意裁判和技术代表', expectedMinutes: 0.2 },
      { id: 's2', role: 'FIBA技术代表', action: '确认计时器故障，暂停比赛，通知现场技术保障组', expectedMinutes: 0.5 },
      { id: 's3', role: '现场技术保障组', action: '携带备用24秒计时器和线缆到场，2分钟内完成硬件切换和信号同步', expectedMinutes: 2, toolTip: '切换前记录当前剩余秒数，恢复后设置为相同数值' },
      { id: 's4', role: '技术代表+主裁判', action: '确认备用设备显示正确，与记录台核对剩余进攻时间，宣布恢复比赛', expectedMinutes: 0.5 },
      { id: 's5', role: '技术保障组', action: '比赛间隙排查主计时器故障原因，中场休息时修复主设备', expectedMinutes: 10 },
      { id: 's6', role: '记录台', action: '赛后提交设备故障报告，技术部安排全面检修', expectedMinutes: 8 }
    ],
    contacts: [
      { name: '陈志明', position: 'FIBA技术代表', phone: '138 1100 2255', backupPhone: null },
      { name: '刘文华', position: '现场技术保障组长', phone: '139 5544 3322', backupPhone: '137 8877 6655' },
      { name: '赵文博', position: '记录台主管', phone: '136 2211 0099', backupPhone: null }
    ],
    relatedMatches: ['m49', 'm50', 'm106', 'm107']
  },
  {
    id: 'p26',
    title: '场馆中央LED大屏黑屏故障处置',
    category: '设备故障',
    severity: 'high',
    triggerCondition: '比赛进行中或中场表演时，场馆中央斗型LED大屏、环廊屏突发全屏黑屏、画面卡死或信号中断，影响观众观赛体验和赛事信息发布。',
    slaMinutes: 5,
    steps: [
      { id: 's1', role: '大屏控制室操作员', action: '立即重启播放服务器和发送卡，同时报告技术组长', expectedMinutes: 1 },
      { id: 's2', role: '技术保障组长', action: '判断故障等级：软件问题继续排查，硬件问题立即切换备用信号源', expectedMinutes: 2 },
      { id: 's3', role: 'MC+现场指挥', action: '通过解说和音响系统安抚观众，说明大屏临时故障，引导关注场边辅助记分牌', expectedMinutes: 1 },
      { id: 's4', role: 'LED工程师', action: '切换备用控制器和光纤链路，优先恢复比分信息和24秒显示', expectedMinutes: 5, toolTip: '分模块恢复：先比分→慢动作回放→广告画面→全功能' },
      { id: 's5', role: '技术保障组', action: '如无法中场前恢复，赛后评估是否延迟下一场比赛开赛时间', expectedMinutes: 10 },
      { id: 's6', role: 'LED厂商驻场', action: '连夜排查电源模块、接收卡、光纤传输，确保次日比赛前恢复', expectedMinutes: 180 }
    ],
    contacts: [
      { name: '孙浩然', position: 'LED大屏高级工程师', phone: '138 3377 6655', backupPhone: '139 8855 4433' },
      { name: '周德海', position: '大屏控制室值班长', phone: '137 2244 6688', backupPhone: null },
      { name: '吴建军', position: '赛事MC兼主持人', phone: '136 5511 0022', backupPhone: null }
    ],
    relatedMatches: ['m51', 'm52', 'm108', 'm109', 'm110']
  },
  {
    id: 'p27',
    title: '音响系统中断国歌与MC播报处置',
    category: '设备故障',
    severity: 'high',
    triggerCondition: '升旗仪式奏国歌环节、球员入场播报或MC解说时，场馆主音响系统突然无声、严重杂音或中断，国歌无法正常播放。',
    slaMinutes: 2,
    steps: [
      { id: 's1', role: '音响控制室调音师', action: '立即切换备用功放和备用音源，检查无线话筒频道是否冲突', expectedMinutes: 0.5 },
      { id: 's2', role: '技术组长', action: '如国歌环节中断，立即启用备用国歌U盘+备用音频链路', expectedMinutes: 1, toolTip: '国歌中断超过3秒应重新播放完整版，不可从中断点接续' },
      { id: 's3', role: '现场指挥中心', action: '全场观众已起立唱国歌时，引导继续清唱，维持仪式庄重感', expectedMinutes: 0.5 },
      { id: 's4', role: 'MC', action: '手持备用有线话筒，用浑厚嗓音直接口播播报球员入场名单', expectedMinutes: 2 },
      { id: 's5', role: '音响工程师', action: '排查根因：功放烧毁/话筒干扰/传输线路/矩阵切换器', expectedMinutes: 10 },
      { id: 's6', role: '技术部', action: '赛后升级备份音响系统，增加双备份话筒和双功放配置', expectedMinutes: 120 }
    ],
    contacts: [
      { name: '郑远航', position: '主音响师', phone: '138 9922 3344', backupPhone: null },
      { name: '冯志远', position: 'MC兼播音员', phone: '139 5566 7788', backupPhone: '137 2233 4455' },
      { name: '黄俊杰', position: '音频系统工程师', phone: '136 8800 9911', backupPhone: null }
    ],
    relatedMatches: ['m53', 'm54', 'm111', 'm112']
  },
  {
    id: 'p28',
    title: '记录台记分牌电脑死机重启流程',
    category: '设备故障',
    severity: 'low',
    triggerCondition: '记录台运行记分系统的主控电脑突然蓝屏、死机或程序无响应，比分数据、节次、犯规次数暂无法更新显示。',
    slaMinutes: 3,
    steps: [
      { id: 's1', role: '记录台操作主管', action: '立即手动备份当前记分数据（拍照+纸质记录），通知技术代表和裁判', expectedMinutes: 0.5 },
      { id: 's2', role: '技术保障组', action: '强制重启主控电脑，如启动失败立即切换备用笔记本登录同一系统', expectedMinutes: 2, toolTip: '所有记分数据实时同步云端，备用机登录后自动恢复最近快照' },
      { id: 's3', role: '记录台工作人员', action: '使用翻分牌和纸质记录表临时人工记分，确保比赛不中断', expectedMinutes: 1 },
      { id: 's4', role: '技术代表', action: '系统恢复后与记录台逐项核对比分、犯规、暂停次数，确认无误', expectedMinutes: 1 },
      { id: 's5', role: 'IT支持组', action: '赛后检查电脑硬盘和系统日志，查杀病毒，升级硬件配置', expectedMinutes: 30 }
    ],
    contacts: [
      { name: '朱国平', position: '记录台操作主管', phone: '138 5500 1122', backupPhone: null },
      { name: '林海峰', position: 'IT驻场工程师', phone: '139 1188 2233', backupPhone: '137 2299 3344' },
      { name: '何志强', position: 'FIBA技术代表助理', phone: '136 3344 5566', backupPhone: null }
    ],
    relatedMatches: ['m55', 'm56', 'm113', 'm114', 'm115']
  },
  {
    id: 'p29',
    title: '直播机位与慢动作回放设备中断处置',
    category: '设备故障',
    severity: 'medium',
    triggerCondition: '电视直播或网络直播过程中，主机位画面中断、慢动作回放服务器死机，裁判回看挑战功能无法使用，直播信号出现黑屏或彩条。',
    slaMinutes: 4,
    steps: [
      { id: 's1', role: '直播导播', action: '立即切备用机位画面，插播备用VCR或广告垫片，同时告知技术保障组', expectedMinutes: 0.5 },
      { id: 's2', role: '电视转播技术主管', action: '排查主机位摄像机、光纤传输、切换器故障点，优先恢复主直播信号', expectedMinutes: 2 },
      { id: 's3', role: '慢动作回放操作员', action: '重启回放服务器或切换备用回放工作站，同步保存已录制素材', expectedMinutes: 3, toolTip: '裁判回看期间回放不可用，与技术代表协商使用记录台录像代替' },
      { id: 's4', role: '裁判员+技术代表', action: '如挑战期间无法回放，由3名临场裁判合议后做出最终判罚', expectedMinutes: 2 },
      { id: 's5', role: '转播公司负责人', action: '赛后出具转播事故报告，直播平台按合同条款处理赔付事宜', expectedMinutes: 60 }
    ],
    contacts: [
      { name: '马晓东', position: '电视转播技术主管', phone: '138 7700 8899', backupPhone: null },
      { name: '徐鹏飞', position: '直播导播', phone: '139 3344 5566', backupPhone: '137 8899 0011' },
      { name: '罗晓峰', position: '慢动作回放操作员', phone: '136 1122 3344', backupPhone: null },
      { name: '梁文博', position: '主裁联络助理', phone: '135 4455 6677', backupPhone: null }
    ],
    relatedMatches: ['m57', 'm58', 'm116', 'm117']
  },
  {
    id: 'p30',
    title: '场馆空调机组故障比赛环境过热处置',
    category: '设备故障',
    severity: 'medium',
    triggerCondition: '比赛期间场馆主空调机组突发故障停机，比赛区域温度30分钟内上升至30度以上，球员出现大量出汗、呼吸加快，观众体感不适。',
    slaMinutes: 10,
    steps: [
      { id: 's1', role: '暖通运行值班员', action: '立即查看机组报警代码，尝试远程复位重启，失败则通知工程师到场', expectedMinutes: 2 },
      { id: 's2', role: '暖通工程师', action: '判断故障类型：压缩机过载/冷媒泄漏/冷却塔缺水/电路板烧毁', expectedMinutes: 5 },
      { id: 's3', role: '场馆运维组', action: '临时开启所有排烟风机、新风机进行强制通风换气，观众席增配工业大风扇', expectedMinutes: 5 },
      { id: 's4', role: '球队服务组', action: '替补席增加冰桶、冰毛巾、降温喷雾，球员暂停时用物理降温', expectedMinutes: 2 },
      { id: 's5', role: '裁判长+医务总监', action: '如室内温度超过34度，评估球员身体状态，必要时宣布暂停或延期', expectedMinutes: 3 },
      { id: 's6', role: '暖通维保组', action: '连夜抢修，次日比赛前无法修复则租用临时工业空调机组', expectedMinutes: 240 }
    ],
    contacts: [
      { name: '宋雨辰', position: '暖通运行主管', phone: '138 0099 6655', backupPhone: null },
      { name: '唐建华', position: '高级暖通工程师', phone: '139 4455 7788', backupPhone: '137 2266 8899' },
      { name: '许立军', position: '场馆运维经理', phone: '136 8877 6655', backupPhone: null }
    ],
    relatedMatches: ['m59', 'm60', 'm118', 'm119', 'm120']
  }
]

export const LOGS = [
  { id: 'l1', incidentId: 'i1', time: '20:14', actor: '36号裁判', action: '突破中球员崴脚倒地，吹停比赛示意医疗进场', status: 'warn' },
  { id: 'l2', incidentId: 'i1', time: '20:14', actor: '王医生（主队队医）', action: '场边检查踝关节，排除骨折，压痛剧烈+肿胀', status: 'info' },
  { id: 'l3', incidentId: 'i1', time: '20:16', actor: '场馆医务主管', action: '冰袋冷敷+加压绷带包扎，RICE处置完成', status: 'ok' },
  { id: 'l4', incidentId: 'i1', time: '20:18', actor: '主教练杜锋', action: '决定换人，12号球员替下受伤球员', status: 'info' },
  { id: 'l5', incidentId: 'i1', time: '22:05', actor: '队医王明辉', action: '赛后跟进，安排明日核磁共振检查', status: 'ok' },
  { id: 'l6', incidentId: 'i2', time: '21:33', actor: '安保员李刚', action: 'A区3层看台双方球迷互掷饮料杯，请求增援', status: 'danger' },
  { id: 'l7', incidentId: 'i2', time: '21:33', actor: '安保队长李铁刚', action: '调动预备队15人携带盾牌防暴叉前往', status: 'warn' },
  { id: 'l8', incidentId: 'i2', time: '21:34', actor: '指挥中心广播', action: '全场广播警告：再次挑衅将被立即带离并处罚', status: 'warn' },
  { id: 'l9', incidentId: 'i2', time: '21:36', actor: '防暴组赵磊', action: '成功隔离冲突双方，带离挑事者8人', status: 'ok' },
  { id: 'l10', incidentId: 'i2', time: '21:55', actor: '辖区派出所', action: '8人完成笔录，5人警告3人行政拘留，列入黑名单', status: 'ok' },
  { id: 'l11', incidentId: 'i3', time: '18:42', actor: '后厨员工李小厨', action: '油烟管道冒黑烟，关闭燃气阀和风机', status: 'warn' },
  { id: 'l12', incidentId: 'i3', time: '18:42', actor: '后厨主管王建国', action: '按下手动报警，报告消防控制中心', status: 'info' },
  { id: 'l13', incidentId: 'i3', time: '18:43', actor: '消防控制室', action: '厨房自动灭火系统启动，排烟风机联动', status: 'info' },
  { id: 'l14', incidentId: 'i3', time: '18:44', actor: '专职消防周国栋', action: '到达现场，烟道余火已灭，无明火无人员伤亡', status: 'ok' },
  { id: 'l15', incidentId: 'i4', time: '15:22', actor: '气象台对接人周德海', action: '发布雷暴橙色预警，预计20分钟后到达本区域', status: 'warn' },
  { id: 'l16', incidentId: 'i4', time: '15:24', actor: '总指挥刘文华', action: '紧急会商决定暂停比赛，球员返回更衣室', status: 'warn' },
  { id: 'l17', incidentId: 'i4', time: '15:26', actor: '电力保障赵文博', action: 'UPS自检正常，柴油发电机启动测试，30秒带载成功', status: 'ok' },
  { id: 'l18', incidentId: 'i4', time: '15:41', actor: '配电房值班员', action: '市电闪断，UPS无缝切换，无设备断电', status: 'danger' },
  { id: 'l19', incidentId: 'i4', time: '15:46', actor: '配电房值班员', action: '市电恢复，发电机退出，全场设备正常', status: 'ok' },
  { id: 'l20', incidentId: 'i4', time: '16:05', actor: '裁判长', action: '雷暴预警解除，恢复比赛', status: 'ok' },
  { id: 'l21', incidentId: 'i5', time: '19:58', actor: '记录台操作员', action: '第三节24秒计时器突然黑屏，举手示意裁判', status: 'warn' },
  { id: 'l22', incidentId: 'i5', time: '19:58', actor: '技术代表陈志明', action: '确认故障，暂停比赛，通知技术组切换备用', status: 'info' },
  { id: 'l23', incidentId: 'i5', time: '20:00', actor: '技术保障刘文华', action: '备用计时器到位，连接记录台同步信号', status: 'info' },
  { id: 'l24', incidentId: 'i5', time: '20:01', actor: '技术代表', action: '核对剩余进攻时间14秒，确认恢复比赛', status: 'ok' },
  { id: 'l25', incidentId: 'i6', time: '20:30', actor: '安保员王强', action: 'D区1层22排观众突然倒地昏迷，请求急救组', status: 'danger' },
  { id: 'l26', incidentId: 'i6', time: '20:31', actor: '急救组孙志强', action: '携AED+急救箱到达现场，患者无呼吸无脉搏', status: 'danger' },
  { id: 'l27', incidentId: 'i6', time: '20:31', actor: '心内科李医生', action: '启动胸外按压CPR，AED分析心律', status: 'danger' },
  { id: 'l28', incidentId: 'i6', time: '20:32', actor: 'AED设备', action: '建议除颤，首次除颤200J', status: 'danger' },
  { id: 'l29', incidentId: 'i6', time: '20:34', actor: '急救组孙志强', action: '患者恢复自主呼吸和心跳，意识模糊', status: 'ok' },
  { id: 'l30', incidentId: 'i6', time: '20:42', actor: '120救护车', action: '交接患者转东莞市人民医院CCU，家属已通知', status: 'ok' },
  { id: 'l31', incidentId: 'i7', time: '22:12', actor: '通道哨兵王晓军', action: '3名球迷绕过安检冲向球员通道，立即拦截', status: 'danger' },
  { id: 'l32', incidentId: 'i7', time: '22:12', actor: '机动组张立群', action: '1分钟到达增援，合力控制3名闯入者', status: 'warn' },
  { id: 'l33', incidentId: 'i7', time: '22:15', actor: '安保队长', action: '更衣室通道增派8人双层警戒，暗哨加强巡逻', status: 'info' },
  { id: 'l34', incidentId: 'i7', time: '22:22', actor: '安保室', action: '3人均为未成年在校学生，通知家长到场训诫', status: 'ok' },
  { id: 'l35', incidentId: 'i8', time: '02:17', actor: '消防主机', action: 'B1层仓库烟感报警，3号喷淋动作', status: 'danger' },
  { id: 'l36', incidentId: 'i8', time: '02:18', actor: '值班长陈永明', action: '通知专职消防队和物业经理，派巡检确认', status: 'warn' },
  { id: 'l37', incidentId: 'i8', time: '02:21', actor: '专职消防周国栋', action: '佩戴呼吸器进入，喷淋已控制纸箱火势', status: 'info' },
  { id: 'l38', incidentId: 'i8', time: '02:30', actor: '消防队', action: '彻底扑灭余火，无人员伤亡，损失待清点', status: 'ok' },
  { id: 'l39', incidentId: 'i9', time: '16:30', actor: '气象台', action: '发布台风黄色预警，预计今晚20时登陆珠三角', status: 'warn' },
  { id: 'l40', incidentId: 'i9', time: '16:50', actor: '赛事总监王建国', action: '联合会议决定：第三节后提前中止比赛', status: 'warn' },
  { id: 'l41', incidentId: 'i9', time: '16:53', actor: '新闻官陈志明', action: '官方公告发布：未过半场，本场择日重赛，7日内可退票', status: 'info' },
  { id: 'l42', incidentId: 'i9', time: '17:05', actor: '安保大队', action: '全部12个出入口开放，分批次引导观众离场', status: 'info' },
  { id: 'l43', incidentId: 'i9', time: '17:40', actor: '场长吴场长', action: '观众全部安全疏散，无拥堵无事故，场馆封馆', status: 'ok' },
  { id: 'l44', incidentId: 'i10', time: '19:22', actor: '记录台郑记录员', action: '记分牌主控电脑蓝屏，程序无响应', status: 'warn' },
  { id: 'l45', incidentId: 'i10', time: '19:22', actor: '记录台主管', action: '纸质记录当前比分68:65，节次3节，犯规数7:6', status: 'info' },
  { id: 'l46', incidentId: 'i10', time: '19:23', actor: 'IT林海峰', action: '强制重启失败，切备用笔记本登录，云数据自动恢复', status: 'info' },
  { id: 'l47', incidentId: 'i10', time: '19:25', actor: '技术代表', action: '核对比分、犯规、暂停次数无误，恢复显示', status: 'ok' },
  { id: 'l48', incidentId: 'i11', time: '19:45', actor: '52号裁判', action: '球员争抢篮板头部着地，吹停比赛禁止起身', status: 'danger' },
  { id: 'l49', incidentId: 'i11', time: '19:46', actor: '脑震荡专员刘建国', action: 'SCAT5评估：头晕+逆行性遗忘+平衡障碍，判定不可返场', status: 'warn' },
  { id: 'l50', incidentId: 'i11', time: '19:52', actor: '医务总监张伟华', action: '联系120绿色通道，球员护送东莞市人民医院神内科', status: 'info' },
  { id: 'l51', incidentId: 'i11', time: '21:00', actor: '队医林志远', action: '球员意识清醒，留院观察24小时，CT无出血', status: 'ok' },
  { id: 'l52', incidentId: 'i12', time: '20:08', actor: '消防主机', action: '全馆32个烟感同时报警，疑似联动误报', status: 'warn' },
  { id: 'l53', incidentId: 'i12', time: '20:08', actor: '值班长黄俊杰', action: '启动误报预案，派6个巡检组现场确认', status: 'info' },
  { id: 'l54', incidentId: 'i12', time: '20:10', actor: '指挥中心广播', action: '临时通知：消防系统正在核实，请观众保持冷静', status: 'info' },
  { id: 'l55', incidentId: 'i12', time: '20:13', actor: '6个巡检组', action: '所有区域确认无烟、无火、无热源，判定主机主板故障误报', status: 'info' },
  { id: 'l56', incidentId: 'i12', time: '20:15', actor: '消防维保朱国平', action: '主机复位消音，切换到备用主板运行', status: 'ok' },
  { id: 'l57', incidentId: 'i12', time: '20:16', actor: 'MC广播', action: '系统误报解除，比赛继续进行，感谢理解配合', status: 'ok' }
]

export default { EMERGENCY_PLANS, INCIDENTS, LOGS }
