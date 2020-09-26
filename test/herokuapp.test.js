/**
 * @jest-environment node
 */
const axios = require('axios');

const httpprefix = 'https'
const serverName = 'siteproxy.herokuapp.com'
const port = '443'

test('post operation', async () => {
  const url = `${httpprefix}://${serverName}:${port}/https/api.twitter.com/1.1/branch/init.json`
  const response = await axios({
    method: 'post',
    validateStatus: null, // important for status 302/403
    headers: {
      authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
      connection: 'keep-alive',
      cookie: 'personalization_id="v1_DkZdb/rVpgZVDtiT3qVAUA=="; guest_id=v1%3A160056087565376493; _ga=GA1.3.1320916387.1600483268; _gid=GA1.3.1182741545.1600483268; ORIGINALHOST=https/api.twitter.com',
      Host: 'siteproxy.herokuapp.com',
      Referer: 'https://siteproxy.herokuapp.com/explore',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'x-csrf-token': 'ac1aa9d58c8798f0932410a1a564eb42',
      'x-twitter-active-user': 'yes',
      'x-twitter-client-language': 'en',
    },
    url,
    data:'',
  })
  console.log(`${JSON.stringify(response.headers)}`)
  console.log(`${JSON.stringify(response.data)}`)
  // expect(JSON.stringify(response.data).indexOf(`test data123`)).not.toBe(-1)
}, 15000); // should be done within 3 seconds.