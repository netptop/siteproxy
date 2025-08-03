# SiteProxy 2.0
- [Chinese ver](README.md)

SiteProxy is a **powerful online proxy tool** that leverages the latest technology to enhance proxy stability and compatibility. We are committed to providing a **simple, efficient, and secure** proxy service, delivering the best internet access experience for users.

- **Ultra-High Performance**: Utilizes Hono instead of traditional Express servers, achieving a 4x performance boost for a smoother user experience.
- **Cloud Deployment**: Seamlessly supports Cloudflare Worker deployment, fast and efficient.
- **AI-Powered Chat**: Integrates DuckDuckGo AI Chat, offering free access to GPT-3.5 and Claude 3, making your proxy service smarter.
- **Advanced Security Protection**: Supports password-controlled proxy access, ensuring only authorized users can connect, significantly enhancing security.
- **Zero Configuration**: No client-side setup required; simply visit the proxy URL to access the global internet.
- **Convenient Login**: Fully supports GitHub and Telegram Web login, making operations simple and fast.
- **Robust Encryption**: Employs `RSA + AES` dual encryption to protect user login credentials and prevent man-in-the-middle attacks.
- **Privacy Protection**: Access the global internet through the proxy URL while hiding your real IP address to safeguard privacy.
- **Seamless Experience**: No software installation or browser configuration required, providing an exceptionally convenient user experience.

<details>
  <summary>View Architecture</summary>

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
> Strictly prohibited to use this project for any illegal purposes; violators bear the consequences.

> [!WARNING]
> To reduce phishing risks, SiteProxy 2.0 obfuscates its code and prohibits modification of the default homepage URL.

## Notes

- Recommended to deploy using VPS or Docker. Cloudflare deployment may result in some websites being inaccessible due to IP restrictions imposed by certain sites.
- Recommended to use DuckDuckGo for searches, as Google Search and YouTube have implemented anti-ad and anti-bot mechanisms that may limit access.

## Deploy to Cloudflare Pages
1. **Ensure Domain Management**:
   - Confirm your domain is managed under Cloudflare.
2. **Clone Repository and Install Dependencies**:
   - Ensure Node.js v22 or higher and Git are installed.
   - Run: `git clone https://github.com/netptop/siteproxy.git`
   - Run: `cd siteproxy`
   - Run: `npm install`
3. **Create Cloudflare Page (Skip if already created)**:
   - Go to **Workers and Pages**, select **Create using direct upload**, and upload the `siteproxy/build/cf_page` directory for deployment.
4. **Configure Custom Domain (Skip if already configured)**:
   - In **Workers & Pages**, open the deployed Page.
   - Click **Custom Domains** at the top, select **Add Custom Domain**, set your proxy domain, and activate it.
5. **Edit Configuration File**:
   - Open `siteproxy/wrangler.jsonc` with a text editor, modify the following fields, and save:
     ```json
     "name": "xxx", // Replace with your Cloudflare Page name
     "proxy_url": "https://your-proxy-domain.com", // Replace with your proxy server domain, must be HTTPS
     "token_prefix": "/default/" // Replace with your desired access password. Keep leading/trailing slashes. Empty password means no password is required.
     ```
6. **Redeploy Page**:
   - In the cloned `siteproxy` directory, run: `npm run wrangler-login`. For non-GUI VPS environments, refer to [non-GUI wrangler login](api_token_setup.md).
   - Run: `npm run deploy-cf-page`
7. **Access Proxy Service**:
   - Visit `https://your-proxy-domain.com/your-password/` to access the proxy service (ensure the trailing slash is included). Replace the domain and password with your own.

## Deploy to Cloudflare Workers
1. **Ensure Domain Management**:
   - Confirm your domain is managed under Cloudflare.
2. **Clone Repository and Install Dependencies**:
   - Ensure Node.js v22 or higher and Git are installed.
   - Run: `git clone https://github.com/netptop/siteproxy.git`
   - Run: `cd siteproxy`
   - Run: `npm install`
3. **Create Worker (Skip if already created)**:
   - Log in to Cloudflare, go to **Workers and Pages**, and create a 'hello world' Worker with your chosen name.
4. **Configure Custom Domain (Skip if already configured)**:
   - In **Workers & Pages**, open the saved Worker.
   - Click **Settings -> Custom Domains**, set your proxy domain, and activate it.
