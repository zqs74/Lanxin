# Comptrain 登录与数据接入

请求统一通过 utils/api.js，基址 https://api.lanxin.cyou，身份为本小程序专属的微信 AppID。服务端 AppID/AppSecret 必须与 project.config.json 的 AppID 对应；父域相同不代表两个小程序可共享登录凭据。

## 登录

POST /api/auth/wx-login，JSON 请求 {code: wx.login返回的临时code}。

成功结构为 {code:0,message:'success',data:{token:'业务JWT',user:{id,nickname,avatarUrl,role,...}}}。
GET /api/auth/me 返回 {code:0,data:{id,nickname,avatarUrl,age,heightCm,weightKg,yearsOfPlay,position,skillFeature,...}}。

后续业务请求携带 Authorization: Bearer 业务JWT。共享客户端自动登录，并对普通请求的401只刷新重试一次；403和409不会被本地数据冒充成功。缓存只保留必要用户摘要，不能把OpenID、AppSecret或供应商Key下发到客户端。

## 新模块

- GET /api/comptrain/news、/events、/products：服务器目录数组。
- GET /api/comptrain/registrations；POST /api/comptrain/events/{id}/registrations：报名。
- GET/POST /api/comptrain/orders；DELETE /api/comptrain/orders：本人订单及软隐藏。
- POST /api/comptrain/clips/projects/upload：multipart file，登记本人视频并开始识别。
- GET /api/comptrain/clips/projects 与 /{id}：本人历史、识别状态和片段。
- POST /api/comptrain/clips/projects/{id}/render：{clipIds,requestId}；GET /{id}/render/{jobId} 查询；POST /{id}/render/{jobId}/save 保存。
- POST /api/comptrain/chat/completions：{messages,stream:true}，返回 SSE；不允许客户端指定第三方地址、模型或Key。

报名和下单requestId重试时必须保持相同，同一Key不能改变内容。订单金额和库存由后端确定，当前订单为UNPAID，没有微信支付回调，不能宣称已支付。

资料和训练继续使用 /api/users/{id}、/api/home/overview、/api/training/overview、/api/training/records；自定义比赛使用 /api/custom-matches/{clientMatchId}，写入必须携带expectedVersion，409保留本地草稿待处理。
