# 办赛前端文案与隐私整改（2026-09-16）

仅修改本办赛前端工作树；未访问真实业务接口、读取凭据、修改后端或参赛端，未提交、推送或上传。

## 行为

- 预约创建、详情、列表统一按服务端状态码显示。PENDING 显示“预约意向待确认”，不承诺客户经理联系、锁档或服务已就绪。未知状态显示待核实。
- 海报、资源库、资源弹窗不再承诺配套就绪、合作或代订。显式 info 标记（配置、contact.mode、方案/资源的 mode、resourceMode、bookingMode），或 bookingEnabled/canBook=false 时，预约入口与提交均停止；接收分享后重新匹配到 info 资源也不会打开预约。
- 非 info 的提交仅为预约意向，仍由服务端决定状态，不在前端自动确认。
- 客服缺少实际联系方式时显示未配置；包内示例二维码与 Lanxin-kefu 不再作为客服回退。客服操作使用当前展示的数据。
- 登录页原有帮助区域内提供“查看隐私保护指引”，调用 wx.openPrivacyContract；查看失败明确提示，不因此登录或记录同意。
- 登录发送账号密码前、预约发送联系人/电话/微信/备注前也独立检查微信隐私授权。登录原帮助文字说明账号密码用于验证；预约字段占位文字说明用于处理意向、联系，并提示勿填写他人隐私。相册检查不代表其他资料提交已获授权。
- 三条敏感操作路径均检查运行时公开 AppID 的有效格式，且 getPrivacySetting 必须返回非空白 privacyContractName 和明确布尔 needAuthorization。缺 AppID、游客 AppID、后台未配置指引、平台接口失败均阻塞，不能因 needAuthorization=false 单独放行。授权后再次检查也要求指引名称有效。
- 两类图片导出在渲染前与写相册前调用 wx.getPrivacySetting；需要授权时，通过已注册的 wx.onNeedPrivacyAuthorization 监听展示按需覆盖层。官方 agreePrivacyAuthorization 按钮触发 bindagreeprivacyauthorization 后，调用平台 resolve({event: 'agree', buttonId: 'bansai-privacy-agree'})，等待 wx.requirePrivacyAuthorize 成功，再次核实 needAuthorization=false 与有效指引名称。没有本地授权标记，普通点击和仅查看指引均不能授权。
- 相册权限由 wx.saveImageToPhotosAlbum 的微信平台流程处理，隐私授权不替代相册授权。
- 预约图片中的联系人、电话、微信、备注全部替换为“已隐藏”，不生成原文图片；详情页内本人查看不变。方案与预约分享显式指定包内公开封面，避免微信默认页面截图带出预约表单信息。

## 首次授权修正依据

