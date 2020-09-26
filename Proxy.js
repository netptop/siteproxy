const zlib = require('zlib')
const parse = require('url-parse')
const cookiejar = require('cookiejar')
const iconv = require('iconv-lite')
const pako = require('pako')
const {logSave, logGet, logClear} = require('./logger')
const ProxyMiddleware = require('http-proxy-middleware')

function countUtf8Bytes(s) {
    var b = 0, i = 0, c
    for(;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
    return b
}

function uint8ArrayConcat(arrays) { // for cloudflare
    // sum of individual array lengths
    let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
    if (!arrays.length) return null;

    let result = new Uint8Array(totalLength);
    // for each array - copy it over result
    // next array is copied right after the previous one
    let length = 0;
    for(let array of arrays) {
      result.set(array, length);
      length += array.length;
    }

    return result;
}

var contentTypeIsText = (headers) => {
    if (!headers["content-type"] ||
        headers["content-type"].indexOf('text/') !== -1 ||
        headers["content-type"].indexOf('javascript') !== -1 ||
        headers["content-type"].indexOf('urlencoded') !== -1 ||
        headers["content-type"].indexOf('json') !== -1) {
        return true
    } else {
        return false
    }
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

var saveRecord = ({stream, fwdStr, req, host, pktLen}) => {
    if (fwdStr) {
        let dateStr = new Date().toLocaleString()
        let ips = fwdStr.split(',')
        if (ips.length > 0) {
            let sourceIP = ips[0]
            stream.write(`${dateStr},${sourceIP},${host},${pktLen},${req.url}\n`)
        }
    }
}

var redirect2HomePage = function({res, httpprefix, serverName,} ) {
    try {
        res.setHeader('location',`${httpprefix}://${serverName}`)
    } catch(e) {
        logSave(`error: ${e}`)
        return
    }
    res.status(302).send(``)
}

let getHostFromReq = ({req, serverName}) => { // return target
  // url: http://127.0.0.1:8011/https/www.youtube.com/xxx/xxx/...
  let https_prefix = '/https/'
  let http_prefix = '/http/'
  let host = ''
  let httpType = 'https'
  if (req.url.startsWith(https_prefix)) {
    host = req.url.slice(https_prefix.length, req.url.length)
    let hosts = host.match(/[-a-z0-9A-Z]+\.[-a-z0-9A-Z.]+/g);
    host = hosts.length>0?hosts[0]:''
  } else if (req.url.startsWith(http_prefix)) {
    host = req.url.slice(http_prefix.length, req.url.length)
    let hosts = host.match(/[-a-z0-9A-Z]+\.[-a-z0-9A-Z.]+/g);
    host = hosts.length>0?hosts[0]:''
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
  let originalHost = ''
  if (req.headers['cookie']) {
    let cookiesList = req.headers['cookie'].split(' ')
    .map(str => new cookiejar.Cookie(str))
    .map(cookie => {
        if (cookie.name === 'ORIGINALHOST') {
            originalHost = cookie.value
        }
    })
  }
  let localServeList = ['/index.html', '/', '/favicon.png']
  if (host === '' ||
      (host === serverName && !localServeList.includes(req.url))) {
    if (originalHost !== '') {
        httpType = originalHost.split('/')[0]
        host = originalHost.split('/')[1]
        logSave(`getHostFromReq, use ORIGINALHOST, ${httpType},${host}`)
    }
  }
  logSave(`getHostFromReq, req.url:${req.url}, referer:${req.headers['referer']}, host:${host}, httpType:${httpType}`)
  return {host, httpType}
}

let Proxy = ({ProxyMiddleware, blockedSites, urlModify, httpprefix, serverName, port, cookieDomainRewrite, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace}) => {
    // let stream = fs.createWriteStream("web-records.csv", {flags:'a'})
    var locationMod302 = ({res, serverName, httpprefix, host, httpType}) => {
        let location = res.getHeaders()['location']
        if (res.statusCode == '301' || res.statusCode == '302' || res.statusCode == '303' ||res.statusCode == '307' || res.statusCode == '308') {
            location = locationReplaceMap302({location, serverName, httpprefix, host, httpType})
            logSave(`after replacement, location=${location}`)
            try {
                res.setHeader('location', location)
            } catch(e) {
                logSave(`error: ${e}`)
                return false
            }
        }
        return true
    }
    let handleRespond = ({req, res, body, gbFlag}) => { // text file
        let myRe
        let {host, httpType} = getHostFromReq({req, serverName})
        if (locationMod302({res, serverName, httpprefix, host, httpType}) === false) {
            return
        }
        // logSave(`HandleRespond(), req.url:${req.url}, req.headers:${JSON.stringify(req.headers)}`)
        for(let key in regReplaceMap) {
            myRe = new RegExp(key, 'g') // match group
            body = body.replace(myRe, regReplaceMap[key])
        }
        logSave(`##### host:${host}`)
        if (host) {
            body = pathReplace({host, httpType, body})   //13ms
        }
        logSave(`2`)
        logSave(`3`)
        myRe = new RegExp(`/${httpType}/${host}/${httpType}/${host}/`, 'g') // match group
        body = body.replace(myRe, `/${httpType}/${host}/`)

        logSave(`4`) //1ms
        // put siteSpecificReplace at end
        Object.keys(siteSpecificReplace).forEach( (site) => {
            if (!req.url) {
                return
            }
            if (req.url.indexOf(site) !== -1 || (req.headers['referer'] && req.headers['referer'].indexOf(site) !== -1)) {
                keys = Object.keys(siteSpecificReplace[site])
                keys.forEach( key => {
                    myRe = new RegExp(key, 'g') // match group
                    body = body.replace(myRe, siteSpecificReplace[site][key])
                })
            }
        }) //17ms

        logSave(`5`)
        if (gbFlag) {
          body = iconv.encode(body, 'gbk')
        }
        // googlevideo.com manual redirection
        if (typeof(body) === 'string' && body.startsWith(`${httpprefix}://${serverName}`) && body.indexOf('googlevideo.com') !== -1) {
            // need to manually redirect it for youtube workaround.
            console.log(`============== redirect googlevideo.com`)
            try {
                res.setHeader('location', body) //0ms
            } catch(e) {
                logSave(`error: ${e}`)
                return
            }
            res.statusCode = '302'
        }
        logSave(`5 after replacment,displayed string, body.length:${body.length}`)
        // logSave(`5 after replacment,displayed string: ${body}`)
        if (process.env.cloudflare === 'true') { // in cloudflare environment
            let enc = new TextEncoder()
            body = enc.encode(body)
            logSave(`6 cloudflare, after encoding, uint8array, body.length:${body.length}`) // body is utf-8 uint8Array now
        } else { //node environment
            body = zlib.gzipSync(body) //body is Buffer
        }
        logSave(`7`)
        try {
            res.setHeader('content-encoding', 'gzip');
            logSave(`handleRespond: res.statusCode:${res.statusCode}, res.headers:${JSON.stringify(res.getHeaders())}`)
            if (req.headers['debugflag']==='true') {
                res.removeHeader('content-encoding')
                res.setHeader('content-type','text/plain')
                body = logGet()
            }
            res.end(body);
        } catch(e) {
            logSave(`error: ${e}`)
        }
    }
    // only support https for now.
    const router = (req) => { //return target
    let myRe = new RegExp(`/http[s]?/${serverName}.*?/`, 'g') // match group
    req.url = req.url.replace(myRe, '/')

    let {host, httpType} = getHostFromReq({req, serverName})
    let target = `${httpType}://${host}`
    logSave(`router, target:${target}, req.url:${req.url}`)
    return target
    }

    let p = ProxyMiddleware({
      target: `https://www.google.com`,
      router,
      /*
      pathRewrite: (path, req) => {
        let {host, httpType} = getHostFromReq({req, serverName})
        let newpath = path.replace(`/https/${host}`, '') || '/'
        logSave(`newpath:${newpath}`)
        return newpath
      },
      */
      // hostRewrite: true,
      // autoRewrite: true,
      // proxyTimeout: 15000, // 10 seconds
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
                redirect2HomePage({res, httpprefix, serverName,})
            }
        } catch(e) {
            logSave(`error of sending 404: ${e}`)
        }
      },
      selfHandleResponse: true, // so that the onProxyRes takes care of sending the response
      onProxyRes: (proxyRes, req, res) => {
        let {host, httpType} = getHostFromReq({req, serverName})
        logSave(`proxyRes.status:${proxyRes.statusCode} proxyRes.headers:${JSON.stringify(proxyRes.headers)}`)
        let bodyList = []
        let bodyLength = 0
        let endFlag = false
        proxyRes.on('data', function(data) {
            if (endFlag === true) {
              return // don't have to push it to bodyList
            }
            bodyLength += data.length // data is Uint8Array for cloueflare, and Buffer for node environment
            bodyList.push(data)
            if (bodyLength >= 2500000 && contentTypeIsText(proxyRes.headers) !== true) {
                let body
                if (process.env.cloudflare === 'true') { // in node environment
                    body = uint8ArrayConcat(bodyList) // body is Uint8Array for cloueflare
                } else {
                    body = Buffer.concat(bodyList) // body is Buffer for node environment
                }
                let fwdStr = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for']
                let contentType = proxyRes.headers['content-type']
                let contentLen = proxyRes.headers['content-length']
                if (contentLen >= 155000000 ||
                    (host.indexOf('googlevideo') !== -1 && contentLen >= 2500000)) {
                }
                console.log(`route:${fwdStr}, content-type:${contentType},bulk length:${bodyLength}, content-length:${contentLen}, ${host}`)
                bodyList = []
                bodyLength = 0
                res.write(body)
            }
        })
        proxyRes.on('end', function() {
          if (endFlag === true) {
            return
          }
          console.log(`on end 1, bodyList.length:${bodyList.length}`)
          let body
          if (process.env.cloudflare === 'true') {
            body = uint8ArrayConcat(bodyList) // body is Uint8Array
            if (!body) { // if body is null, end the stream.
                locationMod302({res, serverName, httpprefix, host, httpType})
                res.end(body);
                return
            }
          } else { // in node environment
            body = Buffer.concat(bodyList) // body is Buffer
          }
          console.log(`on end 2, body.length:${body.length}`)
          let gbFlag = false
          if (proxyRes.headers["content-encoding"] === 'gzip' ||
              proxyRes.headers["content-encoding"] === 'br') { // gzip/br encoding
            let gunzipped
            try {
                if (process.env.cloudflare === 'true') { // in cloudflare environment
                    console.log('cloudflare environment')
                    gunzipped = body // in cloudflare, we have gzip
                } else {
                    console.log('node environment')
                    if (proxyRes.headers["content-encoding"] === 'br') {
                        gunzipped = zlib.brotliDecompressSync(body)
                        logSave(`zlib.brotli...`)
                    } else { //gzip
                        gunzipped = zlib.gunzipSync(body)
                    logSave(`zlib.gunzip...`)
                    }
                }
            } catch(e) {
                // res.status(404).send(`{"error": "${e}"}`)
                console.log(`error2:${e}`)
                return
            }
            console.log(`on end 3`)
            if (contentTypeIsText(proxyRes.headers) === true) { //gzip and text
                console.log(`on end 4`)
                if (!gunzipped) {
                    // res.status(404).send(`{"error":"failed unzip"}`)
                    redirect2HomePage({res, httpprefix, serverName,})
                    return
                }
                logSave(`utf-8 text, gunzipped.length:${gunzipped.length}`)
                let originBody = gunzipped
                if (process.env.cloudflare === 'true') { // in cloudflare environment
                    body = new TextDecoder().decode(gunzipped) // gunzipped.toString('utf-8');
                    logSave(`after decode, displayed string, body.length:${body.length}`)
                } else {
                    body = gunzipped.toString('utf-8')
                }
                let searchBody = body.slice(0, 1000)
                if (searchBody.indexOf('="text/html; charset=gb') !== -1 ||
                    searchBody.search(/ontent=.*charset="gb/) !== -1 ||
                    searchBody.search(/ONTENT=.*charset="gb/) !== -1 ||
                    searchBody.indexOf('=\'text/html; charset=gb') !== -1) {
                    logSave(`gb2312 found...`)
                    body = iconv.decode(originBody, 'gbk')
                    gbFlag = true
                }
                let fwdStr = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || ''
                if (proxyRes.statusCode === 200 && proxyRes.headers["content-type"] &&
                    proxyRes.headers["content-type"].indexOf('text/html') !== -1) {
                    // saveRecord({stream, fwdStr, req, host, pktLen:body.length})
                }
                if (proxyRes.statusCode === 200 && req.url.indexOf('/sw.js') !== -1) {
                    // fetching sw.js
                    res.setHeader('service-worker-allowed','/')
                }
                handleRespond({req, res, body, gbFlag}) // body is a displayed string
            } else { // gzip and non-text
                // console.log(`2========>${logGet()}`)
                console.log(`on end 5`)
                let fwdStr = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for']
                let contentType = proxyRes.headers['content-type']
                let contentLen = proxyRes.headers['content-length']
                console.log(`end,route:${fwdStr}, content-type:${contentType},gzip length:${bodyLength}, content-length:${contentLen}, ${host}`)
                try {
                    res.end(body)
                } catch(e) {
                    console.log(`error:${e}`)
                }
            }
          } else if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308 ||
                     contentTypeIsText(proxyRes.headers) === true) { // text with non gzip encoding
            logSave(`utf-8 text...`)
            let originBody = body
            if (process.env.cloudflare === 'true') { // in cloudflare environment
                body = new TextDecoder().decode(body) // Uint8Array(utf-8 arrayBuffer) toString('utf-8')
            } else { // node environment
                body = body.toString('utf-8');
            }
            if (body.indexOf('="text/html; charset=gb') !== -1 ||
                body.indexOf(' charset="gb') !== -1 ||
                body.indexOf('=\'text/html; charset=gb') !== -1) {
              logSave(`gb2312 found...`)
              body = iconv.decode(originBody, 'gbk')
              gbFlag = true
            }
            handleRespond({req, res, body, gbFlag})
          } else { // non-gzip and non-text body
            logSave(`3========>${logGet()}`)
            let fwdStr = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for']
            let contentType = proxyRes.headers['content-type']
            let contentLen = proxyRes.headers['content-length']
            console.log(`end,route:${fwdStr}, content-type:${contentType},length:${bodyLength}, content-length:${contentLen}, ${host}`)
            if (process.env.cloudflare === 'true') { // in cloudflare environment
                res.end(Uint8Array.from(body))
            } else { // node environment
                res.end(body)
            }
          }
        })
        const setCookieHeaders = proxyRes.headers['set-cookie'] || []
        console.log(`1`)
        let datestr = ''
        let datestrOriginHost = ''
        if (setCookieHeaders.length > 0) {
            let curDate = new Date()
            let date = new Date(curDate.getTime() + 7200 * 1000) // 2 hours later
            datestr = date.toUTCString()
            date = new Date(curDate.getTime() + 600 * 1000) // 10 mins later
            datestrOriginHost = date.toUTCString()
        }
        console.log(`2, setCookieHeaders:${JSON.stringify(setCookieHeaders)}`)
        const modifiedSetCookieHeaders = setCookieHeaders
          .map(str => new cookiejar.Cookie(str))
          .map(cookie => {
          logSave(`cookie:${JSON.stringify(cookie)}`)
          if (cookie.path && cookie.path[0] === '/') {
            cookie.domain = `${serverName}`
            cookie.expiration_date = datestr
            cookie.path = `/${httpType}/${host}${cookie.path}`
          }
          cookie.secure = false
          return cookie
          })
          .map(cookie => cookie.toString())
        console.log(`3`)
        let cookie_originalHost= new cookiejar.Cookie()
        cookie_originalHost.name = 'ORIGINALHOST'
        cookie_originalHost.value = `${httpType}/${host}`
        cookie_originalHost.domain = `${serverName}`
        cookie_originalHost.expiration_date = datestrOriginHost
        cookie_originalHost.path = `/`
        cookie_originalHost.secure = false
        modifiedSetCookieHeaders.push(cookie_originalHost.toString())
        console.log(`4`)
        proxyRes.headers['set-cookie'] =  modifiedSetCookieHeaders
        Object.keys(proxyRes.headers).forEach(function (key) {
          if (key === 'content-security-policy' ||
              key === 'x-frame-options' ||
              (key === 'content-length' && contentTypeIsText(proxyRes.headers) === true)) {
            logSave(`skip header:${key}`)
            return
          }
          try {
            if (key === 'content-encoding' && contentTypeIsText(proxyRes.headers) === true) {
                res.setHeader(key, 'gzip') // for text response, we need to set it gzip encoding cuz we will do gzip on it
            } else {
                res.setHeader(key, proxyRes.headers[key])
            }
          } catch(e) {
              logSave(`error:${e}`)
              return
          }
        });
        res.statusCode = proxyRes.statusCode

        locationMod302({res, serverName, httpprefix, host, httpType})
        logSave(`res.status:${res.statusCode} res.url:${res.url}, res.headers:${JSON.stringify(res.getHeaders())}`)
        if (res.statusCode === 404) {
            try {
                if (res.headers && res.headers['content-length']) {
                    delete res.headers['content-length'] //remove content-length field
                }
                redirect2HomePage({res, httpprefix, serverName,})
            } catch(e) {
                logSave(`error: ${e}`)
            }
            return
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        let myRe = new RegExp(`/http[s]?/${serverName}[0-9:]*?`, 'g') // match group
        req.url = req.url.replace(myRe, '')
        if (req.url.length === 0) {
            req.url = '/'
        }

        let fwdStr = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for']

        let {host, httpType} = getHostFromReq({req, serverName})
        for (let i=0; i<blockedSites.length; i++) {
            let site = blockedSites[i]
            if (site === host) {
                redirect2HomePage({res, httpprefix, serverName,})
                return
            }
        }
        let timestr = new Date().toISOString()
        console.log(`route:${fwdStr}, httpType:${httpType}, host:${host}`)
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
          // remove nginx/cloudflare/pornhub related headers
          if ((host.indexOf('twitter.com') === -1 && key.indexOf('x-') === 0) ||
              key.indexOf('sec-fetch') === 0 ||
              key.indexOf('only-if-cached') === 0 ||
              key.indexOf('cf-') === 0) {
              logSave(`remove key=${key},`)
              proxyReq.removeHeader(key)
              if (key === 'sec-fetch-mode') {
                  proxyReq.setHeader('sec-fetch-mode', 'cors')
              }
              return
          }
          logSave(`set key=${key},`)
          proxyReq.setHeader(key, req.headers[key])
        })
        proxyReq.setHeader('Accept-Encoding', 'gzip')
        proxyReq.setHeader('referer', host)
        console.log(`host=${host}`)
        if (host.indexOf('youtube.com') !== -1) {
            // proxyReq.setHeader('User-Agent', `Opera/7.50 (Windows XP; U)`)
            // proxyReq.setHeader('User-Agent', `Opera/9.80 (Android 4.1.2; Linux; Opera Mobi/ADR-1305251841) Presto/2.11.355 Version/12.10`)
            // proxyReq.setHeader('User-Agent', `Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0`)
        }
        logSave(`req host:${host}, req.url:${req.url}, proxyReq.query:${proxyReq.query} proxyReq.path:${proxyReq.path}, proxyReq.url:${proxyReq.url} proxyReq headers:${JSON.stringify(proxyReq.getHeaders())}`)
        if(host === '' || !host) {
            logSave(`------------------ sending status 404`)
            redirect2HomePage({res, httpprefix, serverName,})
            res.end()
        }

      },
    })
    return p
}

module.exports = Proxy
