## SiteProxy 2.0
 - [English ver](README_english.md)

SiteProxy 是一个**功能强大的在线代理工具**，采用了最新的技术，提升了代理的稳定性和兼容性。我们致力于提供 **简单、高效、安全** 的代理服务，为用户提供最佳的互联网访问体验。

- **超高速性能**：采用 Hono 替代传统的Express 服务器，性能提升 4 倍，带来更流畅的使用体验。
- **云端部署**：完美支持 Cloudflare Worker 部署，快速且高效。
- **AI 智能聊天**：集成 DuckDuckGo AI Chat，免费提供 GPT-3.5 和 Claude 3，让你的代理服务更加智能。
- **高级安全保护**：支持密码控制代理，只有授权用户才能访问，大幅提升安全性。
- **零配置使用**：用户无需进行任何客户端配置，只需访问代理网址即可畅游全球互联网。
- **便捷登录**：全面支持 GitHub 和 Telegram Web 登录，操作简单快捷。
- **强力加密**：采用 `RSA + AES` 双重加密技术，保护用户登录密码，防止中间人攻击。
- **隐私保护**：通过代理网址访问全球互联网，同时隐藏用户真实 IP，保护隐私。
- **无缝体验**：无需任何软件安装和浏览器配置，即可立即使用，提供极致便利的用户体验。

<details>
  <summary>查看原理</summary>

```
                                                 +----> google/youtube
                             +----------------+  |
                             |                |  |
user browser +-------------->+ siteproxy      +-------> wikipedia
                             |                |  |
                             +----------------+  |
                                                 +----> chinese forums
```

</details>

> [!CAUTION]
> 严禁将本项目用于任何非法用途，否则后果自负

> [!WARNING]
> 由于支持多个网站的 Login，为了减少钓鱼风险，Siteproxy 在 2.0 版本对代码进行了混淆，同时禁止了默认主页网址的修改。

## 注意事项

- 推荐使用vps或者docker部署。 Cloudflare部署可能导致部分网站无法访问，因为CF的IP已经被一些网站限制访问了。
- 推荐duckduckgo进行搜索，因为Google搜索和youtube网站都增加了防广告和机器人的机制，访问可能受限。

## 部署到 Cloudflare Pages
1. **确保域名管理**：
   - 确保你的域名已经在 Cloudflare 名下进行管理。
2. **克隆仓库,安装依赖**：
   - 确保nodejs v22或以上版本已经安装, 确保git已经安装。
   - 执行命令：`git clone https://github.com/netptop/siteproxy.git`
   - 执行命令：`cd siteproxy`
   - 执行命令：`npm install`
3. **登录 Cloudflare创建page，如果已经创建，这一步可以跳过**：
   - 进入 **Workers 和 Pages** 部分，选择 **使用直接上传创建** 一个 Page，上传刚刚clone的`siteproxy/build/cf_page` 目录进行部署。
4. **配置自定义域, 如果已经配置，这一步可以跳过**：
   - 在 **Workers & Pages** 页面，打开刚才部署的 Page。
   - 点击顶部的 **自定义域**，然后选择 **添加自定义域**，设置为你的代理域名并激活域名。
5. **编辑配置文件**：
   - 使用文本编辑器打开 `siteproxy/wrangler.jsonc` 文件,修改如下字段并保存:
     ```json
      "name": "xxx", // 替换为你的cloudflare page的名字
      "proxy_url": "https://your-proxy-domain.com", // 替换为你的代理服务器域名, 必须为https
      "token_prefix": "/default/" // 替换为你想设置的访问密码。首尾斜杠必须保留，如果密码为空，表示不需要密码也可以访问。
     ```
6. **再次部署page**：
   - 进入clone的siteproxy目录，执行:`npm run wrangler-login`, 如果是非GUI的VPS环境，请参考[非GUI环境wrangler login](api_token_setup.md)
   - 执行:`npm run deploy-cf-page`
7. **访问代理服务**：
   - 现在可以通过 `https://your-proxy-domain.com/your-password/` 访问代理服务（确保最后的斜杠存在）。注意将域名和密码替换为你自己的。

## 部署到 Cloudflare Workers
1. **确保域名管理**：
   - 确保你的域名已经在 Cloudflare 名下进行管理。
2. **克隆仓库,安装依赖**：
   - 确保nodejs v22或以上版本已经安装, 确保git已经安装。
   - 执行命令：`git clone https://github.com/netptop/siteproxy.git`
   - 执行命令：`cd siteproxy`
   - 执行命令：`npm install`
3. **创建 Worker, 如果已经创建，这一步可以跳过**：
   - 登录 Cloudflare，进入 **Workers 和 Pages** 部分，创建一个 'hello world' Worker, 请自己命名。
