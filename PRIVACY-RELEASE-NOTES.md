# 参赛前端：隐私告知、文案与媒体签名整改

范围仅为 `D:/Projects/篮球/.worktrees/lanxin-comptrain`。未修改后端、读取凭据、提交、推送或上传。本文是本地实现与验收记录，不是已发布的隐私政策，也不表示已完成法律或真机审核。

## 本地实现

- `pages/chat`：移除 MCBA 官方身份、北京固定场馆、过期赛季、虚构联系人及强制真实报价。改为东莞篮球通用建议，未知价格、档期、规则须核实。
- `utils/privacy.js` 与 index/chat/profile-edit/custom-match-setup 四页面：用户触发时读取微信隐私设置；首次授权采用 `onNeedPrivacyAuthorization`、`requirePrivacyAuthorize` 和真实 `agreePrivacyAuthorization` 按钮；成功后重新检查平台授权状态。缺少 API、缺少隐私指引名称、API 失败、拒绝及页面隐藏/卸载均阻止继续。`showModal` 只承担业务告知，不能授予微信隐私权限。
- 每次 AI 发送均告知“本次输入及当前对话历史经服务器转发 ZeoAPI”，可取消；明确勿提供敏感信息或未成年人资料，供应商保留期限及跨境情况尚未核实。不持久化/复用 AI 同意；会话身份变化会阻止旧请求、清除旧历史。
- 上传前提醒仅使用获授权素材，涉及未成年人需监护人授权；图片/头像仍可能是公共链接，不承诺全量素材私有。微信实际选取/保存 API 报告未声明隐私 scope 时提示配置错误。
- 隐私指引入口：工作台右上头像 → “主题 / 隐私指引” → “隐私保护指引”；首次授权弹层也可查看。通过 `wx.openPrivacyContract` 打开，失败阻塞正在进行的授权。
- 商城保留演示定位，下单不扣款，UNPAID 显示“未支付”，成功提示不冒充付款。
- 移除 App 冷启动的自动登录；无登录会话的首页不请求个人资料。选取素材、相册保存和 AI 发送都不在启动时触发。

## 签名媒体接口约定

- 视频只接受 `https://api.lanxin.cyou/media/video/<[A-Za-z0-9_-]+>.(mp4|mov|webm|mkv)?exp=[1-9][0-9]{0,10}&sig=[0-9a-f]{64}`。
- 顺序固定 exp 然后 sig，拒绝无签名视频、重复/额外/乱序参数、编码、fragment、非同源及异常路径。图片保留同域 `/media/image/` 无 query 文件 URL。
- 保存/分享先 GET `/api/comptrain/clips/projects/{id}/render/{jobId}`；保存 POST 后下载前再次 GET。云端项目恢复使用已有 owned project GET。当前页面没有原片/集锦 `<video>` 播放控件，无需添加播放器。
- 仅保留项目/集锦身份及状态元数据，签名 URL 不写 storage、展示文件名或日志。下载不携带 bearer；403/404 给出刷新重试提示，下次动作重新 GET，不回退旧 URL。登录变化、切页、重新选片后不继续保存或分享旧文件。

## 测试与 UI 门禁

运行 `npm test`。保留原 98 项场景，并新增授权、告知、生命周期、身份变化、媒体刷新及严格 URL 白名单回归。测试使用 Node VM 中的微信 API 模拟，不代表开发者工具或手机已验证。

`tests/ui-baseline.json` 原 254 个 hash 未修改。`tests/ui-reviewed-changes.json` 固定 11 组文案/绑定替换；`tests/privacy-overlay.txt` 固定四页面的按需授权弹层。门禁仅反向还原这些精确字符串及既有三处训练绑定后验证原 hash；不允许任意布局/配色改变。弹层自身固定定位、列式按钮，使用 `app.wxss` 的 card/btn/主题变量，不依赖 chat 页样式。

## 发布前仍需完成（本地未执行）

1. 公众平台设置 → 服务内容声明 → 用户隐私保护指引：运营方按实际行为配置并发布声明，包括素材选取、摄像头/相册相关用途、相册保存、个人资料及 AI 对话经服务器转 ZeoAPI 等处理事实。确认实际接口 scope 已声明；缺项可能使微信接口拒绝。不能以本地自拟告知替代平台指引。
2. 运营方核实 ZeoAPI 的实际主体、保留/删除安排和是否跨境，并更新真实隐私指引。前端没有宣称这些事实已核实。
3. 部署并验收后端签名 DTO、媒体签名校验及 Nginx 路由，确保 `/media/video/` 不再被匿名 alias 绕过；同域 request/upload/download 合法域名按实际服务配置。前端不能修复服务器匿名访问。
4. 在体验版真机验证首次同意/拒绝/取消、查看指引、后台缺配置、相机/相册系统权限、切页/换号、上传、停留超过默认 900 秒后保存/分享以及 403 刷新重试。开发工具或 VM 不能替代手机授权链路验证。
5. 公众平台体验成员、当前体验版设置与旧 1.0.0（9/1）审核失败原因由主代理陪同用户处理；本改动不表示已解决体验权限或重新审核通过。

微信官方接口说明参考：[微信官方 API 类型声明及示例](https://github.com/wechat-miniprogram/api-typings/blob/master/types/wx/lib.wx.api.d.ts)，[隐私授权开发指南](https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/PrivacyAuthorize.html)。这些授权 API 需要微信基础库支持；不支持时前端阻塞并提示升级，不提供生产绕过开关。
