process.env.cloudflare = 'true'
if (process) {
    // process.env.wranglerDev = 'true' // remove this for production
}
var Proxy = require('./Proxy')
let { blockedSites, urlModify, httpprefix, serverName, port, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace } = require('./config')
let { middle2req, req2middleware, middle2res, res2middleware } = require('./cf_convert2middleware')

var delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let cookieDomainRewrite = serverName


var handleRequest = (request) => { // resolve a cf_res eventually.
    return new Promise(async (resolve, reject) => {
        let timestr = new Date().toISOString()
        let middle_req = req2middleware(request)
        /*
        let cf_proxyReq = new Request('https://www.google.com')
        console.log(`fetching: cf_proxyReq:${JSON.stringify(cf_proxyReq)}`)
        fetch(cf_proxyReq).then(cf_proxyRes => {
            let cf_res = new Response(cf_proxyRes.body, {headers: cf_proxyRes.headers})
            resolve(cf_res)
        })
        */
        try {
            middle_req.url = middle_req.url.replace('https://tutorial.cloudflareworkers.com', '')
            let myRe = new RegExp(`http[s]?://${serverName}[0-9:]*`, 'g') // match group
            middle_req.url = middle_req.url.replace(myRe, '')
            myRe = new RegExp(`/http[s]?/${serverName}[0-9:]*?`, 'g') // match group
            middle_req.url = middle_req.url.replace(myRe, '')
            console.log(`timestr:${timestr}, serverName:${serverName}, middle_req:${JSON.stringify(middle_req)}`)
            if (middle_req.url === '' || middle_req.url === '/') {
                middle_req.url = '/https/www.netptop.com'
            }
            console.log(`${timestr}: after modification, middle_req.url:${middle_req.url}`)
            let {readable, writable} = new TransformStream()
            let writer = writable.getWriter()
            let middle_res = res2middleware({cf_res: new Response(readable)})
            middle_res.write = (data) => {
                console.log(`====> middle_res.send() being called.`)
                if (!middle_res.replied) {
                    console.log(`sending response ...`)
                    middle_res.replied = true
                    let cf_res = middle2res({middle_res, readable})
                    console.log(`sent cf_res:${JSON.stringify(cf_res)}`)
                    resolve(cf_res)
                }
                if (data) {
                    console.log('before getWriter')
                    console.log('after getWriter')
                    writer.write(data) // cloudflare doesn't support writer.ready flag
                    console.log('after write data')
                }
            }
            middle_res.end = middle_res.send = (data) => { // Uint8Array
                middle_res.write(data)
                console.log('writable closed.')
                writer.close()
            }

            // res.status(200).send(`test2`)
            let global_onProxyReq
            let global_onProxyRes
            let global_router
            var ProxyMiddleware = ({target, router, protocolRewrite, cookieDomainRewrite,
                onError, onProxyRes, onProxyReq, secure=false,
                changeOrigin=true, debug=true, selfHandleResponse=true}) => {
                global_onProxyReq = onProxyReq
                global_onProxyRes = onProxyRes
                global_router = router
            }
            Proxy({ProxyMiddleware, blockedSites, urlModify, httpprefix, serverName, port, cookieDomainRewrite, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace})
            console.log(`proxy called`)
            const target = global_router(middle_req) // get target: `${httpType}://${host}`
            console.log(`target:${target}`)
            let middle_proxyReq = req2middleware(new Request(target, {
                redirect: middle_req.redirect,
                method: middle_req.method,
                body: middle_req.body,
            }))
            console.log(`calling onProxyReq...`)
            global_onProxyReq(middle_proxyReq, middle_req, middle_res)
            console.log(`====> after onProxyReq, middle_proxyReq:${JSON.stringify(middle_proxyReq)}`)

            const cf_proxyReq = middle2req(target, middle_proxyReq)
            console.log(`fetching: cf_proxyReq:${JSON.stringify(cf_proxyReq)}`)
            let cf_proxyRes = await fetch(cf_proxyReq).catch(err => {
                console.log(`fetching error: ${JSON.stringify(err)}`)
            })
            /*
            cf_res = new Response(cf_proxyRes.body, {url: cf_proxyRes.url, headers:cf_proxyRes.headers})
            resolve(cf_res)
            console.log(`cf_proxyRes 4`)
            */

            let middle_proxyRes = res2middleware({cf_res:cf_proxyRes}) // no writable
            console.log(`calling onProxyRes...`)
            global_onProxyRes(middle_proxyRes, middle_req, middle_res)
            console.log(`after onProxyRes, cf_proxyRes.body:${JSON.stringify(cf_proxyRes.body)}`)
            middle_res.write(null) // send response first, then stream the body
            if (cf_proxyRes.body === null) { // no response body, no further stream for the body
                return
            }
            let reader = cf_proxyRes.body.getReader()
            while(true) {
                let {done, value} =  await reader.read() // data: Uint8Array
                // console.log(`done:${done}, valu.length:${value?value.length:0}`)
                if (value) {
                    middle_proxyRes.emit('data', value)
                    // middle_res.write(value)
                }
                if (done) {
                    // writer.close()
                    middle_proxyRes.emit('end')
                    break
                }
            }
        // onError: (err, req, res)
        } catch(e) {
            console.log(`error happened:${e}`)
        }
    })
}

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request))
})