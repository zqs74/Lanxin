# 登录接口说明（给前端）

## 1. 接口概览
- 接口名称：微信登录换取业务 Token
- 请求方式：`POST`
- 接口路径：`/api/auth/wx-login`
- 是否需要登录：否
- `Content-Type`：`application/json`

完整示例（测试环境）：
- `http://<后端地址>/api/auth/wx-login`

## 2. 请求参数

### Request Body（JSON）
```json
{
  "code": "wx.login返回的code",
  "nickname": "可选，前端昵称",
  "avatarUrl": "可选，前端头像URL"
}
```

字段说明：
- `code`：必填，前端调用 `wx.login` 获得。
- `nickname`：可选，首次登录或资料更新时可传。
- `avatarUrl`：可选，首次登录或资料更新时可传。

## 3. 成功响应
统一响应结构：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 2,
    "token": "eyJhbGciOiJIUzI1NiJ9....",
    "expiresInSec": 604800,
    "role": "PLAYER",
    "nickname": "微信用户"
  }
}
```

字段说明：
- `userId`：后端用户 ID
- `token`：后续业务接口鉴权用
- `expiresInSec`：token 有效期（秒）
- `role`：用户角色，当前默认新用户为 `PLAYER`
- `nickname`：当前用户昵称

## 4. 失败响应（示例）

示例1：缺少 code
```json
{
  "code": -1,
  "message": "code不能为空",
  "data": null
}
```

示例2：微信登录配置缺失（生产常见）
```json
{
  "code": -1,
  "message": "微信登录未配置：请设置app.wx.miniapp.app-id与app.wx.miniapp.app-secret",
  "data": null
}
```

示例3：微信 code2Session 失败
```json
{
  "code": -1,
  "message": "微信登录失败: invalid code (40029)",
  "data": null
}
```

## 5. 前端接入步骤（必须）
1. 调用 `wx.login()` 拿 `code`。
2. 将 `code`（可带 `nickname/avatarUrl`）POST 到 `/api/auth/wx-login`。
3. 收到 `data.token` 后，本地持久化（如 storage）。
4. 后续所有业务接口都加请求头：
   - `Authorization: Bearer <token>`
5. 遇到 `401`：清理本地 token，重新走登录流程。
6. 遇到 `403`：提示“无权限访问”。

## 6. 业务接口鉴权规则（前端必须知道）
除白名单接口外，后端接口都需要 `Authorization: Bearer <token>`。

不需要 token 的接口：
- `POST /api/auth/wx-login`
- `POST /api/internal/ai-analysis/jobs/{jobId}/callback`（内部 worker 回调）

## 7. 调试示例（后端联调用）
```bash
curl -X POST "http://127.0.0.1:8080/api/auth/wx-login" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"test_code_123\",\"nickname\":\"测试用户\"}"
```

## 8. 环境说明
- 开发环境允许 mock 登录（若后端开启 `APP_AUTH_ALLOW_MOCK_LOGIN=true`）。
- 生产环境必须：
  - `APP_AUTH_ALLOW_MOCK_LOGIN=false`
  - 配置真实 `WX_MINIAPP_APP_ID` / `WX_MINIAPP_APP_SECRET`

