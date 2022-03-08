/**
 * @jest-environment node
 */
const axios = require("axios");
const util = require("util");

let httpprefix = "https";
let serverName = `siteproxylocal.now.sh`;
let port = "443";
if (process.env.localFlag === "true") {
  httpprefix = "http";
  serverName = "127.0.0.1";
  port = "8011";
}

test("search wikipedia, open it, then click link", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/zh.wikipedia.org/wiki/%E6%B5%8B%E8%AF%95`;
  const response = await axios({
    method: "get",
    url,
  });
  // console.log(util.inspect(response))
  expect(
    response.data.indexOf(`/https/zh.wikipedia.org/wiki/%E6%B5%8B%E8%AF%95`)
  ).not.toBe(-1);
}, 30000);

test("mitbbs /news_wenzhang/ issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.mitbbs.com/news/mitbbs_news.php`;
  const response = await axios({
    method: "get",
    url,
  });
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="/news_wenzhang`)).toBe(-1);
}, 30000);

test("mitbbs img issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.mitbbs.com/news/mitbbs_news.php`;
  const response = await axios({
    method: "get",
    url,
  });
  // console.log(`${response.data}`)
  expect(
    response.data.indexOf(`img src="/https/www.mitbbs.com/img/list.png`)
  ).not.toBe(-1);
}, 30000);

test("mitbbs home page img src issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.mitbbs.com/`;
  const response = await axios({
    method: "get",
    url,
  });
  expect(response.data.indexOf(`img src="../img`)).toBe(-1);
}, 30000);

test("google next click issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.google.com/search?q=%E6%B5%B7%E5%A4%96%E8%AE%BA%E5%9D%9B&oq=%E6%B5%B7%E5%A4%96%E8%AE%BA%E5%9D%9B`;
  const response = await axios({
    method: "get",
    url,
  });
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="/search?q=`)).toBe(-1);
}, 30000);

test("reuters.com /article issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/cn.reuters.com/`;
  const response = await axios({
    method: "get",
    url,
  });
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"url":"/article`)).toBe(-1);
}, 30000);

test("remove integrity", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/github.com`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(` integrity="`)).toBe(-1);
}, 30000);

test("yorkbbs issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/http/www.yorkbbs.ca/`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`ca//http`)).toBe(-1);
}, 30000);

test("youtube mobile url issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/m.youtube.com/yts/jsbin/player-plasma-ias-phone-en_US-vflrryPzY/base.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  // expect(response.data.indexOf(`"Captions URL"`)).toBe(-1)
  expect(response.data.indexOf(`Untrusted URL:`)).toBe(-1);
}, 30000);

test("youtube url check issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/s/player/64dddad9/player_ias.vflset/en_US/base.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  // expect(response.data.indexOf(`"Captions URL"`)).toBe(-1)
  expect(
    response.data.indexOf(`("//${serverName}:${port}/https/"+this.`)
  ).not.toBe(-1);
  expect(response.data.indexOf(`://i1.ytimg.com/vi`)).toBe(-1);
  // expect(response.data.indexOf(`"ptracking"`)).toBe(-1)
  expect(response.data.indexOf(`"/api/stats/"`)).toBe(-1);
  expect(response.data.indexOf(`"://"+`)).toBe(-1);
  expect(response.data.indexOf(`"://www.youtube.com/"`)).toBe(-1);
  expect(response.data.indexOf(`a.A[c].style.display=0===b?"none":"";`)).toBe(
    -1
  );
}, 30000);

test("youtube desktop_polymer_v2.js issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/yts/jsbin/desktop_polymer_v2-vflv5mvtW/desktop_polymer_v2.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`iconChanged_:function(a,b,c){},`)).not.toBe(-1);
  expect(response.data.indexOf(`g+("/youtubei/"`)).toBe(-1);
  expect(response.data.indexOf(`"/service_ajax"`)).toBe(-1);
  expect(response.data.indexOf(`&&this.connectedCallback()):`)).toBe(-1);
  expect(response.data.indexOf(`="/sw.js"`)).toBe(-1);
}, 30000);

