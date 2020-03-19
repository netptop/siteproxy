/**
 * @jest-environment node
 */
const axios = require('axios');

let httpprefix = 'https'
let serverName = `siteproxylocal.now.sh`
let port = '443'
if (process.env.localFlag === 'true') {
  httpprefix = 'http'
  serverName = '127.0.0.1'
  port = '8011'
}

test('search wikipedia, open it, then click link', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/zh.wikipedia.org/wiki/%E6%B5%8B%E8%AF%95`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${JSON.stringify(response)}`)
  // expect(sum(1, 2)).toBe(3);
  expect(response.data.indexOf(`/https/zh.wikipedia.org/wiki/%E6%B5%8B%E8%AF%95`)).not.toBe(-1)
}, 30000);


test('mitbbs /news_wenzhang/ issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.mitbbs.com/news/mitbbs_news.php`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="/news_wenzhang`)).toBe(-1)
}, 30000);

test('mitbbs img issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.mitbbs.com/news/mitbbs_news.php`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`img src="/https/www.mitbbs.com/img/list.png`)).not.toBe(-1)
}, 30000);


test('mitbbs home page img src issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.mitbbs.com/`
  const response = await axios({
    method: 'get',
    url,
  })
  expect(response.data.indexOf(`img src="../img`)).toBe(-1)
}, 30000);

test('google next click issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.google.com/search?q=%E6%B5%B7%E5%A4%96%E8%AE%BA%E5%9D%9B&oq=%E6%B5%B7%E5%A4%96%E8%AE%BA%E5%9D%9B`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="/search?q=`)).toBe(-1)
}, 30000);

test('reuters.com /article issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/cn.reuters.com/`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"url":"/article`)).toBe(-1)
}, 30000);

test('worldjournal.com redirect location', async () => {
  const url = `${httpprefix}://${serverName}:${port}/http/www.worldjournal.com`
  const response = await axios({
    method: 'get',
    maxRedirects: 0,
    validateStatus: null, // important for status 302
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  expect(response.headers['location'].indexOf(`/https/www.worldjournal.com`)).not.toBe(-1)
}, 30000);

test('remove integrity', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/github.com`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(` integrity="`)).toBe(-1)
}, 30000);

test('google.com regex match issue.', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.google.com/xjs/_/js/k=xjs.s.en_US.WX2ru19zjfM.O/ck=xjs.s.6ta1yGmmv4s.L.W.O/am=AAAAAEsAdt0BAv43QQAAsMcAAIAAN8HGAmGQUBDEqglAIA/d=1/exm=Fkg7bd,HcFEGb,IvlUe,MC8mtf,OF7gzc,RMhBfe,T4BAC,TJw5qb,TbaHGc,Y33vzc,cdos,csi,d,hsm,iDPoPb,jsa,mvYTse,tg8oTe,uz938c,vWNDde,ws9Tlc,yQ43ff/ed=1/dg=2/br=1/ct=zgms/rs=ACT90oFic3J6EOqrrX-rohmG1E0OJYTO1g/m=RqxLvf,aa,abd,async,dvl,fEVMic,foot,ifl,lu,m,mUpTid,mu,sb_wiz,sf,sonic,spch,wft,xz7cCd?xjs=s1`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="/https/www.google.com/g);`)).toBe(-1)
}, 30000);

test('yorkbbs issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/http/www.yorkbbs.ca/`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`ca//http`)).toBe(-1)
}, 30000);

test('youtube response url encode issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/get_video_info?html5=1&video_id=taVoseONjxc&cpn=DakN7Kk_Y_8rKsWf&eurl&el=embedded&hl=en_US&sts=18319&lact=30&c=WEB_EMBEDDED_PLAYER&cver=20200228&cplayer=UNIPLAYER&cbr=Chrome&cbrver=80.0.3987.87&cos=X11&autoplay=1&width=798&height=1048&ei=OgNcXrLJJMWItQeklqqgCw&iframe=1&embed_config=%7B%7D`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`vss_host`)).not.toBe(-1)
}, 30000);


test('youtube mobile url issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/m.youtube.com/yts/jsbin/player-plasma-ias-phone-en_US-vflrryPzY/base.js`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  // expect(response.data.indexOf(`"Captions URL"`)).toBe(-1)
  expect(response.data.indexOf(`Untrusted URL:`)).toBe(-1)
}, 30000);

test('youtube url check issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/yts/jsbin/player_ias-vflsFV4r3/en_US/base.js`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  // expect(response.data.indexOf(`"Captions URL"`)).toBe(-1)
  expect(response.data.indexOf(`("//${serverName}:${port}/https/"+this.`)).not.toBe(-1)
  expect(response.data.indexOf(`://i1.ytimg.com/vi`)).toBe(-1)
  expect(response.data.indexOf(`"ptracking"`)).toBe(-1)
  expect(response.data.indexOf(`"/api/stats/"`)).toBe(-1)
}, 30000);

