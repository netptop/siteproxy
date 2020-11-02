# siteproxy
反向代理, 免翻墙访问youtube/twitter/google, 支持telegram web登录.
pure web page proxy to google/youtube, zero configuration from client side. Reverse proxy to all internet. 一键部署，翻墙利器。

```
                                                 +----> google/youtube
                             +----------------+  |
                             |                |  |
user browser +-------------->+ siteproxy      +-------> wikipedia
                             |                |  |
                             +----------------+  |
                                                 +----> chinese forums
```
请勿将本项目用于非法用途，否则后果自负。

## 目录

- [特点](#特点)
- [原理](#原理)
- [支持代理的网站](#支持代理的网站)
- [部署到cloudflare_worker](#部署到cloudflare_worker)
- [部署到now服务器](#部署到now服务器)
- [部署到heroku服务器](#部署到heroku服务器)
- [部署到vps服务器](#部署到vps服务器)
- [cloudflare_worker_deployment](#cloudflare_worker_deployment)
- [now_deployment](#now_deployment)
- [vps_deployment](#vps_deployment)
- [联系方式](#联系方式)

### 特点
- 代码量只有jsproxy的四分之一左右
- 不使用service worker，不会和网站本身的service worker冲突
- enter siteproxy's address, and go surf on internet without censorship
- no proxy setting from client side is needed. zero configuration from client browser
- easy deployment to now.sh
- support downloading files

### 原理
```
 1. user browser url: https://siteproxy.herokuapp.com/https/www.google.com
 2. siteproxy.herokuapp.com received the url and request www.google.com, and get response from www.google.com
 3. siteproxy replace all returned strings in javascript/html:
    https://www.google.com => https://siteproxy.herokuapp.com/https/www.google.com
    url(/xxx) => url(/https/www.google.com/xxx)
    https://xxx => https://siteproxy.herokuapp.com/https/xxx
    etc.
 4. send back the modified html/javascript to user browser.
```

### 支持代理的网站
```
1. www.google.com, and search action.
2. www.youtube.com, only firefox browser is supported.
3. zh.wikipedia.org, and search action.
4. facebook, login is not verified.
5. twitter, search in twitter, login is not supported.
6. telegram web login
7. 中文论坛等
```
### 部署到cloudflare_worker
```
1. 注册一个cloudflare账户
2. 在cloudflare上创建一个worker, 记下这个worker的子域名, 比如 abcd123.xxxx.workers.dev
3. 找到本repo的build/worker.js文件，用文本编辑器打开，搜索siteproxy.netptop.workers.dev，替换成你的子域名
4. 在cloudflare上编辑刚刚创建的worker， 将worker.js所有内容拷贝，覆盖粘贴到worker里面，保存
5. 现在应该可以在浏览器中 访问你的子域名了
```
### 部署到now服务器
```
(可能有问题，暂时没有now账户测试)
1. 注册一个now账户https://zeit.co/home
2. 没有github账户的话, 注册一个github账户,fork本repo
3. 在now的控制台里面创建一个应用, 且绑定到你刚才fork的repo上, 会得到一个域名类似的域名:your-domain-name.now.sh
4. 在github上修改你刚fork的repo, 将config.js里的serverName修改为你的新域名:
   serverName: 'siteproxy.netptop.com' ====> 'your-domain-name.now.sh'
5. 现在可以在浏览器里面访问你的新域名了:  https://your-domain-name.now.sh
```
### 部署到heroku服务器
```
1. 注册一个heroku账户: https://www.heroku.com/
2. 没有github账户的话, 注册一个github账户,fork本repo
3. 在heroku的控制台里面创建一个应用, 且绑定到你刚才fork的repo上, 会得到一个域名类似的域名:your-domain-name.herokuapp.com
4. 在heroku的'Deloy'页面, 点击'Enable Automatic Deploys'按钮
5. 在github上修改你刚fork的repo, 将procfile里的域名修改为你的新域名(记得不要加https前缀):
         "web: herokuAddr=siteproxy.herokuapp.com npm run start"
   ====> "web: herokuAddr=your-domain-name.herokuapp.com npm run start"
6. 现在可以在浏览器里面访问你的新域名了:  https://your-domain-name.herokuapp.com
```
### 部署到vps服务器
```
1. 创建一个ssl website(使用certbot and nginx, google下用法), 配置nginx,
   /etc/nginx/sites-enabled/default 需要包含以下内容:
   ...
   server {
      server_name siteproxy.your.domain.name
      location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass       http://127.0.0.1:8011;
      }
   }
2. 执行:sudo systecmctl start nginx
3. 用户环境下执行下列命令安装node环境, 如果你已经有node环境, 忽略这一步
   (1)curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
   (2)source ~/.bashrc
   (3)nvm install v12.16.3
3. 执行:npm install -g forever
4. 执行:git clone https://github.com/netptop/siteproxy.git;
5. 执行:cd siteproxy; npm install;
6. 打开config.js文件, 找到serverName定义的地方, 如下修改:
   serverName: 'siteproxy.herokuapp.com' ====> '这填你的域名'
7. 执行:forever start -c 'node --tls-min-v1.0' index.js
8. 现在就可以在浏览器中访问你的域名了.
9. 如果想套CloudFlare加速, 可以参考CloudFlare说明
```
### cloudflare_worker_deployment
```
1. register a cloudflare account
2. create a worker in cloudflare, remember worker's sub-domain name, like abcd123.xxxx.workers.dev
3. search build/worker.js in this repo, open it in a text editor, search and replace 'siteproxy.netptop.workers.dev' with your sub-domain name.
4. edit the worker just created in cloudflare, replace worker's content with content of build/worker.js, save.
5. done.
```

### now_deployment
```
1. register one now.sh account from https://zeit.co/home
2. npm install -g now
3. git clone https://github.com/netptop/siteproxy.git
4. cd siteproxy
5. now
6. find your domain name from now cli, then replace serverName in 'config.js', like:
   serverName: 'siteproxy.herokuapp.com' ====> 'your-domain-name.now.sh'
7. change "blockedSites = ['www.youtube.com', 'm.youtube.com']" ====> "blockedSites = []" if you want to support youtube
8. now --prod
9. done

```
### vps_deployment
```
1. create ssl website(using certbot and nginx), and configure nginx as follow:
   vi /etc/nginx/sites-enabled/default:
   ...
   server {
      server_name siteproxy.your.domain.name
      location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass       http://127.0.0.1:8011;
      }
   }
2. systecmctl start nginx
3. npm install -g forever
4. git clone https://github.com/netptop/siteproxy.git; 
5. cd siteproxy; npm install;
6. replace serverName in 'config.js', like:
   serverName: 'siteproxy.herokuapp.com' ====> 'siteproxy.your.domain.name'
7. forever start -c 'node --tls-min-v1.0' index.js
8. done, now you can access your domain name from browser.
```
### 联系方式
Telegram群: @siteproxy
<br />
email: netptop@gmail.com
