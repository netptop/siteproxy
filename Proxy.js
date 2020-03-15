var express = require('express');
var proxy = require('http-proxy-middleware');
const zlib = require("zlib")
const parse = require('url-parse')
const cookiejar = require('cookiejar')
const iconv = require('iconv-lite')
const {logSave, logGet, logClear} = require('./logger')
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
      logSave(`============= host:${host}, req referer:${req.headers['referer']}`)
  } else if (req.headers['referer'] && req.headers['referer'].indexOf('http/') !== -1) {
      let start = req.headers['referer'].indexOf('http/') + 5
      host = req.headers['referer'].slice(start, req.headers['referer'].length)
      let end = host.indexOf('/')
      if (end === -1) {
        end = host.length
      }
      host = host.slice(0, end)
      httpType = 'http'
      logSave(`============= host:${host}, req referer:${req.headers['referer']}`)
  } else if (req.headers['referer']) { // 'zh.wikipedia.org'
      var parsed = parse(req.headers['referer'])
      if(parsed.hostname) {
        host = parsed.hostname
        httpType = parsed.protocol.replace(':', '')
      } else {
        host = req.headers['referer']
        httpType = 'https'
      }
  }
  logSave(`getHostFromReq, req.url:${req.url}, referer:${req.headers['referer']}, host:${host}, httpType:${httpType}`)
  return {host, httpType}
}