5. **Edit Configuration File**:
   - Open `siteproxy/wrangler.worker.jsonc` with a text editor, modify the following fields, and save:
     ```json
     "name": "xxx", // Replace with your Cloudflare Worker name
     "proxy_url": "https://your-proxy-domain.com", // Replace with your proxy server domain, must be HTTPS
     "token_prefix": "/xxx/" // Replace with your desired access password. Keep leading/trailing slashes. Empty password means no password is required.
     ```
6. **Redeploy Worker**:
   - In the cloned `siteproxy` directory, run: `npm run wrangler-login`. For non-GUI VPS environments, refer to [non-GUI wrangler login](api_token_setup.md).
   - Run: `npm run deploy-cf-worker`
7. **Access Proxy Service**:
   - Visit `https://your-proxy-domain.com/your-password/` to access the proxy service (ensure the trailing slash is included). Replace the domain and password with your own.

## Deploy to VPS or Cloud Server
1. **Set Up SSL Website**:
   - Use `certbot` and `nginx` to create an SSL website. Search Google for specific instructions.
   - Configure `nginx` to include the following in `/etc/nginx/conf.d/default.conf`:
     ```nginx
     server {
        server_name your-proxy.domain.name; # Replace with your actual domain
        location / {
          proxy_pass http://localhost:5006;
        }
     }
     ```
2. **Restart Nginx**:
   - Run: `sudo systemctl restart nginx`
3. **Install Node.js v22 or Higher**:
   - Run:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
     source ~/.bashrc
     nvm install v22
     ```
4. **Clone Repository**:
   - Run: `git clone https://github.com/netptop/siteproxy.git`
5. **Enter Project Directory**:
   - Run: `cd siteproxy`
6. **Test Run**:
   - Run: `node bundle.cjs`
   - If no errors, press `Ctrl+C` to stop the program.
7. **Modify Configuration File**:
   - Open and edit `config.json` with the following content:
     ```json
     {
        "proxy_url": "https://your-proxy.domain.name", // Replace with HTTPS and your proxy server domain
        "token_prefix": "/user-SetYourPasswordHere/",  // Set website password to prevent unauthorized access; keep leading/trailing slashes. Empty means no password
        "local_listen_port": 5006, // Do not modify to ensure compatibility with nginx configuration
        "description": "Note: token_prefix acts as the website password; set it carefully. proxy_url and token_prefix combine to form the access URL."
     }
     ```
8. **Install Forever**:
   - Run: `npm install -g forever`
9. **Start Application**:
   - Run: `forever stopall && forever start bundle.cjs`
10. **Access Proxy Service**:
    - Visit `https://your-proxy-domain.com/user-your-password/` to access the proxy service. Replace the domain and password with your own.
11. **Use Cloudflare Acceleration (Optional)**:
    - Refer to Cloudflare’s official documentation for setup instructions.

## Docker Deployment
1. **Configure SSL Certificate and Nginx**:
   - Set up an SSL certificate and Nginx for your domain, pointing to local port 5006.
2. **Clone Repository**:
   - Run: `git clone https://github.com/netptop/siteproxy.git`
3. **Edit Configuration File**:
   - Open and modify `config.json` with the following content:
     ```json
     {
        "proxy_url": "https://your-proxy-domain.com", // Replace with your proxy server domain
        "token_prefix": "/user-SetYourPasswordHere/",  // Set website password to prevent unauthorized access; keep leading/trailing slashes
        "description": "Note: token_prefix acts as the website password; set it carefully. proxy_url and token_prefix combine to form the access URL."
     }
     ```
   - Save the file.
4. **Start Docker Container**:
   - Enter the `docker-node` subdirectory.
   - Run: `sudo docker compose up`
5. **Access Proxy Service**:
   - Visit `https://your-proxy-domain.com/user-your-password/` to access the proxy service. Replace the domain and password with your own.

## Acknowledgments
- The default homepage of netptop.com was designed by Telegram user SenZyo. Thank you for your contribution!
- Documentation written by [LAGSNES](https://github.com/SNESNya).

## Contact
Telegram Group: https://siteproxy.t.me  
E-mail: [netptop@gmail.com](mailto:netptop@gmail.com)