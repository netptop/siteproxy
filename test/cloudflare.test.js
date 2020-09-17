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
  console.log(`${JSON.stringify(response.data)}`)
  // expect(sum(1, 2)).toBe(3);
  expect(response.data.indexOf(`http://127.0.0.1:8787/https`)).not.toBe(-1)
}, 30000);