已核对微信官方 api-typings 原文（2026-09-16）：[lib.wx.api.d.ts](https://raw.githubusercontent.com/wechat-miniprogram/api-typings/master/types/wx/lib.wx.api.d.ts)，onNeedPrivacyAuthorization 说明约 28548–28666 行、requirePrivacyAuthorize 说明约 30494–30570 行。此前将 requirePrivacyAuthorize 假定为原生自动弹窗的实现和直接成功 mock 不完整，已修正。

统一监听只注册一次；不调用或依赖不存在的 offNeedPrivacyAuthorization。每次只向当前待授权页面派发事件，闲置/未完成指引检查时的事件直接拒绝。同页并发请求共用授权流程；每个平台注册的 resolve 在同意或取消时仅调用一次。四页（登录、方案预约、海报、预约图片）的覆盖层仅在需要授权时显示，复用原按钮样式，不改变普通页面布局。

## 迟到授权事件竞态修复

取消只立即关闭 UI、拒绝调用方并释放页面操作锁；全局平台占用继续保留到旧 requirePrivacyAuthorize 实际 success/fail/complete 回调终结。此期间当前全局 listener 对旧事件仅返回 disagree，新请求提示“其他隐私授权尚未结束，请稍后重试”，不能接管旧请求。旧调用没有终结回调时持续失败关闭，不用超时或页面切换擅自释放平台占用。

清理绑定到独立 platformWork 的结束，并校验请求身份；Promise.race 的取消不再清空 pending。complete-only 视为失败终结，不能据此认为已授权；success/fail 之后的重复或迟到 complete 不会清理新请求。

新增回归先在修复前复现：通过当前全局 listener 派发旧事件，B 的官方同意事件错误地向 A resolver 发出 agree。修复后，三个终结分支（success/fail/complete）均验证取消即时返回、旧事件只拒绝、B 被阻止接管、旧 complete 不清理 B；另验证只有 complete 时失败并允许重试。mock 没有保存/调用旧 listener 来绕开真实全局派发。

## 失败与取消

- 点击取消或普通离页/卸载：调用平台 resolve({event: 'disagree'}) 并拒绝本地等待，释放锁；不注销全局监听。查看官方指引引起的临时隐藏保留请求，回到原页后仍须点击官方同意按钮。
- 隐私 API 不可用、状态格式异常、查询失败、用户拒绝/取消、授权后仍未生效：不渲染导出图片、不写相册，清除导出锁与 palette，可由用户再次点击重试。
- 保存失败或相册拒绝/取消：不提示保存成功，不自动预览、打开设置或通过长按保存绕过；清除导出锁与 palette。
- 图片生成失败、无路径、会话变更、页面卸载：不继续写相册。重复图片回调只允许一次保存。
- 取消预约表单：关闭表单和日历、不提交，当前会话内保留草稿。
- 登录隐私检查失败/取消：不发送登录请求，清除密码、释放提交锁，并在原错误区域显示具体原因和“未提交登录信息”；预约隐私检查失败/取消：不发送预约请求，保留表单草稿、释放提交锁，并提示“未提交预约资料”。等待授权期间离开登录页或关闭预约表单，回调成功也不会继续提交。
- 正在写相册的系统调用一旦发出，前端不能撤回系统已完成的写入；会话检查位于调用前，晚到回调不更新已失效页面。

## 验证与边界

`npm test`：前次 106 项保留，本次新增 4 项平台迟到事件回归，共 110 项。本地 wx mock 测试覆盖授权先后、拒绝/取消、失败关闭、隐私状态变更、脱敏、分享封面、客服缺省、info 模式、状态显示及导出生命周期；还覆盖登录/预约发送前授权、空或缺失指引名称、空/游客 AppID、授权后配置消失、等待期间取消/离开页面及资源变化。首次授权 mock 遵循 require → onNeed(resolve, eventInfo) → 官方按钮事件 → 带 buttonId 的 resolve → success/fail → getPrivacySetting 复查；不定义不存在的 API。新增用例涵盖普通 tap/错误按钮不能同意、未收到平台成功不能发送、取消/离页/账号切换、并发与迟到事件、查看指引后继续、同意未生效，以及精确覆盖层/重复覆盖层/样式篡改的 UI 门禁。

UI 校验保留原文件哈希，通过 `tests/ui-approved-changes.js` 精确逆向替换获准文案，并在四个指定页面各移除一次 `tests/privacy-overlay.txt` 固定覆盖层后比较。已有资源库重复文案明确限定为两次，其余批准片段均限定一次；无通配替换。未修改 WXSS、常态页面尺寸/配色/布局或 Painter 坐标；新增样式仅存在于获准的按需覆盖层。

这些结果不等于正式微信验收。未使用真实 AppID、正式隐私配置或真机验证；空 AppID、游客模式及 mock 通过均不能视为发布条件。仍须在真实 AppID 下核实平台隐私指引已配置并覆盖相册保存、首次授权覆盖层、官方同意按钮与 resolve 链路可用、基础库兼容，并分别在 iOS/Android 真机检查首次授权、已授权、拒绝/取消、相册权限拒绝及再次显式重试。还需真机检查文字换行与分享封面显示；本次只有布局源码基线验证，没有真机截图验收。