test("/watch url conversion", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/watch?v=ii1fTxhD_D0&spf=navigate`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
      Cookie: `VISITOR_INFO1_LIVE=WxtnB8UaTM4; YSC=QPym_D-ojR0`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${JSON.stringify(response.data)}`)
  expect(
    JSON.stringify(response.data).indexOf(`/https/www.youtube.com/watch?v=`)
  ).not.toBe(-1);
}, 30000);

test("youtube url conversion", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/watch?v=I9K4MbvlDss&frags=pl%2Cwn`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
      Cookie: `VISITOR_INFO1_LIVE=WxtnB8UaTM4; YSC=QPym_D-ojR0`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"\\/service_ajax\\",`)).toBe(-1);
}, 30000);

test("youtube homepage issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
      Cookie:
        "GPS=1; YSC=GIEifM9pJtw; VISITOR_INFO1_LIVE=MV_eADDUWUs; IDE=AHWqTUkjx5qqT40ccfFUS2trOr4e16HYZavXZDtUZ8B_qBLODExo6SyQPAl-3Mbc",
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"\\/service_ajax\\",`)).toBe(-1);
}, 8000); // should be done within 3 seconds.

// heroku headers:
// h==== req.url:/https/id.google.com/verify/ALoz5hxFM5vKCyL4RFaFnt6WR_AuQbx7abPPVMjTqOcXGhuzO-IkSXVdsRZsYnmhe8kQSMl9uvqudUdIQBA07Fg_guEQ7c0GP6qrAPVQrScGetd8fAZfMhk, req
// hheaders:{"host":"siteproxy.herokuapp.com","connection":"close","sec-fetch-dest":"image","dpr":"1","user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/5
// h37.36","accept":"image/webp,image/apng,image/*,*/*;q=0.8","sec-fetch-site":"same-origin","sec-fetch-mode":"no-cors","referer":"https://siteproxy.herokuapp.com/","accept-encoding":"gzip, deflate, br","accept-lang
// huage":"en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7","cookie":"NID=200=oRA6eiHr-AVq3TYpu1hAYlFFTt4FE3NTwVGhDTjs1L16VjJEuuyKW33tdEvz9ibbZNBplYLxm53p0O5AxgwyqCO1dzXie7NB_Mjq9B4AJyaZPMHKVaF0dqES1qtvyz7pRj5BqA6EKb7QB3FzLmj96
// hR4aggHdBTbu6yZWnZmvc10; 1P_JAR=2020-03-13-23","x-request-id":"d2e7fa06-ed41-4a49-b92d-7a5f87e5feb3","x-forwarded-for":"135.0.54.232","x-forwarded-proto":"https","x-forwarded-port":"443","via":"1.1 vegur","connec
// ht-time":"0","x-request-start":"1584141848398","total-route-time":"0"}
// h2020-03-13T23:24:08.403097+00:00 app[web.1]: httpType:https, host:id.google.com

test("doubi issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/doubibackup.com`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href="3x8ussyf.html"`)).toBe(-1);
  expect(response.data.indexOf(` src="5ny9g1s2.gif" `)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("web.telegram.com href/src issues", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/web.telegram.org`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href=css/app.css`)).toBe(-1);
  expect(response.data.indexOf(`src=js/app.js`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("web.telegram.com href regular expression issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/web.telegram.org/js/app.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href=/https/web.telegram.org/e.value`)).toBe(
    -1
  );
}, 15000); // should be done within 3 seconds.

