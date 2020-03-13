const fs = require('fs')
const path = require('path')
var Proxy = require('../Proxy')

let { urlModify, httpprefix, serverName, port, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace } = require('../config')

let cookieDomainRewrite = serverName

let proxy = Proxy({ urlModify, httpprefix, serverName, port, cookieDomainRewrite, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace })
export default (req, res) => {
  const dirPath = path.join(__dirname + '/..', req.url)
  console.log(`x-forward-for:${req.headers['x-forwarded-for']}, req.url:${req.url}`)
  if (req.url === '/' || req.url === '/index.html') {
      let body = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8')
      res.status(200).send(body)
      return
  } else
  if (fs.existsSync(dirPath) && !fs.lstatSync(dirPath).isDirectory()) {
      let body = fs.readFileSync(dirPath)
      return res.status(200).send(body)
  }
  proxy(req, res, null) // next: null
}
