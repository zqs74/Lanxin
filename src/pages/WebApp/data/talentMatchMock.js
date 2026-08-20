/** 人才匹配清单 Mock 数据 v2（技术优势一·智能人才匹配·对话版）
 *  18人全部有真实照片（scorer-4 暂以姓名首字头像降级） */

export const MATCH_EVENT = {
  tournament: '粤BA半决赛',
  level: 'Ⅰ级',
  date: '2026-08-20 ~ 08-22',
  totalMatches: 12,
  totalStaff: 18,
  matchRate: 97.7,
  deployHours: 36
}

/** 用户输入的需求消息（对话形式） */
export const USER_MESSAGE = {
  text: `赛事：粤BA半决赛（Ⅰ级·省市级）
时间：2026年8月20-22日
场次：共12场 / 3天

人员需求：
· 裁判 6人（主裁+副裁+技术代表）
· 技术指导 3人
· 记录台 4人
· 医护 2人
· 安保运营 3人
共计 18人`,
  time: '13:59'
}

/** AI回复的开场文字 */
export const AI_REPLY_HEADER = {
  text: '基于1168人人才库，AI智能匹配率97.7%，36小时内全部到岗。以下是整场赛事人员匹配清单：',
  time: '14:00'
}

export const PERSONNEL_GROUPS = [
  {
    id: 'referee',
    name: '裁判组',
    short: '裁判',
    icon: 'Whistle',
    color: 'info',
    total: 6,
    members: [
      {
        id: 'ref-8',
        name: '潘荣远',
        avatar: '/images/resources/hr/referees/ref-8.png',
        hasPhoto: true,
        role: '技术代表',
        level: '国家级',
        years: 23,
        matches: 200,
        rating: 4.8,
        matchScore: 98,
        isRecommended: false,
        tags: ['广东篮协', '国家级', '东莞']
      },
      {
        id: 'ref-10',
        name: '张明',
        avatar: '/images/resources/hr/referees/ref-10.png',
        hasPhoto: true,
        role: '裁判长',
        level: '国家级',
        years: 40,
        matches: 300,
        rating: 4.7,
        matchScore: 95,
        isRecommended: false,
        tags: ['广东篮协', '东莞', '裁委会主任']
      },
      {
        id: 'ref-9',
        name: '刘存',
        avatar: '/images/resources/hr/referees/ref-9.png',
        hasPhoto: true,
        role: '备用裁判',
        level: '国家级',
        years: 13,
        matches: 85,
        rating: 4.4,
        matchScore: 92,
        isRecommended: false,
        tags: ['广东篮协', '国家级', '东莞']
      },
      {
        id: 'ref-12',
        name: '陈新键',
        avatar: '/images/resources/hr/referees/ref-12.png',
        hasPhoto: true,
        role: '主裁判',
        level: '国家级',
        years: 36,
        matches: 220,
        rating: 4.9,
        matchScore: 89,
        isRecommended: true,
        recommendReason: 'CBA职业联赛裁判员·执裁经验丰富',
        tags: ['广东篮协', '国家级', 'CBA职业联赛']
      },
      {
        id: 'ref-13',
        name: '雷荔宁',
        avatar: '/images/resources/hr/referees/ref-13.png',
        hasPhoto: true,
        role: '第一副裁',
        level: '国际级',
        years: 22,
        matches: 180,
        rating: 4.6,
        matchScore: 86,
        isRecommended: false,
        tags: ['广东篮协', '佛山', '国家级']
      },
      {
        id: 'ref-7',
        name: '费斯语',
        avatar: '/images/resources/hr/referees/ref-7.png',
        hasPhoto: true,
        role: '第二副裁',
        level: '国际级',
        years: 13,
        matches: 90,
        rating: 4.5,
        matchScore: 83,
        isRecommended: false,
        tags: ['国家级', '劳资协议', '东莞']
      }
    ]
  },
  {
    id: 'coach',
    name: '技术指导组',
    short: '指导',
    icon: 'ClipboardList',
    color: 'purple',
    total: 3,
    members: [
      {
        id: 'coach-9',
        name: '丹尼',
        avatar: '/images/resources/hr/coaches/coach-9.png',
        hasPhoto: true,
        role: '技术指导',
        level: '国家二级运动员',
        years: 9,
        matches: 0,
        rating: 4.5,
        matchScore: 92,
        isRecommended: true,
        recommendReason: '广东本地·青训经验丰富',
        tags: ['广东', '国家二级运动员', '10年经验']
      },
      {
        id: 'coach-17',
        name: '曲绍斌',
        avatar: '/images/resources/hr/coaches/coach-17.png',
        hasPhoto: true,
        role: '战术指导',
        level: 'CBA总冠军教练',
        years: 10,
        matches: 0,
        rating: 4.7,
        matchScore: 90,
        isRecommended: false,
        tags: ['后卫', 'CBA联赛总冠军', '广东宏远']
      },
      {
        id: 'coach-16',
        name: '王怀玉',
        avatar: '/images/resources/hr/coaches/coach-16.png',
        hasPhoto: true,
        role: '青训顾问',
        level: '高级教练',
        years: 27,
        matches: 0,
        rating: 4.6,
        matchScore: 87,
        isRecommended: false,
        tags: ['广东宏远', '青训教父']
      }
    ]
  },
  {
    id: 'scorer',
    name: '记录台组',
    short: '记录',
    icon: 'ClipboardList',
    color: 'ok',
    total: 4,
    members: [
      {
        id: 'sc-1',
        name: '张秀芳',
        avatar: '/images/resources/hr/scorer/scorer-1.jpg',
        hasPhoto: true,
        role: '记录台长',
        level: '一级',
        years: 15,
        matches: 120,
        rating: 4.7,
        matchScore: 94,
        isRecommended: true,
        recommendReason: '经验丰富·记录台管理能力强',
        tags: ['一级', '120场经验']
      },
      {
        id: 'sc-2',
        name: '李伟明',
        avatar: '/images/resources/hr/scorer/scorer-2.jpg',
        hasPhoto: true,
        role: '记录员',
        level: '二级',
        years: 8,
        matches: 60,
        rating: 4.3,
        matchScore: 88,
        isRecommended: false,
        tags: ['二级', '东莞']
      },
      {
        id: 'sc-3',
        name: '陈小红',
        avatar: '/images/resources/hr/scorer/scorer-3.jpg',
        hasPhoto: true,
        role: '计时员',
        level: '二级',
        years: 6,
        matches: 45,
        rating: 4.2,
        matchScore: 85,
        isRecommended: false,
        tags: ['二级', '粤BA']
      },
      {
        id: 'sc-4',
        name: '黄志强',
        avatar: null,
        hasPhoto: false,
        role: '24秒计时员',
        level: '三级',
        years: 4,
        matches: 30,
        rating: 4.0,
        matchScore: 82,
        isRecommended: false,
        tags: ['三级', '东莞']
      }
    ]
  },
  {
    id: 'medical',
    name: '医护组',
    short: '医护',
    icon: 'HeartPulse',
    color: 'danger',
    total: 2,
    members: [
      {
        id: 'med-1',
        name: '陈志远',
        avatar: '/images/resources/hr/medical/medical-1.jpg',
        hasPhoto: true,
        role: '医护负责人',
        level: '执业医师',
        years: 12,
        matches: 80,
        rating: 4.8,
        matchScore: 95,
        isRecommended: true,
        recommendReason: '执业资质·赛事医疗保障经验丰富',
        tags: ['执业医师', '急救认证', '80场']
      },
      {
        id: 'med-2',
        name: '林晓雯',
        avatar: '/images/resources/hr/medical/medical-2.jpg',
        hasPhoto: true,
        role: '急救员',
        level: '急救员证书',
        years: 5,
        matches: 35,
        rating: 4.4,
        matchScore: 86,
        isRecommended: false,
        tags: ['急救员', 'AED认证']
      }
    ]
  },
  {
    id: 'security',
    name: '安保运营组',
    short: '安保',
    icon: 'ShieldCheck',
    color: 'warn',
    total: 3,
    members: [
      {
        id: 'sec-1',
        name: '刘铁柱',
        avatar: '/images/resources/hr/security/security-1.jpg',
        hasPhoto: true,
        role: '安保队长',
        level: '高级安保',
        years: 10,
        matches: 200,
        rating: 4.5,
        matchScore: 90,
        isRecommended: true,
        recommendReason: '安保经验丰富·大型赛事200+场',
        tags: ['高级安保', '200场']
      },
      {
        id: 'sec-2',
        name: '赵勇',
        avatar: '/images/resources/hr/security/security-2.jpg',
        hasPhoto: true,
        role: '安保员',
        level: '中级安保',
        years: 5,
        matches: 80,
        rating: 4.2,
        matchScore: 84,
        isRecommended: false,
        tags: ['中级安保', '东莞']
      },
      {
        id: 'sec-3',
        name: '孙丽',
        avatar: '/images/resources/hr/security/security-3.jpg',
        hasPhoto: true,
        role: '运营协调',
        level: '运营专员',
        years: 6,
        matches: 50,
        rating: 4.3,
        matchScore: 83,
        isRecommended: false,
        tags: ['运营', '粤BA']
      }
    ]
  }
]