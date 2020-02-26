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

test('boxun /hero issue', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/blog.boxun.com`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${response.data}`)
  expect(response.data.indexOf(`href=/hero`)).toBe(-1)
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
  console.log(`${JSON.stringify(response.headers)}`)
  expect(response.headers['location'].indexOf(`/https/www.worldjournal.com`)).not.toBe(-1)
}, 30000);
