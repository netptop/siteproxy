# SiteProxy 2.0
 - [简体中文](README.md)

SiteProxy is a **powerful online proxy tool** that uses the latest technology to improve proxy stability and compatibility. We are committed to providing **simple, efficient, and secure** proxy services to offer users the best internet access experience.
- **Ultra-high performance**: Replaces traditional Express servers with Hono, improving performance by 4 times for a smoother user experience.
- **Cloud deployment**: Fully supports deployment on Cloudflare Workers, which is fast and efficient.
- **AI intelligent chat**: Integrates DuckDuckGo AI Chat, providing free access to GPT-3.5 and Claude 3, making your proxy service smarter.
- **Advanced security protection**: Supports password control for the proxy, allowing only authorized users to access it, greatly enhancing security.
- **Zero-configuration usage**: Users do not need any client configuration; simply access the proxy URL to browse the global internet.
- **Convenient login**: Fully supports GitHub and Telegram Web login, with simple and quick operations.
- **Strong encryption**: Uses `RSA + AES` dual encryption technology to protect user login passwords and prevent man-in-the-middle attacks.
- **Privacy protection**: Accesses the global internet through the proxy URL while hiding the user's real IP to protect privacy.
- **Seamless experience**: No software installation or browser configuration is required; you can use it immediately for ultimate convenience.
<details>
  <summary>View Principle</summary>

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
> Strictly prohibited to use this project for any illegal purposes, otherwise bear the consequences yourself.
> [!WARNING]
> Due to support for login to multiple websites, to reduce phishing risks, SiteProxy has obfuscated the code in version 2.0 and prohibited modification of the default homepage URL.
## Showcase
From a Telegram user, showcasing SiteProxy after deployment with optimized IP, speed test results: 
![Download Speed test](https://raw.githubusercontent.com/netptop/siteproxy/master/test.png)
## Deploy to Cloudflare Pages
1. **Ensure domain management**:
   - Ensure that your domain is managed under Cloudflare.
2. **Clone repository and install dependencies**:
   - Ensure Node.js version 22 or higher is installed, and ensure Git is installed.
   - Run the command: `git clone https://github.com/netptop/siteproxy.git`
   - Run the command: `cd siteproxy`
   - Run the command: `npm install`
3. **Log in to Cloudflare and create a page, if already created, skip this step**:
   - Go to the **Workers and Pages** section, select **Create a Page using direct upload**, and upload the `siteproxy/build/cf_page` directory that you just cloned for deployment.
4. **Configure custom domain, if already configured, skip this step**:
   - In the **Workers & Pages** page, open the Page you just deployed.
   - Click on **Custom Domains** at the top, then select **Add a custom domain**, set it to your proxy domain, and activate the domain.
5. **Edit configuration file**:
   - Open the `siteproxy/wrangler.jsonc` file with a text editor, modify the following fields and save:
      "name": "xxx", // Replace with the name of your Cloudflare Page
      "proxy_url": "https://your-proxy-domain.com", // Replace with your proxy server domain, must be HTTPS
      "token_prefix": "/default/" // Replace with the access password you want to set. If the password is empty, no password is required for access.
6. **Re-deploy the page**:
   - In the cloned siteproxy directory, run: `npm run wrangler-login`
   - Run: `npm run deploy-cf-page`
7. **Access the proxy service**:
   - Now you can access the proxy service via `https://your-proxy-domain.com/your-password/` (ensure the trailing slash exists). Remember to replace the domain and password with your own.
## Deploy to Cloudflare Workers
1. **Ensure domain management**:
   - Ensure that your domain is managed under Cloudflare.
2. **Clone repository and install dependencies**:
   - Ensure Node.js version 22 or higher is installed, and ensure Git is installed.
   - Run the command: `git clone https://github.com/netptop/siteproxy.git`
   - Run the command: `cd siteproxy`
   - Run the command: `npm install`
3. **Create a Worker, if already created, skip this step**:
   - Log in to Cloudflare, go to the **Workers and Pages** section, and create a 'hello world' Worker with your own name.
4. **Configure custom domain, if already configured, skip this step**:
   - In the **Workers and Pages** page, open the Worker you just saved.
   - Click on **Settings -> Custom Domains** at the top, set it to your proxy domain, and activate the custom domain.
5. **Edit configuration file**:
   - Open the `siteproxy/wrangler.worker.jsonc` file with a text editor, modify the following fields and save:
      "name": "xxx", // Replace with the name of your Cloudflare Worker
      "proxy_url": "https://your-proxy-domain.com", // Replace with your proxy server domain, must be HTTPS
      "token_prefix": "/xxx/" // Replace with the access password you want to set. If the password is empty, no password is required for access.
6. **Re-deploy the Worker**:
   - In the cloned siteproxy directory, run: `npm run wrangler-login`
   - Run: `npm run deploy-cf-worker`
7. **Access the proxy service**:
   - Now you can access the proxy service via `https://your-proxy-domain.com/your-password/` (ensure the trailing slash exists). Remember to replace the domain and password with your own.
## Deploy to VPS or Cloud Server
1. **Create an SSL website**:
   - Use `certbot` and `nginx` to create an SSL website. You can search Google for specific usage.
   - Configure `nginx` to ensure the `/etc/nginx/conf.d/default.conf` file contains the following:
     ```nginx
     server {
        server_name your-proxy.domain.name; # Replace with your actual domain
        location / {
          proxy_pass http://localhost:5006;
        }
     }
     ```
2. **Restart nginx**:
   - Run the command: `sudo systemctl restart nginx`
3. **Install Node.js version 22 or higher**:
   - Run the following commands:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
     source ~/.bashrc
     nvm install v22
     ```
4. **Clone the repository**:
   - Run the command: `git clone https://github.com/netptop/siteproxy.git`
5. **Enter the project directory**:
   - Run the command: `cd siteproxy`
6. **Test run**:
   - Run the command: `node bundle.cjs`
   - If there are no errors, press `Ctrl+C` to end the program.
7. **Modify configuration file**:
   - Open and edit the `config.json` file with the following content:
     ```json
     {
        "proxy_url": "https://your-proxy.domain.name", // Replace with HTTPS plus your proxy server domain, ensure it uses https
        "token_prefix": "/user-SetYourPasswordHere/",  // Set the website password to prevent unauthorized access, keep the leading and trailing slashes. Empty means no password is set
        "local_listen_port": 5006, // Do not modify to ensure consistency with nginx configuration
        "description": "Note: token_prefix acts as the website password, set it carefully. proxy_url and token_prefix together form the access URL."
     }
     ```
8. **Install Forever**:
   - Run the command: `npm install -g forever`
9. **Start the application**:
   - Run the command: `forever stopall && forever start bundle.cjs`
10. **Access the proxy service**:
    - Now you can access the proxy service via `https://your-proxy-domain.com/user-your-password/`. Please replace the domain and password with your own.
11. **Use Cloudflare for acceleration (optional)**:
    - Refer to Cloudflare's official documentation for setup.
Now, your proxy service has been successfully deployed and can be accessed via a browser.
## Docker Deployment
1. **Configure SSL certificate and Nginx**:
   - Configure the SSL certificate and Nginx for your domain, pointing to local port 5006.
2. **Clone the repository**:
   - Run the command: `git clone https://github.com/netptop/siteproxy.git`
3. **Edit configuration file**:
   - Open and modify the `config.json` file with the following content:
     ```json
     {
        "proxy_url": "https://your-proxy-domain.com", // Replace with the proxy server domain you applied for
        "token_prefix": "/user-SetYourPasswordHere/",  // Set the website password to prevent unauthorized access, keep the leading and trailing slashes
        "description": "Note: token_prefix acts as the website password, set it carefully. proxy_url and token_prefix together form the access URL."
     }
     ```
   - Save the file.
4. **Start the Docker container**:
   - Enter the `docker-node` subdirectory.
   - Run the command: `sudo docker compose up`
5. **Access the proxy service**:
   - Now you can access the proxy service via `https://your-proxy-domain.com/user-your-password/`. Please replace the domain and password with your own.
## Thanks
 - The default homepage of netptop.com was designed by Telegram user SenZyo, thank you for the contribution!
 - The documentation was written by [LAGSNES](https://github.com/SNESNya)
## Contact
Telegram group: https://siteproxy.t.me
E-mail: [netptop@gmail.com](mailto:netptop@gmail.com)
