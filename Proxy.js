var express = require('express');
var proxy = require('http-proxy-middleware');
const https = require('https')
const zlib = require("zlib")
const cookiejar = require('cookiejar')
const iconv = require('iconv-lite')
const {CookieAccessInfo, CookieJar, Cookie} = cookiejar

function countUtf8Bytes(s) {
    var b = 0, i = 0, c
    for(;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
    return b
}

var enableCors = function(req, res) {
  if (req.headers['access-control-request-method']) {
    res.setHeader('access-control-allow-methods', req.headers['access-control-request-method']);
  }

  if (req.headers['access-control-request-headers']) {
    res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers']);
  }

  if (req.headers.origin) {
    res.setHeader('access-control-allow-origin', req.headers.origin);
    res.setHeader('access-control-allow-credentials', 'true');
  }
};

// only support https for now.
let router = (req) => { //return target
  let {host, httpType} = getHostFromReq(req)
  let target = `${httpType}://${host}`
  console.log(`router, target:${target}, req.url:${req.url}`)
  return target
}

let getHostFromReq = (req) => { //return target
  // url: http://127.0.0.1:8011/https/www.youtube.com/xxx/xxx/...
  let https_prefix = '/https/'
  let http_prefix = '/http/'
  let host = ''
  let httpType = 'https'
  if (req.url.startsWith(https_prefix)) {
    host = req.url.slice(https_prefix.length, req.url.length)
    if (host.indexOf('/') !== -1) {
      host = host.slice(0, host.indexOf('/'))
    }
  } else if (req.url.startsWith(http_prefix)) {
    host = req.url.slice(http_prefix.length, req.url.length)
    if (host.indexOf('/') !== -1) {
      host = host.slice(0, host.indexOf('/'))
    }
    httpType = 'http'
  } else if (req.headers['referer'] && req.headers['referer'].indexOf('https/') !== -1) {
      let start = req.headers['referer'].indexOf('https/') + 6
      host = req.headers['referer'].slice(start, req.headers['referer'].length)
      let end = host.indexOf('/')
      if (end === -1) {
        end = host.length
      }
      host = host.slice(0, end)
      console.log(`============= host:${host}, req referer:${req.headers['referer']}`)
  } else if (req.headers['referer'] && req.headers['referer'].indexOf('http/') !== -1) {
      let start = req.headers['referer'].indexOf('http/') + 5
      host = req.headers['referer'].slice(start, req.headers['referer'].length)
      let end = host.indexOf('/')
      if (end === -1) {
        end = host.length
      }
      host = host.slice(0, end)
      httpType = 'http'
      console.log(`============= host:${host}, req referer:${req.headers['referer']}`)
  }
  console.log(`getHostFromReq, req.url:${req.url}, referer:${req.headers['referer']}`)
  return {host, httpType}
}


let Proxy = ({cookieDomainRewrite, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace}) => {
    let handleRespond = ({req, res, body, gbFlag}) => {
        // console.log("res from proxied server:", body);
        /*
        var myRe = new RegExp(`https://`, 'g') // support maximum 300 characters for web site name, like: www.google.com
        body = body.replace(myRe, `http://127.0.0.1:${port}/https/`)
        myRe = new RegExp(`https%3A%2F%2F`, 'g')
        body = body.replace(myRe, `https%3A%2F%2F127.0.0.1%3A${port}%2F`)
        */
        let myRe
        let {host, httpType} = getHostFromReq(req)
        let location = res.getHeaders()['location']
        if (res.statusCode == '302' || res.statusCode == '301') {
            if (location.startsWith('http://')) {
                for(let key in locationReplaceMap302['http://']) {
                    myRe = new RegExp(key, 'g') // match group
                    location = location.replace(myRe, locationReplaceMap302['http://'][key])
                }
            } else
            if (location.startsWith('https://')) {
                for(let key in locationReplaceMap302['https://']) {
                    myRe = new RegExp(key, 'g') // match group
                    location = location.replace(myRe, locationReplaceMap302['https://'][key])
                }
            }
            res.setHeader('location', location)
        }
        // console.log(`HandleRespond(), req.url:${req.url}, req.headers:${JSON.stringify(req.headers)}`)
        for(let key in regReplaceMap) {
            myRe = new RegExp(key, 'g') // match group
            body = body.replace(myRe, regReplaceMap[key])
        }
        Object.keys(siteSpecificReplace).forEach( (site) => {
            if (req.url.indexOf(site) !== -1 || req.headers['referer'].indexOf(site) !== -1) {
                keys = Object.keys(siteSpecificReplace[site])
                keys.forEach( key => {
                    myRe = new RegExp(key, 'g') // match group
                    body = body.replace(myRe, siteSpecificReplace[site][key])
                })
            }
        })
        if (host) {
            body = pathReplace({host, httpType, body})
        }

        if (gbFlag) {
          body = iconv.encode(body, 'gbk')
        }
        body = zlib.gzipSync(body)
        res.setHeader('content-encoding', 'gzip');
        console.log(`handleRespond: res.headers:${JSON.stringify(res.getHeaders())}`)
        res.end(body);
    }
    let p = proxy({
      target: `https://www.google.com`,
      router,
      /*
      pathRewrite: (path, req) => {
        let {host, httpType} = getHostFromReq(req)
        let newpath = path.replace(`/https/${host}`, '') || '/'
        console.log(`newpath:${newpath}`)
        return newpath
      },
      */
      hostRewrite: true,
      // autoRewrite: true,
      protocolRewrite: true,
      // followRedirects: true,
      cookieDomainRewrite,
      secure: false,
      changeOrigin: true,
      debug:true,
      onError: (err, req, res) => {
        console.log(`onerror: ${err}`)
      },
      selfHandleResponse: true, // so that the onProxyRes takes care of sending the response
      onProxyRes: (proxyRes, req, res) => {
        let {host, httpType} = getHostFromReq(req)
        console.log(`proxyRes.status:${proxyRes.statusCode} proxyRes.headers:${JSON.stringify(proxyRes.headers)}`)
        var body = Buffer.from('');
        proxyRes.on('data', function(data) {
          body = Buffer.concat([body, data]);
        })
        proxyRes.on('end', function() {
          let gbFlag = false
          if (proxyRes.headers["content-encoding"] === 'gzip') {
            zlib.gunzip(body,function(er,gunzipped){
              console.log(`zlib.gunzip...`)
              if (proxyRes.headers["content-type"].indexOf('text/') !== -1) {
                if (!gunzipped) {
                    res.status(404).send()
                    return
                }
                console.log(`utf-8 text...`)
                body = gunzipped.toString('utf-8');
                if (body.indexOf('content="text/html; charset=gb2312') !== -1) {
                  body = iconv.decode(gunzipped, 'gbk')
                  gbFlag = true
                }
                handleRespond({req, res, body, gbFlag})
              } else {
                res.end(body)
              }
            });
          } else if (proxyRes.headers["content-type"] && proxyRes.headers["content-type"].indexOf('text/') !== -1) {
            console.log(`utf-8 text...`)
            body = body.toString('utf-8');
            handleRespond({req, res, body, gbFlag})
          } else {
            res.end(body)
          }
        })
        const setCookieHeaders = proxyRes.headers['set-cookie'] || []
        const modifiedSetCookieHeaders = setCookieHeaders
          .map(str => new cookiejar.Cookie(str))
          .map(cookie => {
          console.log(`cookie:${JSON.stringify(cookie)}`)
          if (cookie.path && cookie.path[0] === '/') {
            cookie.domain = `127.0.0.1`
            cookie.path = `${req.url}`
          }
          cookie.secure = false
          return cookie
          })
          .map(cookie => cookie.toString())
        proxyRes.headers['set-cookie'] =  modifiedSetCookieHeaders
        Object.keys(proxyRes.headers).forEach(function (key) {
          if (key === 'content-encoding' ||
            (key === 'content-length' && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].indexOf('text/') !== -1)) {
            console.log(`skip header:${key}`)
            return
          }
          // res.append(key, proxyRes.headers[key]);
          res.setHeader(key, proxyRes.headers[key]);
        });
        res.statusCode = proxyRes.statusCode
        console.log(`res.status:${res.statusCode} res.url:${res.url}, res.headers:${JSON.stringify(res.getHeaders())}`)
      },
      onProxyReq: (proxyReq, req, res) => {
        let {host, httpType} = getHostFromReq(req)
        req.headers['host'] = host
        req.headers['referer'] = host
        let newpath = req.url.replace(`/${httpType}/${host}`, '') || '/'
        console.log(`httpType:${httpType}, host:${host}, req.url:${req.url}, req.headers:${JSON.stringify(req.headers)}`)
        Object.keys(req.headers).forEach(function (key) {
          proxyReq.setHeader(key, req.headers[key]);
        });
        proxyReq.setHeader('Accept-Encoding', 'gzip')
        proxyReq.setHeader('referer', host)
        proxyReq.path = newpath
        console.log(`req host:${host}, req.url:${req.url}, proxyReq.path:${proxyReq.path}, proxyReq.url:${proxyReq.url} proxyReq headers:${JSON.stringify(proxyReq.getHeaders())}`)
        if(host === '' || !host) {
            console.log(`------------------ sending status 404`)
            res.status(404).send()
            res.end()
        }

      },
    })
    return p
}

module.exports = Proxy
