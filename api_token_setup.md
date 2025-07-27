# 在非GUI环境中使用 API Token 替代 OAuth 认证
Cloudflare 推荐在无 GUI 环境中使用 API Token 进行认证，而不是依赖 OAuth 流程。以下是具体步骤：

1. **在 Cloudflare 仪表板生成 API Token**：
   - 登录到 [Cloudflare 仪表板](https://dash.cloudflare.com/)。
   - 转到 **“我的个人资料” > “API 令牌”**（或访问 `https://dash.cloudflare.com/profile/api-tokens`）。
   - 点击 **“创建令牌”**，选择 **“创建自定义令牌”**。
   - 为令牌命名（例如 `Wrangler CLI Token`）。
   - 配置权限：
     - 至少需要以下权限：
       - `Account > Workers Scripts > Edit`
       - `Account > Account Settings > Read`
       - `User > User Details > Read`
     - 根据需要添加其他权限（如 KV、R2 或 D1 的相关权限）。
   - 设置令牌的 TTL（建议长期有效或根据需求设置）。
   - 生成令牌并复制保存（生成后无法再次查看）。

2. **在 VPS 上配置 API Token**：
   - 在 VPS 上，设置环境变量 `CLOUDFLARE_API_TOKEN`：
     ```bash
     export CLOUDFLARE_API_TOKEN="your-api-token-here"
     ```
   - 或者，将 API Token 添加到 Wrangler 的配置文件中：
     - 编辑 `~/.wrangler/config/default.toml`（如果不存在，可以创建）：
       ```toml
       api_token = "your-api-token-here"
       ```
     - 或者在项目根目录的 `wrangler.toml` 文件中添加：
       ```toml
       account_id = "your-account-id"
       api_token = "your-api-token-here"
       ```

3. **验证登录状态**：
   - 运行以下命令检查是否成功配置：
     ```bash
     npx wrangler whoami
     ```
   - 如果配置正确，你会看到你的 Cloudflare 账户信息。

4. **继续部署**：
   - 使用 `npx wrangler deploy` 或其他 Wrangler 命令，无需再次运行 `wrangler login`。

**优点**：API Token 方式完全绕过浏览器和 OAuth 流程，非常适合无 GUI 的 VPS 环境。
**注意**：
- 确保 API Token 具有足够的权限，否则可能遇到类似 `workers.api.error.script_not_found [code: 10007]` 或 `Error 10000` 的错误。
- 不要将 API Token 硬编码到代码或公开的配置文件中，建议使用环境变量或 `wrangler secret` 管理敏感信息。
