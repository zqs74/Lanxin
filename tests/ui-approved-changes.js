// Exact text and on-demand overlay approvals; original layout hashes remain fixed.
module.exports = {
  "./pages/poster/poster.wxml": [
    [
      "场馆、裁判、物料、预约入口已同步准备好",
      "资源仅供参考，档期与服务需另行确认"
    ]
  ],
  "./pages/booking-success/booking-success.wxml": [
    [
      "'保存预约图片'",
      "'保存脱敏图片'"
    ]
  ],
  "./pages/result/result.wxml": [
    [
      "详情请咨询客户经理",
      "资源仅供参考，请自行核实"
    ],
    [
      "填写信息帮忙预约",
      "{{infoOnly ? '公开信息不支持代订' : '登记预约意向'}}"
    ],
    [
      "预约场地办赛",
      "登记意向，档期与服务待确认"
    ],
    [
      "提交场地预约",
      "提交意向待确认"
    ],
    [
      "方便联系的手机号",
      "用于处理意向及联系"
    ],
    [
      "选填，方便后续沟通",
      "选填，用于预约沟通"
    ],
    [
      "比如需要主裁边裁、电子计分、物料等",
      "仅填预约需求，勿填他人隐私"
    ]
  ],
  "./pages/library/library.wxml": [
    [
      "详情请咨询客户经理",
      "资源仅供参考，请自行核实",
      2
    ],
    [
      "联系客户经理",
      "查看联系信息"
    ],
    [
      "资源详情、档期与合作开通，扫码添加客服微信",
      "公开资源不代表合作或可代订，请自行核实"
    ]
  ],
  "./components/open-guide/open-guide.wxml": [
    [
      "查看详情需开通内部账号",
      "{{contact.configured ? '资源联系信息' : '客服尚未配置'}}"
    ],
    [
      "资源详情、联系方式与档期仅对合作办赛方开放",
      "资源仅供参考，不代表合作或可代订"
    ],
    [
      "客服二维码",
      "{{contact.qrCode ? '客服二维码' : '尚未配置'}}"
    ],
    [
      "{{contact.wechat || '--'}}",
      "{{contact.wechat || '未配置'}}"
    ],
    [
      ">复制</text>",
      ">{{contact.wechat ? '复制' : '未配置'}}</text>"
    ],
    [
      "{{contact.phone || '暂未开通'}}",
      "{{contact.phone || '未配置'}}"
    ],
    [
      ">拨打</text>",
      ">{{contact.phone ? '拨打' : '未配置'}}</text>"
    ],
    [
      "联系客户经理开通",
      "{{contact.wechat ? '复制客服微信' : '客服微信未配置'}}"
    ]
  ],
  "./pages/login/login.wxml": [
    [
      "账号由管理员统一发放。如需开通或找回密码，请联系管理员。",
      "账号密码用于登录验证。<text bindtap=\"openPrivacyContract\">查看隐私保护指引</text>"
    ]
  ]
};
const overlay = require("node:fs").readFileSync(require("node:path").join(__dirname, "privacy-overlay.txt"), "utf8");
for (const page of ["login", "result", "poster", "booking-success"]) {
  module.exports["./pages/" + page + "/" + page + ".wxml"].push(["", overlay]);
}
