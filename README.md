# siteproxy
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

## features
- enter siteproxy's address, and go surf on internet without censorship
- no proxy setting from client side is needed. zero configuration from client browser
- easy deployment to now.sh
- support downloading files

## Mechanism
```
 1. user browser url: https://siteproxy.now.sh/https/www.google.com
 2. siteproxy.now.sh received the url and request www.google.com, and get response from www.google.com
 3. siteproxy replace all returned strings in javascript/html:
    https://www.google.com => https://siteproxy.now.sh/https/www.google.com
    url(/xxx) => url(/https/www.google.com/xxx)
    https://xxx => https://siteproxy.now.sh/https/xxx
    etc.
 4. send back the modified html/javascript to user browser.
```

## supported websites
```
1. www.google.com, and search action.
2. www.youtube.com, only firefox browser is supported.
3. zh.wikipedia.org, and search action.
4. facebook, login is not verified.
5. other websites.
```

## 部署到now.sh服务器/deployment
```
1. register one now.sh account from https://zeit.co/home
2. npm install -g now
3. git clone https://github.com/netptop/siteproxy.git
4. cd siteproxy
5. now
6. find your domain name from now cli, then replace serverName in 'config.js', like:
   serverName: 'siteproxy.now.sh' ====> 'your-domain-name.now.sh'
7. now --prod
8. done
```
## Telegram群: @siteproxy
## email: netptop@gmail.com

## issues
- 部分网站加载有问题;
- twitter访问有问题;
