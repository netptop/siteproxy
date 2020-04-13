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
 1. user browser url: https://siteproxy.herokuapp.com/https/www.google.com
 2. siteproxy.herokuapp.com received the url and request www.google.com, and get response from www.google.com
 3. siteproxy replace all returned strings in javascript/html:
    https://www.google.com => https://siteproxy.herokuapp.com/https/www.google.com
    url(/xxx) => url(/https/www.google.com/xxx)
    https://xxx => https://siteproxy.herokuapp.com/https/xxx
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

## 部署到now.sh服务器/now.sh deployment
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
## 部署到vps服务器/vps deployment
```
1. create ssl website(using certbot and nginx), and configure nginx as follow:
   vi /etc/nginx/sites-available/default:
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
4. cd siteproxy
5. find your domain name from now cli, then replace serverName in 'config.js', like:
   serverName: 'siteproxy.herokuapp.com' ====> 'siteproxy.your.domain.name'
6. change "blockedSites = ['www.youtube.com', 'm.youtube.com']" ====> "blockedSites = []" if you want to support youtube
7. forever start -c 'node --tls-min-v1.0' index.js
8. done
```
1. register one now.sh account from https://zeit.co/home
## Telegram群: @siteproxy
## email: netptop@gmail.com

## issues
- 部分网站加载有问题;
- twitter访问有问题;
