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
    // Approved 2026-09-18: the mini program has no login or booking any more. The booking button gives way to a
    // note, and a floating "咨询" ball follows the contact popup. Since 2026-09-19 the ball is the mini program's
    // own contact button (customer service handed to WeCom "微信客服"): the direct-open API needs both accounts
    // verified under one entity and failed with "not bind". Undone first, because
    // the removed button carried the text counted by an entry below.
    [
      "    <button class=\"primary-btn cta-btn\" bindtap=\"openBooking\">{{infoOnly ? '公开信息不支持代订' : '登记预约意向'}}</button>",
      "    <!-- 2026-09-18：不再提供预约入口；需要进一步对接时点右下角悬浮球，转到企业微信里沟通。 -->"
    ],
    [
      "  <open-guide visible=\"{{guideVisible}}\" bind:close=\"closeGuide\" />",
      "  <open-guide visible=\"{{guideVisible}}\" bind:close=\"closeGuide\" /><button class=\"advisor-ball\" open-type=\"contact\" show-message-card=\"{{true}}\" send-message-title=\"咨询办赛方案\" send-message-img=\"/assets/resources/materials/trophy-real.jpg\" hover-class=\"advisor-ball--hover\"><text class=\"advisor-ball-icon\">💬</text><text class=\"advisor-ball-text\">咨询</text></button>"
    ],
    // Approved 2026-09-18: no empty cover block; city-wide organisations are not labelled with the requested town.
    [
      "<image class=\"resource-cover\" src=\"{{resource.cover || resource.avatar || resource.image}}\" mode=\"aspectFill\"></image>",
      "<image wx:if=\"{{resource.cover || resource.avatar || resource.image}}\" class=\"resource-cover\" src=\"{{resource.cover || resource.avatar || resource.image}}\" mode=\"aspectFill\"></image>"
    ],
    [
      "{{resource.town || demand.town || '东莞'}} · ",
      "{{resource.town || '东莞'}} · "
    ],
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
    // Approved 2026-09-18: no card without a picture keeps an empty cover area.
    [
      "<image class=\"library-cover\" src=\"{{item.cover || item.avatar || item.image}}\" mode=\"aspectFill\"></image>",
      "<image wx:if=\"{{item.cover || item.avatar || item.image}}\" class=\"library-cover\" src=\"{{item.cover || item.avatar || item.image}}\" mode=\"aspectFill\"></image>"
    ],
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
  "./pages/login/login.wxss": [
    [
      ".login-button { background: #1d5dff; color: #fff; font-size: 30rpx; border-radius: 16rpx; }",
      ".login-card .login-button { width: 100%; height: 88rpx; line-height: 88rpx; background: #1d5dff; color: #fff; font-size: 30rpx; border-radius: 16rpx; }"
    ]
  ],
  "./pages/login/login.wxml": [
    [
      "账号由管理员统一发放。如需开通或找回密码，请联系管理员。",
      "账号密码用于登录验证。<text bindtap=\"openPrivacyContract\">查看隐私保护指引</text>"
    ]
  ],
  "./pages/history/history.wxml": []
};
const overlay = require("node:fs").readFileSync(require("node:path").join(__dirname, "privacy-overlay.txt"), "utf8");
// Approved 2026-09-18: without login and booking the history tab lists only the plans made on this device;
// the booking section is gone (its markup is kept in a text file so its line endings follow the page's).
module.exports["./pages/history/history.wxml"].push([
  require("node:fs").readFileSync(require("node:path").join(__dirname, "history-bookings-section.txt"), "utf8"),
  "  <!-- 2026-09-18：小程序不再有登录和预约，这里只保留本机生成过的方案。 -->"]);
// Approved 2026-09-18: the "主推资源" feature card is gone. Public listings have no featured entry, and its
// bottom-anchored body pushed the name out of view for long descriptions. The removed markup is kept in a
// text file so its line endings follow the page's. It is restored first because the card contained one of
// the "资源仅供参考，请自行核实" occurrences counted by the entry above.
module.exports["./pages/library/library.wxml"].unshift([
  require("node:fs").readFileSync(require("node:path").join(__dirname, "library-feature-card.txt"), "utf8"),
  "  <!-- 2026-09-18：取消“主推资源”大卡片。公开资料没有主推之分，所有资源统一用下方卡片展示。 -->"]);
for (const page of ["login", "result", "poster", "booking-success"]) {
  module.exports["./pages/" + page + "/" + page + ".wxml"].push(["", overlay]);
}
// Approved 2026-09-18: resource cards on the plan page wrap long URLs inside the card (the flex body may
// shrink) and cap the description at six lines. The snippets are kept in text files so their line endings
// follow the stylesheet's; the original body rule is the same block without its min-width line.
{
  const read = name => require("node:fs").readFileSync(require("node:path").join(__dirname, name), "utf8");
  const body = read("result-card-wrap.txt");
  module.exports["./pages/result/result.wxss"] = [
    [body.replace(/  min-width: 0;\r?\n/, ""), body],
    ["", read("result-desc-clamp.txt")],
    ["", read("result-advisor-ball.txt")],
  ];
}
// Approved 2026-09-19: the library's contact entry becomes the mini program's own contact button, titled
// "联系客服", with the button resets appended to the stylesheet. Built with the page's own line endings.
{
  const fs = require("node:fs"), path = require("node:path");
  const page = fs.readFileSync(path.join(__dirname, "..", "pages", "library", "library.wxml"), "utf8");
  const eol = page.includes("\r\n") ? "\r\n" : "\n";
  const inner = [
    '    <view class="contact-entry-icon">💬</view>',
    '    <view class="contact-entry-body">',
    '      <view class="contact-entry-title">TITLE</view>',
    '      <view class="contact-entry-desc">公开资源不代表合作或可代订，请自行核实</view>',
    '    </view>',
    '    <view class="contact-entry-arrow">›</view>',
  ];
  const block = (open, title, close) => [open].concat(inner.map(line => line.replace("TITLE", title)), [close]).join(eol);
  module.exports["./pages/library/library.wxml"].unshift([
    block('  <view class="contact-entry" bindtap="openContact" hover-class="library-card--hover" hover-stay-time="80">', "查看联系信息", "  </view>"),
    block('  <button class="contact-entry" open-type="contact" show-message-card="{{true}}" send-message-title="咨询东莞篮球资源" ' +
      'send-message-img="/assets/resources/materials/trophy-real.jpg" hover-class="library-card--hover">', "联系客服", "  </button>"),
  ]);
  module.exports["./pages/library/library.wxss"] = [["", fs.readFileSync(path.join(__dirname, "library-contact-button.txt"), "utf8")],
    // Approved 2026-09-19: long source URLs in library descriptions wrap inside the card instead of being clipped.
    ["", fs.readFileSync(path.join(__dirname, "library-desc-wrap.txt"), "utf8")]];
}
