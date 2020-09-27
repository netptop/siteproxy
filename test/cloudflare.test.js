/**
 * @jest-environment node
 */
const axios = require('axios');

const httpprefix = 'http'
const serverName = '127.0.0.1'
const port = '8787'

test('return a string instead of Uint8Array', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/www.msn.com/en-us/news`
  const response = await axios({
    method: 'get',
    url,
  })
  // console.log(`${JSON.stringify(response.data)}`)
  // expect(sum(1, 2)).toBe(3);
  expect(response.data.indexOf(`http://127.0.0.1:8787/https`)).not.toBe(-1)
}, 30000);

test('post operation', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/postman-echo.com/post`
  const response = await axios({
    method: 'post',
    headers: {
    },
    url,
    data: 'test data123',
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  //console.log(`${JSON.stringify(response.data)}`)
  expect(JSON.stringify(response.data).indexOf(`test data123`)).not.toBe(-1)
}, 15000); // should be done within 3 seconds.

test('youtube redirect 302', async () => {
  const url = `${httpprefix}://${serverName}:${port}/http/www.youtube.com/channel/UCAq_xQV8pJ2Q_KOszzaYPBg/feed?disable_polymer=1`
  const response = await axios({
    method: 'get',
    maxRedirects: 0,
    validateStatus: null, // important for status 302
    headers: {
    },
    url,
  })
  // console.log(`${JSON.stringify(response.headers)}`)
  //console.log(`${JSON.stringify(response.data)}`)
  expect(response.headers['location'].indexOf(`/https/www.youtube`)).not.toBe(-1)
}, 15000); // should be done within 3 seconds.