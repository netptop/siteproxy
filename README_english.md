# Siteproxy 2.0
<br>
Siteproxy 2.0 uses a service worker to make the proxy more stable, enabling it to support a wider range of websites. It replaces Express with Hono, which increases the speed by four times. It supports deployment on Cloudflare Workers. This reverse proxy allows for the access to YouTube/Google without the need for a VPN, and supports login for GitHub and Telegram web (please be cautious not to log in through untrusted proxies). It's a purely web-based online proxy that requires no configuration on the client's side, acting as a reverse proxy to the internet.
<br>
Please do not use this project for illegal purposes, or you will bear the consequences.
<br>
Note: To reduce the risk of phishing, the code of siteproxy 2.0 is obfuscated, and the modification of the default homepage URL is prohibited.

## Contents
- [Features](#features)
- [Usage Tips](#usage-tips)
- [Deploying to Cloudflare Worker](#deploying-to-cloudflare-worker)
- [Deploying to VPS or Cloud Server](#deploying-to-vps-or-cloud-server)
- [Docker deployment](#docker-deployment)
- [Contact Information](#contact-information)

### Features
- Replaces Express with Hono, improving speed by four times.
- Supports deployment on Cloudflare Workers.
- Supports password-controlled access to the proxy; only those with the password can access the proxy.
- No configuration is required on the client side; simply access the proxy URL to reach the entire world.
- Supports login for GitHub and Telegram web.
- Uses RSA+AES encryption to protect user login passwords to reduce the risk of man-in-the-middle attacks.
- By entering the deployed Siteproxy proxy URL, you can access the entire world and hide your IP.
- No software installation is required on the client side, and the client's browser does not need any configuration.

### Usage Tips
1. You can use the deployed Siteproxy to perform a git clone, for example:
```
git clone https://your-proxy-domain.name/user-your-password/https/github.com/the-repo-to-clone
```

### Deploying to Cloudflare Worker
- Assume your domain is already managed under Cloudflare (in case you want to use your domain name)
- Git clone this project and use a text editor to open build/worker.js. You can also download this file directly, here is the [link](https://raw.githubusercontent.com/netptop/siteproxy/master/build/worker.js)
- Search for the string http://localhost:5006 and replace it with your proxy server's domain, such as https://your-proxy-domain.name. Must be https please. Also, search for user22334455 and change it to a password of your choosing, empty password means no password is needed.
- Create a worker and edit it by copying and pasting the modified worker.js into the worker, then save and deploy.
- If you use cloudflare worker domain, skip this step, If you want to use your own domain name, on the Workers & Pages page, open the worker you just saved, click 'Settings'->'Triggers' at the top, then 'Add custom domain', setting it to your proxy domain.
- Now you can directly access https://your-proxy-domain.name/user-your-password/, don't miss the last '/' please. And please replace the domain and password with your own.

### Deploying to VPS or Cloud Server
- node v21 or above version is needed.
```
1. Set up an SSL website (using Certbot and Nginx, Google for instructions) and configure Nginx. Your /etc/nginx/conf.d/default.conf should include the following:
   ...
   server {
      server_name your-proxy.domain.name
      location / {
        proxy_pass       http://localhost:5006;
      }
   }
2. Execute: sudo systemctl restart nginx
3. Install Node v21 or above version in user space, if you don't already have Node v21 installed:
   (1)curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   (2)source ~/.bashrc
   (3)nvm install v21
4. Execute: git clone https://github.com/netptop/siteproxy.git;
5. Execute: cd siteproxy;
6. Test if it can run: node bundle.js, if there are no errors, end the program with Ctrl+C.
7. Open and modify the config.json file, saving it:
   {
      "proxy_url": "https://your-proxy.domain.name", // This is your proxy server domain, must be https please.
      "token_prefix": "/user-SetYourPasswordHere/",  // This acts as your site password to prevent unauthorized access. Keep the slashes at the start and end. empty password means no password is needed.
      "local_listen_port": 5006, // Do not modify this, to keep it consistent with the previous nginx configuration.
      "description": "Note: The token_prefix acts as the site password. Please set it carefully. The proxy_url combined with the token_prefix forms the access URL."
   }
8. Install forever: npm install -g forever;
9 .Execute: forever stopall; forever start bundle.js
10. Now you can access your domain in the browser, the URL is the aforementioned proxy_url followed by token_prefix.
11. If you want to use CloudFlare for acceleration, you can refer to the CloudFlare instructions.
```
### Docker deployment
```
1. Configure the domain's SSL certificate and nginx, directing it to the local port 5006.
2. Git clone this project.
3. Open and modify the config.json file then save it:
   {
      "proxy_url": "https://your-proxy.domain.name", // This is the domain name of your proxy server
      "token_prefix": "/user-SetYourPasswordHere/",  // This is essentially your website password, used to prevent unauthorized access. Be sure to retain the slashes at the start and end.
      "description": "Note: The token_prefix acts as a website password, please set it carefully. The proxy_url combined with the token_prefix forms the access URL."
   }
4. Enter the docker-node subdirectory. sudo docker compose up
5. Now, you can directly access https://your-proxy-domain.name/user-your-password/, and it should work. Note that you should replace the domain and password with your own.
```
### Contact Information
Telegram group: @siteproxy
<br />
email: netptop@gmail.com
