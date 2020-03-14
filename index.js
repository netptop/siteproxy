var express = require('express')
const path = require('path')
const fs = require('fs')
let app = express()
var Proxy = require('./Proxy')
let { urlModify, httpprefix, serverName, port, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace } = require('./config')

let cookieDomainRewrite = serverName
let proxy = Proxy({ urlModify, httpprefix, serverName, port, cookieDomainRewrite, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace})

const middle1 = (req, res, next) => {
    console.log(`req.url:${req.url}`)
    const dirPath = path.join(__dirname, req.url)
    let fwdStr = req.headers['x-forwarded-for']
    if (fwdStr && fwdStr.split(',').length > 3) { // too many forwardings
        return res.status(404).send('{"error": "too many redirects"}')
    }
    if (req.url === '/' || req.url === '/index.html') {
        body = fs.readFileSync(path.join(__dirname, './index.html'), encoding = 'utf-8')
        res.status(200).send(body)
        return
    } else
    if (fs.existsSync(dirPath) && !fs.lstatSync(dirPath).isDirectory()) {
        body = fs.readFileSync(dirPath)
        return res.status(200).send(body)
    }
    next()
}
app.use(middle1)
app.use(proxy)

let reallistenPort = process.env.PORT || 8011
app.listen(reallistenPort)

console.log(`listening on port:${reallistenPort}`)
