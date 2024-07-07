const someHTML = `
<!DOCTYPE html>
<html lang="zh-Hans">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Siteproxy</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            font-family: sans-serif;
            color: #a89e84;
            background-color: #fdf6e3;
            transition: background-color 0.3s, color 0.3s;
        }

        body.dark-mode {
            color: #dddddd;
            background-color: #000000;
        }

        .container {
            width: 80%;
        }

        h1 {
            display: inline-block;
            color: #a89e84;
            margin: 100px 0 62px 0;
        }

        .dark-mode h1 {
            color: #dddddd;
        }

        .logo {
            display: inline-block;
            margin-left: 10px;
            fill: #a89e84;
        }

        .dark-mode .logo svg {
            fill: #dddddd;
        }

        .search-box {
            width: 100%;
            padding: 10px;
            margin-bottom: 40px;
            font-size: 18px;
            color: #a89e84;
            border: 2px solid #a89e84;
            background-color: #f5f5f5;
            border-radius: 5px;
            outline: none;
            box-sizing: border-box;
        }

        .dark-mode .search-box {
            color: #ffffff;
            border-color: #777777;
            background-color: #333333;
        }

        .dark-mode {
            border-color: #777777;
            background-color: #333333;
        }

        .dark-mode {
            color: #ffffff;
            background-color: #555555;
        }

        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            cursor: pointer;
        }

        h3 {
            color: #a89e84;
            margin: 20px 0 10px 0;
        }

        .dark-mode h3 {
            color: #dddddd;
        }

        hr {
            border: 1px solid #a89e84;
            margin-bottom: 15px;
        }

        .dark-mode hr {
            border-color: #777777;
        }

        .websites {
            display: flex;
            flex-wrap: wrap;
        }

        .website {
            display: inline-block;
            padding: 5px 10px;
            margin: 10px 10px 10px 0;
            text-decoration: none;
            color: #a89e84;
            border: 2px solid #a89e84;
            background-color: #eee8d5;
            border-radius: 3px;
        }

        .dark-mode .website {
            color: #dddddd;
            border-color: #777777;
            background-color: #333333;
        }

        .footer {
            position: relative;
            width: 100%;
            margin: 100px 0 38px 0;
            text-align: center;
        }

        a {
            color: #a89e84;
            text-decoration: none;
        }

        .dark-mode a {
            color: #dddddd;
        }
    </style>
</head>

<body>
    <div class="theme-toggle">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <path
                d="M736 624A399.52 399.52 0 0 1 352.48 110.944a416 416 0 1 0 599.616 449.344A397.728 397.728 0 0 1 736 624z"
                fill="#000000"></path>
        </svg>
    </div>
    <div class="container">
        <h1>Siteproxy</h1>
        <div class="logo">
            <a href="https://github.com/netptop/siteproxy" target="_blank">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <title>GitHub</title>
                    <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
            </a>
        </div>
        <div class="logo">
            <a href="https://t.me/siteproxy" target="_blank">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <title>Telegram</title>
                    <path
                        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            </a>
        </div>
        <div class="websites">
            <input type="text" class="search-box" placeholder="输入要访问的网址。。。" />
        </div>
        <h3>搜索引擎</h3>
        <hr>
        <div class="websites">
            <div><a class="website" href="https://www.google.com" target="_blank">Google IPv4</a></div>
            <div><a class="website" href="https://ipv6.google.com" target="_blank">Google IPv6</a></div>
            <div><a class="website" href="https://duckduckgo.com" target="_blank">DuckDuckGo</a></div>
            <div><a class="website" href="https://www.bing.com" target="_blank">Bing</a></div>
        </div>
        <h3>常用网站</h3>
        <hr>
        <div class="websites">
            <div><a class="website" href="https://duckduckgo.com/aichat" target="_blank">DuckDuckGo AI Chat</a></div>
            <div><a class="website" href="https://zh.wikipedia.org/" target="_blank">Wikipedia</a></div>
            <div><a class="website" href="https://www.youtube.com/?gl=US" target="_blank">YouTube</a></div>
            <div><a class="website" href="https://x.com/" target="_blank">X / Twitter</a></div>
            <div><a class="website" href="https://www.apkmirror.com/" target="_blank">APKMirror</a></div>
            <div><a class="website" href="https://web.telegram.org/" target="_blank">Web Telegram</a></div>
        </div>
        <h3>新闻网站</h3>
        <hr>
        <div class="websites">
            <div><a class="website" href="https://www.voachinese.com/" target="_blank">美国之音</a></div>
            <div><a class="website" href="https://cn.nytimes.com/" target="_blank">纽约时报</a></div>
            <div><a class="website" href="https://www.reuters.com/" target="_blank">路透社</a></div>
            <div><a class="website" href="https://cn.wsj.com/" target="_blank">华尔街日报</a></div>
            <div><a class="website" href="https://www.dw.com/zh/" target="_blank">德国之声</a></div>
            <div><a class="website" href="https://news.creaders.net/breaking/" target="_blank">万维读者</a></div>
            <div><a class="website" href="https://udn.com/news/breaknews/" target="_blank">聯合新聞網</a></div>
            <div><a class="website" href="https://www.rfi.fr/cn/" target="_blank">法国国际广播电台</a></div>
            <div><a class="website" href="https://cnnews.chosun.com/" target="_blank">朝鲜日报</a></div>
            <div><a class="website" href="https://std.stheadline.com/" target="_blank">星島日報</a></div>
        </div>
        <h3>海外论坛</h3>
        <hr>
        <div class="websites">
            <div><a class="website" href="https://www.wenxuecity.com/" target="_blank">文学城</a></div>
            <div><a class="website" href="https://www.6parknews.com/" target="_blank">留园网</a></div>
            <div><a class="website" href="https://www.iask.ca/" target="_blank">加拿大家园</a></div>
        </div>
        <div class="footer">
            <p>本站内容源自互联网, 如有内容侵犯了你的权益, 请联系删除相关内容, 联系邮箱: <a href="mailto:netptop@gmail.com">netptop@gmail.com</a></p>
            <p id="copyright"></p>
        </div>
    </div>
    <script>
        const currentYear = new Date().getFullYear();
        document.getElementById("copyright").innerHTML = "Copyright 2020-" + currentYear + " <a href='https://github.com/netptop/siteproxy' target='_blank'>siteproxy</a> All Rights Reserved";
    </script>
    <script>
        const searchBox = document.querySelector('.search-box');
        const themeToggle = document.querySelector('.theme-toggle');
        window.addEventListener('load', () => {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark-mode') {
                document.body.classList.add('dark-mode');
                const svg = themeToggle.querySelector('svg');
                svg.innerHTML = \`<path d="M511.998465 305.797661c-113.855094 0-206.190059 92.332918-206.190059 206.182896 0 113.888863 92.334965 206.145034 206.190059 206.145034 113.89398 0 206.154243-92.295056 206.154243-206.145034S625.892445 305.797661 511.998465 305.797661L511.998465 305.797661zM511.998465 202.705702c18.992563 0 34.364669-15.371082 34.364669-34.322713L546.363134 99.652628c0-18.9854-15.372106-34.362622-34.364669-34.362622-18.9854 0-34.363645 15.377222-34.363645 34.362622l0 68.730361C477.63482 187.367365 493.013065 202.705702 511.998465 202.705702L511.998465 202.705702zM511.998465 821.216527c-18.9854 0-34.363645 15.415085-34.363645 34.362622l0 68.728314c0 19.024286 15.378246 34.401508 34.363645 34.401508 18.992563 0 34.364669-15.377222 34.364669-34.401508L546.363134 855.579149C546.363134 836.631612 530.990005 821.216527 511.998465 821.216527L511.998465 821.216527zM924.306952 477.618958l-68.728314 0c-18.990516 0-34.367739 15.375176-34.367739 34.361599 0 18.989493 15.377222 34.362622 34.367739 34.362622l68.728314 0c19.024286 0 34.401508-15.373129 34.401508-34.362622C958.70846 492.995157 943.331237 477.618958 924.306952 477.618958L924.306952 477.618958zM202.71133 511.98158c0-18.986423-15.371082-34.361599-34.363645-34.361599l-68.693522 0c-18.948561 0-34.363645 15.375176-34.363645 34.361599 0 18.989493 15.415085 34.362622 34.363645 34.362622l68.732407 0C187.37197 546.344203 202.71133 530.97005 202.71133 511.98158L202.71133 511.98158zM779.289114 293.326629l48.585555-48.583508c13.443174-13.443174 13.443174-35.18536 0-48.585555-13.400195-13.405311-35.18229-13.405311-48.585555 0l-48.626487 48.585555c-13.367449 13.403265-13.367449 35.218106 0 48.583508C744.029052 306.730916 765.810125 306.730916 779.289114 293.326629L779.289114 293.326629zM244.710886 730.633463l-48.586578 48.624441c-13.404288 13.366426-13.404288 35.146475 0 48.585555 13.405311 13.44215 35.149545 13.44215 48.586578 0l48.586578-48.585555c13.404288-13.43908 13.443174-35.218106 0-48.624441C279.89727 717.270107 258.153036 717.270107 244.710886 730.633463L244.710886 730.633463zM779.289114 730.633463c-13.440104-13.364379-35.222199-13.364379-48.626487 0-13.405311 13.366426-13.367449 35.147498 0 48.624441l48.626487 48.585555c13.365402 13.44215 35.146475 13.44215 48.585555 0 13.443174-13.401218 13.443174-35.180244 0-48.585555L779.289114 730.633463 779.289114 730.633463zM244.710886 196.120726c-13.438057-13.405311-35.18229-13.405311-48.586578 0-13.404288 13.403265-13.404288 35.145451 0 48.584532l48.586578 48.584532c13.405311 13.405311 35.187407 13.443174 48.586578 0 13.443174-13.365402 13.404288-35.180244 0-48.584532L244.710886 196.120726 244.710886 196.120726zM244.710886 196.120726" fill="#ffffff"></path>\`;
            }
        });

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const svg = themeToggle.querySelector('svg');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark-mode');
                svg.innerHTML = \`<path d="M511.998465 305.797661c-113.855094 0-206.190059 92.332918-206.190059 206.182896 0 113.888863 92.334965 206.145034 206.190059 206.145034 113.89398 0 206.154243-92.295056 206.154243-206.145034S625.892445 305.797661 511.998465 305.797661L511.998465 305.797661zM511.998465 202.705702c18.992563 0 34.364669-15.371082 34.364669-34.322713L546.363134 99.652628c0-18.9854-15.372106-34.362622-34.364669-34.362622-18.9854 0-34.363645 15.377222-34.363645 34.362622l0 68.730361C477.63482 187.367365 493.013065 202.705702 511.998465 202.705702L511.998465 202.705702zM511.998465 821.216527c-18.9854 0-34.363645 15.415085-34.363645 34.362622l0 68.728314c0 19.024286 15.378246 34.401508 34.363645 34.401508 18.992563 0 34.364669-15.377222 34.364669-34.401508L546.363134 855.579149C546.363134 836.631612 530.990005 821.216527 511.998465 821.216527L511.998465 821.216527zM924.306952 477.618958l-68.728314 0c-18.990516 0-34.367739 15.375176-34.367739 34.361599 0 18.989493 15.377222 34.362622 34.367739 34.362622l68.728314 0c19.024286 0 34.401508-15.373129 34.401508-34.362622C958.70846 492.995157 943.331237 477.618958 924.306952 477.618958L924.306952 477.618958zM202.71133 511.98158c0-18.986423-15.371082-34.361599-34.363645-34.361599l-68.693522 0c-18.948561 0-34.363645 15.375176-34.363645 34.361599 0 18.989493 15.415085 34.362622 34.363645 34.362622l68.732407 0C187.37197 546.344203 202.71133 530.97005 202.71133 511.98158L202.71133 511.98158zM779.289114 293.326629l48.585555-48.583508c13.443174-13.443174 13.443174-35.18536 0-48.585555-13.400195-13.405311-35.18229-13.405311-48.585555 0l-48.626487 48.585555c-13.367449 13.403265-13.367449 35.218106 0 48.583508C744.029052 306.730916 765.810125 306.730916 779.289114 293.326629L779.289114 293.326629zM244.710886 730.633463l-48.586578 48.624441c-13.404288 13.366426-13.404288 35.146475 0 48.585555 13.405311 13.44215 35.149545 13.44215 48.586578 0l48.586578-48.585555c13.404288-13.43908 13.443174-35.218106 0-48.624441C279.89727 717.270107 258.153036 717.270107 244.710886 730.633463L244.710886 730.633463zM779.289114 730.633463c-13.440104-13.364379-35.222199-13.364379-48.626487 0-13.405311 13.366426-13.367449 35.147498 0 48.624441l48.626487 48.585555c13.365402 13.44215 35.146475 13.44215 48.585555 0 13.443174-13.401218 13.443174-35.180244 0-48.585555L779.289114 730.633463 779.289114 730.633463zM244.710886 196.120726c-13.438057-13.405311-35.18229-13.405311-48.586578 0-13.404288 13.403265-13.404288 35.145451 0 48.584532l48.586578 48.584532c13.405311 13.405311 35.187407 13.443174 48.586578 0 13.443174-13.365402 13.404288-35.180244 0-48.584532L244.710886 196.120726 244.710886 196.120726zM244.710886 196.120726" fill="#ffffff"></path>\`;
            } else {
                localStorage.setItem('theme', 'light-mode');
                svg.innerHTML = \`<path d="M736 624A399.52 399.52 0 0 1 352.48 110.944a416 416 0 1 0 599.616 449.344A397.728 397.728 0 0 1 736 624z" fill="#000000"></path>\`;
            }
        });

        searchBox.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                navigate();
            }
        });

        function navigate() {
            let inputText = searchBox.value.trim();
            if (!inputText.startsWith('http://') && !inputText.startsWith('https://')) {
                inputText = 'https://' + inputText;
            }
            window.open(inputText, '_blank');
        }
    </script>
</body>
</html>
`
/**
 * rawHtmlResponse delievers a response with HTML inputted directly
 * into the worker script
 * @param {string} html
 */
async function rawHtmlResponse(html) {
    const init = {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    };
    return new Response(html, init);
}

addEventListener('fetch', event => {
    const { url } = event.request;
    return event.respondWith(rawHtmlResponse(someHTML));
})