4. **配置自定义域, 如果已经创建，这一步可以跳过**：
   - 在 **Workers & Pages** 页面，打开刚才保存的 Worker。
   - 点击顶部的 **设置 -> 自定义域**，设置为你的代理域名。自定义域名设置并激活。
5. **编辑配置文件**：
   - 使用文本编辑器打开 `siteproxy/wrangler.worker.jsonc` 文件,修改如下字段并保存:
     ```json
      "name": "xxx", // 替换为你的cloudflare worker的名字
      "proxy_url": "https://your-proxy-domain.com", // 替换为你的代理服务器域名, 必须为https
      "token_prefix": "/xxx/" // 替换为你想设置的访问密码。首尾斜杠必须保留，如果密码为空，表示不需要密码也可以访问。
     ```
6. **再次部署worker**：
   - 进入clone的siteproxy目录，执行:`npm run wrangler-login`, 如果是非GUI的VPS环境，请参考[非GUI环境wrangler login](api_token_setup.md)
   - 执行:`npm run deploy-cf-worker`
7. **访问代理服务**：
   - 现在可以通过 `https://your-proxy-domain.com/your-password/` 访问代理服务（确保最后的斜杠存在）。注意将域名和密码替换为你自己的。

## 部署到 VPS 或者云服务器

1. **创建 SSL 网站**：
   - 使用 `certbot` 和 `nginx` 创建 SSL 网站。具体用法可以 Google 搜索。
   - 配置 `nginx`，确保 `/etc/nginx/conf.d/default.conf` 文件包含以下内容：
     ```nginx
     server {
        server_name your-proxy.domain.name; #请替换为你的实际域名
        location / {
          proxy_pass http://localhost:5006;
        }
     }
     ```
2. **重启 nginx**：
   - 执行命令：`sudo systemctl restart nginx`
3. **安装 Node.js v22 或更高版本**：
   - 执行以下命令：
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
     source ~/.bashrc
     nvm install v22
     ```
4. **克隆仓库**：
   - 执行命令：`git clone https://github.com/netptop/siteproxy.git`
5. **进入项目目录**：
   - 执行命令：`cd siteproxy`
6. **测试运行**：
   - 执行命令：`node bundle.cjs`
   - 如果没有错误，按 `Ctrl+C` 结束程序。
7. **配置文件修改**：
   - 打开并修改 `config.json` 文件，内容如下：
     ```json
     {
        "proxy_url": "https://your-proxy.domain.name", // 替换为HTTPS加你的代理服务器域名，确保使用 https
        "token_prefix": "/user-SetYourPasswordHere/",  // 设置网站密码，用于防止非法访问，首尾的斜杠必须保留。为空表示不设置密码
        "local_listen_port": 5006, // 不要修改，以确保与 nginx 配置一致
        "description": "注意：token_prefix 相当于网站密码，请谨慎设置。 proxy_url 和 token_prefix 合起来就是访问网址。"
     }
     ```
8. **安装 Forever**：
   - 执行命令：`npm install -g forever`
9. **启动应用**：
   - 执行命令：`forever stopall && forever start bundle.cjs`
10. **访问代理服务**：
   - 现在可以通过 `https://your-proxy-domain.com/user-your-password/` 访问代理服务。请将域名和密码替换为你自己的域名和密码。
11. **使用 Cloudflare 加速（可选）**：
    - 参考 Cloudflare 的官方说明进行设置。

现在，你的代理服务已经成功部署并可以通过浏览器访问。


## Docker 部署
1. **配置 SSL 证书和 Nginx**：
   - 配置域名对应的 SSL 证书和 Nginx，将其指向本地的 5006 端口。
2. **克隆仓库**：
   - 执行命令：`git clone https://github.com/netptop/siteproxy.git`
3. **编辑配置文件**：
   - 打开并修改 `config.json` 文件，内容如下：
     ```json
     {
        "proxy_url": "https://your-proxy-domain.com", // 替换为你申请到的代理服务器域名
        "token_prefix": "/user-SetYourPasswordHere/",  // 设置网站密码，用于防止非法访问，保留首尾的斜杠
        "description": "注意：token_prefix 相当于网站密码，请谨慎设置。 proxy_url 和 token_prefix 合起来就是访问网址。"
     }
     ```
   - 保存文件。
4. **启动 Docker 容器**：
   - 进入 `docker-node` 子目录。
   - 执行命令：`sudo docker compose up`
5. **访问代理服务**：
   - 现在可以通过 `https://your-proxy-domain.com/user-your-password/` 访问代理服务。请将域名和密码替换为你自己的域名和密码。

## 感谢
 - netptop.com 默认主页由 Telgram 网友 SenZyo 设计, 感谢贡献！
 - 文档由 [LAGSNES](https://github.com/SNESNya) 编写

## 联系方式
Telegram群: https://siteproxy.t.me
E-mail: [netptop@gmail.com](mailto:netptop@gmail.com)