let Proxy = ({urlModify, httpprefix, serverName, port, cookieDomainRewrite, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace}) => {
    let handleRespond = ({req, res, body, gbFlag}) => {
        // logSave("res from proxied server:", body);
        let myRe
        let {host, httpType} = getHostFromReq(req)
        let location = res.getHeaders()['location']
        if (res.statusCode == '301' || res.statusCode == '302' || res.statusCode == '303' ||res.statusCode == '307' || res.statusCode == '308') {
            location = locationReplaceMap302({location, serverName, httpprefix, host, httpType})
            logSave(`after replacement, location=${location}`)
            try {
                res.setHeader('location', location)
            } catch(e) {
                logSave(`error: ${e}`)
                return
            }
            // return
        }
        // logSave(`HandleRespond(), req.url:${req.url}, req.headers:${JSON.stringify(req.headers)}`)
        for(let key in regReplaceMap) {
            myRe = new RegExp(key, 'g') // match group
            body = body.replace(myRe, regReplaceMap[key])
        }
        logSave(`##### host:${host}`)
        if (host) {
            body = pathReplace({host, httpType, body})
        }
        // remove duplicate /https/siteproxylocal.now.sh:443
        myRe = new RegExp(`/${httpprefix}/${serverName}.*?/`, 'g') // match group
        body = body.replace(myRe, '/')

        // put siteSpecificReplace at end
        Object.keys(siteSpecificReplace).forEach( (site) => {
            if (req.url.indexOf(site) !== -1 || req.headers['referer'].indexOf(site) !== -1) {
                keys = Object.keys(siteSpecificReplace[site])
                keys.forEach( key => {
                    myRe = new RegExp(key, 'g') // match group
                    body = body.replace(myRe, siteSpecificReplace[site][key])
                })
            }
        })

        if (gbFlag) {
          body = iconv.encode(body, 'gbk')
        }
        // googlevideo.com manual redirection
        if (typeof(body) === 'string' && body.startsWith(`${httpprefix}://${serverName}`) && body.indexOf('googlevideo.com') !== -1) {
            // need to manually redirect it for youtube workaround.
            console.log(`============== redirect googlevideo.com`)
            try {
                res.setHeader('location', body)
            } catch(e) {
                logSave(`error: ${e}`)
                return
            }
            res.statusCode = '302'
        }
        body = zlib.gzipSync(body)
        try {
            res.setHeader('content-encoding', 'gzip');
            logSave(`handleRespond: res.statusCode:${res.statusCode}, res.headers:${JSON.stringify(res.getHeaders())}`)
            if (req.headers['debugflag']==='true') {
                res.removeHeader('content-encoding')
                res.setHeader('content-type','text/plain')
                body=logGet()
            }
            res.end(body);
        } catch(e) {
            logSave(`error: ${e}`)
        }
    }
    // only support https for now.
    const router = (req) => { //return target
    let myRe = new RegExp(`/${httpprefix}/${serverName}.*?/`, 'g') // match group
    req.url = req.url.replace(myRe, '/')

    let {host, httpType} = getHostFromReq(req)
    let target = `${httpType}://${host}`
    logSave(`router, target:${target}, req.url:${req.url}`)
    return target
    }

    let p = proxy({
      target: `https://www.google.com`,
      router,
      /*
      pathRewrite: (path, req) => {
        let {host, httpType} = getHostFromReq(req)
        let newpath = path.replace(`/https/${host}`, '') || '/'
        logSave(`newpath:${newpath}`)
        return newpath
      },
      */
      // hostRewrite: true,
      // autoRewrite: true,
      protocolRewrite: true,
      // followRedirects: true,
      cookieDomainRewrite,
      secure: false,
      changeOrigin: true,
      debug:true,
      onError: (err, req, res) => {
        console.log(`onerror: ${JSON.stringify(err)}`)
        try {
            if ((err.code && (err.code === 'ECONNREFUSED'|| err.code === 'EHOSTUNREACH'|| err.code === 'EPROTO'||
                              err.code === 'ECONNRESET'|| err.code === 'ENOTFOUND')) ||
                (err.reason && err.reason.indexOf('Expected') === -1)) {
                res.status(404).send(`{"error": "${err}"}`)
            }
        } catch(e) {
            logSave(`error of sending 404: ${e}`)
        }
      },
      selfHandleResponse: true, // so that the onProxyRes takes care of sending the response
      onProxyRes: (proxyRes, req, res) => {
        let {host, httpType} = getHostFromReq(req)
        logSave(`proxyRes.status:${proxyRes.statusCode} proxyRes.headers:${JSON.stringify(proxyRes.headers)}`)
        let body = Buffer.from('');
        proxyRes.on('data', function(data) {
          body = Buffer.concat([body, data]);
        })
        proxyRes.on('end', function() {
          let gbFlag = false
          if (proxyRes.headers["content-encoding"] === 'gzip' ||
              proxyRes.headers["content-encoding"] === 'br') {
            let gunzipped
            try {
                if (proxyRes.headers["content-encoding"] === 'br') {
                    gunzipped = zlib.brotliDecompressSync(body)
                    logSave(`zlib.brotli...`)
                } else { //gzip
                    gunzipped = zlib.gunzipSync(body)
                    logSave(`zlib.gunzip...`)
                }
            } catch(e) {
                // res.status(404).send(`{"error": "${e}"}`)
                return
            }
            if (!proxyRes.headers["content-type"] ||
                proxyRes.headers["content-type"].indexOf('text/') !== -1 ||
                proxyRes.headers["content-type"].indexOf('javascript') !== -1 ||
                proxyRes.headers["content-type"].indexOf('urlencoded') !== -1 ||
                proxyRes.headers["content-type"].indexOf('json') !== -1) {
                if (!gunzipped) {
                    res.status(404).send(`{"error":"failed unzip"}`)
                    return
                }
                logSave(`utf-8 text...`)
                let originBody = gunzipped
                body = gunzipped.toString('utf-8');
                if (body.indexOf('="text/html; charset=gb') !== -1 ||
                    body.indexOf(' charset="gb') !== -1 ||
                    body.indexOf('=\'text/html; charset=gb') !== -1) {
                    logSave(`gb2312 found...`)
                    body = iconv.decode(originBody, 'gbk')
                    gbFlag = true
                }
                handleRespond({req, res, body, gbFlag})
            } else {
                // console.log(`2========>${logGet()}`)
                let key = "content-encoding"
                if(key in proxyRes.headers) {
                    res.setHeader(key, proxyRes.headers[key]);
                }
                logSave(`2: res.headers:${JSON.stringify(res.getHeaders())}`)
                if (req.headers['debugflag']==='true') {
                    res.removeHeader('content-encoding')
                    res.setHeader('content-type','text/plain')
                    body=logGet()
                }
                res.end(body)
            }

          } else if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308 ||
                     (proxyRes.headers["content-type"] &&
                       (proxyRes.headers["content-type"].indexOf('text/') !== -1 ||
                        proxyRes.headers["content-type"].indexOf('javascript') !== -1 ||
                        proxyRes.headers["content-type"].indexOf('json') !== -1))) {
            logSave(`utf-8 text...`)
            let originBody = body
            body = body.toString('utf-8');
            if (body.indexOf('="text/html; charset=gb') !== -1 ||
                body.indexOf(' charset="gb') !== -1 ||
                body.indexOf('=\'text/html; charset=gb') !== -1) {
              logSave(`gb2312 found...`)
              body = iconv.decode(originBody, 'gbk')
              gbFlag = true
            }
            handleRespond({req, res, body, gbFlag})
          } else {
            logSave(`3========>${logGet()}`)
            if (req.headers['debugflag']==='true') {
                res.removeHeader('content-encoding')
                res.setHeader('content-type','text/plain')
                body=logGet()
            }
            res.end(body)
          }
        })
        const setCookieHeaders = proxyRes.headers['set-cookie'] || []
        const modifiedSetCookieHeaders = setCookieHeaders
          .map(str => new cookiejar.Cookie(str))
          .map(cookie => {
          logSave(`cookie:${JSON.stringify(cookie)}`)
          if (cookie.path && cookie.path[0] === '/') {
            cookie.domain = `${serverName}`
          }
          cookie.secure = false
          return cookie
          })
          .map(cookie => cookie.toString())
        proxyRes.headers['set-cookie'] =  modifiedSetCookieHeaders
        Object.keys(proxyRes.headers).forEach(function (key) {
          if (key === 'content-encoding' ||
              key === 'content-security-policy' ||
              key === 'x-frame-options' ||
              (key === 'content-length' && proxyRes.headers["content-type"] &&
                (proxyRes.headers["content-type"].indexOf('text/') !== -1 ||
                 proxyRes.headers["content-type"].indexOf('javascript') !== -1 ||
                 proxyRes.headers["content-type"].indexOf('json') !== -1))) {
            logSave(`skip header:${key}`)
            return
          }
          try {
            res.setHeader(key, proxyRes.headers[key]);
          } catch(e) {
              logSave(`error:${e}`)
              return
          }
        });
        res.statusCode = proxyRes.statusCode
        logSave(`res.status:${res.statusCode} res.url:${res.url}, res.headers:${JSON.stringify(res.getHeaders())}`)
        if (res.statusCode === 404) {
            try {
                delete res.headers['content-length'] //remove content-length field
                res.status(404).send("")
            } catch(e) {
                logSave(`error: ${e}`)
            }
            return
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        let myRe = new RegExp(`/${httpprefix}/${serverName}.*?/`, 'g') // match group
        req.url = req.url.replace(myRe, '/')

        let fwdStr = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for']

        let {host, httpType} = getHostFromReq(req)
        console.log(`httpType:${httpType}, host:${host}`)
        if (host.indexOf(serverName) !== -1 || // we cannot request resource from proxy itself
            host == '' || host.indexOf('.') === -1 || (fwdStr && fwdStr.split(',').length > 3)) { // too many forwardings
            res.status(404).send("{}")
            return
        }
        logClear()
        req.headers['host'] = host
        req.headers['referer'] = host
        if ('origin' in req.headers) {
          req.headers['origin'] = host
        }
        proxyReq.path = proxyReq.url = urlModify({httpType, host, url:req.url})
        let newpath = req.url.replace(`/${httpType}/${host}`, '') || '/'
        logSave(`httpType:${httpType}, host:${host}, req.url:${req.url}, req.headers:${JSON.stringify(req.headers)}`)
        Object.keys(req.headers).forEach(function (key) {
          if (key.indexOf('x-') === 0) {
              logSave(`remove key=${key},`)
              proxyReq.removeHeader(key)
          }
          logSave(`set key=${key},`)
          proxyReq.setHeader(key, req.headers[key])
        })
        proxyReq.setHeader('Accept-Encoding', 'gzip')
        proxyReq.setHeader('referer', host)
        logSave(`req host:${host}, req.url:${req.url}, proxyReq.query:${proxyReq.query} proxyReq.path:${proxyReq.path}, proxyReq.url:${proxyReq.url} proxyReq headers:${JSON.stringify(proxyReq.getHeaders())}`)
        if(host === '' || !host) {
            logSave(`------------------ sending status 404`)
            res.status(404).send("{}")
            res.end()
        }

      },
    })
    return p
}

module.exports = Proxy