test('youtube desktop_polymer_v2.js issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/yts/jsbin/desktop_polymer_v2-vflv5mvtW/desktop_polymer_v2.js`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`iconChanged_:function(a,b,c){},`)).not.toBe(-1)
  expect(response.data.indexOf(`g+("/youtubei/"`)).toBe(-1)
  expect(response.data.indexOf(`"/service_ajax"`)).toBe(-1)
  expect(response.data.indexOf(`&&this.connectedCallback()):`)).toBe(-1)
  expect(response.data.indexOf(`="/sw.js"`)).toBe(-1)
}, 30000);



test('youtube url conversion', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/watch?v=I9K4MbvlDss&frags=pl%2Cwn`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
        'Cookie': `VISITOR_INFO1_LIVE=WxtnB8UaTM4; YSC=QPym_D-ojR0`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"\\/service_ajax\\",`)).toBe(-1)
}, 30000);


test('youtube homepage issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
        'Cookie': 'GPS=1; YSC=GIEifM9pJtw; VISITOR_INFO1_LIVE=MV_eADDUWUs; IDE=AHWqTUkjx5qqT40ccfFUS2trOr4e16HYZavXZDtUZ8B_qBLODExo6SyQPAl-3Mbc',
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"\\/service_ajax\\",`)).toBe(-1)
}, 3000); // should be done within 3 seconds.

// heroku headers:
// h==== req.url:/https/id.google.com/verify/ALoz5hxFM5vKCyL4RFaFnt6WR_AuQbx7abPPVMjTqOcXGhuzO-IkSXVdsRZsYnmhe8kQSMl9uvqudUdIQBA07Fg_guEQ7c0GP6qrAPVQrScGetd8fAZfMhk, req
// hheaders:{"host":"siteproxy.herokuapp.com","connection":"close","sec-fetch-dest":"image","dpr":"1","user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/5
// h37.36","accept":"image/webp,image/apng,image/*,*/*;q=0.8","sec-fetch-site":"same-origin","sec-fetch-mode":"no-cors","referer":"https://siteproxy.herokuapp.com/","accept-encoding":"gzip, deflate, br","accept-lang
// huage":"en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7","cookie":"NID=200=oRA6eiHr-AVq3TYpu1hAYlFFTt4FE3NTwVGhDTjs1L16VjJEuuyKW33tdEvz9ibbZNBplYLxm53p0O5AxgwyqCO1dzXie7NB_Mjq9B4AJyaZPMHKVaF0dqES1qtvyz7pRj5BqA6EKb7QB3FzLmj96
// hR4aggHdBTbu6yZWnZmvc10; 1P_JAR=2020-03-13-23","x-request-id":"d2e7fa06-ed41-4a49-b92d-7a5f87e5feb3","x-forwarded-for":"135.0.54.232","x-forwarded-proto":"https","x-forwarded-port":"443","via":"1.1 vegur","connec
// ht-time":"0","x-request-start":"1584141848398","total-route-time":"0"}
// h2020-03-13T23:24:08.403097+00:00 app[web.1]: httpType:https, host:id.google.com



test('no content-type field situation', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/onetag-sys.com/usync/?pubId=5927d926323dc2c`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(typeof(response.data)).toBe('object')
}, 15000); // should be done within 3 seconds.

test('doubi issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/doubibackup.com`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  console.log(`${response.data}`)
  expect(response.data.indexOf(`href="3x8ussyf.html"`)).toBe(-1)
  expect(response.data.indexOf(` src="5ny9g1s2.gif" `)).toBe(-1)
}, 15000); // should be done within 3 seconds.

test('web.telegram.com href/src issues', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/web.telegram.org`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href=css/app.css`)).toBe(-1)
  expect(response.data.indexOf(`src=js/app.js`)).toBe(-1)
}, 15000); // should be done within 3 seconds.

test('web.telegram.com href/src issues', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/web.telegram.org/js/app.js`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href=/https/web.telegram.org/e.value`)).toBe(-1)
}, 15000); // should be done within 3 seconds.


test('web.telegram.com href/src issues', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.google.com/search?ei=pJ5yXtfwHOPP0PEPwaGzqAk&q=%E7%BB%B4%E5%9F%BA%E7%99%BE%E7%A7%91`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`/${httpprefix}://${serverName}:${port}/ht`)).toBe(-1)
}, 15000); // should be done within 3 seconds.