test("google search issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.google.com/search?ei=pJ5yXtfwHOPP0PEPwaGzqAk&q=%E7%BB%B4%E5%9F%BA%E7%99%BE%E7%A7%91`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(
    response.data.indexOf(`/${httpprefix}://${serverName}:${port}/ht`)
  ).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("m.youtube.com search issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/m.youtube.com/yts/jsbin/mobile-c3-vflPfniwW/mobile-c3.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  //console.log(`${response.data}`)
  expect(response.data.indexOf(`"/results?search_query="`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("www.youtube.com search issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/results?search_query=%E4%B8%AD%E5%9B%BD`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"/results?search_query=`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

// test('twitter pathname issue', async () => {
//  const url = `${httpprefix}://${serverName}:${port}/https/abs.twimg.com/responsive-web/web/loader.Typeahead.3477b654.js`
//  const response = await axios({
//    method: 'get',
//    headers: {
//        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
//    },
//    url,
//  })
// console.log(`${JSON.stringify(response.headers)}`)
// console.log(`${response.data}`)
//  expect(response.data.indexOf(`pathname:"/"`)).toBe(-1)
//}, 15000); // should be done within 3 seconds.

test("youtube non-search-box issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/m.youtube.com/yts/jsbin/mobile-c3-vflxm_8Y5/mobile-c3.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`non-search-box`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("m.youtube.com show more on list page issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/m.youtube.com/yts/jsbin/mobile-c3-vfl0qWxpM/mobile-c3.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(
    response.data.indexOf(
      `if(!a||(a.isMutedByMutedAutoplay&&a.isMutedByMutedAutoplay()))`
    )
  ).not.toBe(-1);
}, 15000); // should be done within 3 seconds.

test("web.telegram.org login", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/web.telegram.org/js/app.js`;

  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  //console.log(`${response.data}`)
  // expect(response.data.indexOf(`pathname:"/"`)).toBe(-1)
  expect(response.data.indexOf(`"venus"`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("old youtube page", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/m.youtube.com/watch?v=ayWJGSFgUZA&list=PLPVsJMpVPkCd_OUBs7Aj_dYEbwgO8ZtLY&index=2&t=0s&disable_polymer=true&itct=CCgQxjQYACITCIi9t_W8iOkCFcpCMAod2IYEwTIKcGxwcF92aWRlb1okVkxQTFBWc0pNcFZQa0NkX09VQnM3QWpfZFlFYndnTzhadExZ`;

  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"initcwndbps"`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("youtube Url www.google.com issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/watch?v=ayWJGSFgUZA&list=PLPVsJMpVPkCd_OUBs7Aj_dYEbwgO8ZtLY&index=2&t=0s&frags=pl%2Cwn`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  //console.log(`${response.data}`)
  expect(
    response.data.indexOf(
      `\"interpreterUrl\":\"\/\/www.google.com\/js\/bg\/jeQSBy52GP_vj-aLADK6D_RsHFfZXrt-vZElH-uv2ok.js\"`
    )
  ).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("youtube href fonts.googleapis.com issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/watch?v=5HHRBe8bskE&list=PLPVsJMpVPkCd_OUBs7Aj_dYEbwgO8ZtLY&index=6&t=0s&frags=pl%2Cwn`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,applino content-type fieldcation/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(
    response.data.indexOf(
      `href="/https/www.youtube.com//127.0.0.1:8011/https/fonts.googleapis.com/css`
    )
  ).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("youtube watch address bar issue", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/watch?v=tTzRY7F_1OU&spf=navigate`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${JSON.stringify(response.data)}`)
  expect(
    JSON.stringify(response.data).indexOf(`{"url":"/watch?v=tTzRY7F_1OU"`)
  ).toBe(-1);
}, 15000); // should be done within 3 seconds.

test('"https://" should be removed', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/di.phncdn.com/www-static/js/ph-tracking.js?cache=2020051402`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`"https://"`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("30.toString() should not be existed", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.youtube.com/s/desktop/751ee0bc/htdocs-ytimg-desktop-kevlar-production/jsbin/desktop_polymer_inlined_html_polymer_flags_legacy_browsers_v2.vflset/desktop_polymer_inlined_html_polymer_flags_legacy_browsers_v2.js`;
  const response = await axios({
    method: "get",
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    },
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`)
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`30.toString()`)).toBe(-1);
}, 15000); // should be done within 3 seconds.

test("no exception for fonts.gstatic.com", async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxMKTU1Kg.woff`;
  const response = await axios({
    method: "get",
    headers: {},
    url,
  });
  // console.log(`${JSON.stringify(response.headers)}`);
  // console.log(`${response.data}`)
  // expect((response.data).indexOf(`30.toString()`)).toBe(-1)
}, 15000); // should be done within 3 seconds.
