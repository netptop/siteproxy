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

test('pingcong href="/" issue.', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/pincong.rocks/search/`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="/"`)).toBe(-1)
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
  expect(response.data.indexOf(`"Captions URL"`)).toBe(-1)
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

test('googlevideo.com issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/r1---sn-n4v7sn7l.googlevideo.com/videoplayback?expire=1583814270&ei=HsJmXur9K4aikgamvbfABQ&ip=18.144.99.15&id=o-AIaKnNqqplhX9b0RsF0Kh1zyrCsOl-JkWPmg5f_y2Qr5&itag=243&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278&source=youtube&requiressl=yes&mm=31%2C26&mn=sn-n4v7sn7l%2Csn-a5mekn7k&ms=au%2Conr&mv=u&mvi=0&pl=23&vprv=1&mime=video%2Fwebm&gir=yes&clen=63524647&dur=1299.598&lmt=1582963684900655&mt=1583792083&fvip=1&keepalive=yes&fexp=23842630&c=WEB&txp=5431432&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&sig=ADKhkGMwRAIgRS5K8gl7Lo2QwK2z00wSbdPS36IrpaTo2OcEMd5h8j4CIDUtLjxXZAClS1mVDGEKH8nwtOz_aQRL72KhkGsEcx1_&lsparams=mm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABSNjpQwRAIgX9FV_e-Uoi-euNxsIjfX0Azwgv9N4pThqdLAyUtvTMoCIEgSdyw6mI2gY3ryLd9pkGH7pXcaXlVjpvuH6yAlGibq&alr=yes&cpn=hwivuvx84GVZ6T0m&cver=2.20200304.01.00&range=113485-231845&rn=8&rbuf=2176`
  const response = await axios({
    method: 'get',
    headers: {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
        'debugflag': 'true',
        // maxRedirects: 0,
        // validateStatus: null, // important for status 302
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  console.log(`${response.data}`)
  expect(response.data.indexOf(`desktop_polymer_v2`)).toBe(-1)
}, 30000);
