var middle2req = (target, middle_req) => {
    let headers = new Headers()
    for (let key in middle_req.headers) {
        console.log(`set header:${key}, ${middle_req.headers[key]}`)
        headers.set(key, middle_req.headers[key])
    }
    let targetUrl = `${target}${middle_req.url}`
    let cf_proxyReq = new Request(targetUrl, {
        method: middle_req.method,
        headers,
        body: middle_req.body,
        redirect: middle_req.redirect,
    })
    for (let entry of headers.entries()) {
        console.log(`cf_proxyReq.header[${entry[0]}]=${entry[1]}`)
    }
    return cf_proxyReq
}

var req2middleware = (cf_request) => { // modify CF request so that it can be used as req
    let headers = {}
    for (let pair of cf_request.headers.entries()) {
        headers[pair[0]] = pair[1]
    }
    console.log(`req2middleware, headers:${JSON.stringify(headers)}`)
    let middle_req = {
        url: cf_request.url || '',
        headers,
        body: cf_request.body, // Uint8Array
        bodyUsed: cf_request.bodyUsed,
        cf: cf_request.cf,
        method: cf_request.method,
        redirect: cf_request.redirect,
        on: (evtStr, cb) => {
            console.log(`req.on ${evtStr} being called`)
        },
        pipe: (proxyReq) => {
            console.log(`req.pipeTo being called.`)
            cf_request.body.pipeTo(proxyReq)
        },
        setHeader: function(headerName, value) { // use function keyword to keep this -> middle_req
            // console.log(`setHeader, this=${JSON.stringify(this)}`)
            this.headers[headerName] = value
        },
        removeHeader: function(headerName) { // use function keyword to keep this -> middle_req
            // console.log(`setHeader, this=${JSON.stringify(this)}`)
            delete this.headers[headerName]
        },
        getHeaders: function() { // use function keyword to keep this -> middle_req
            return this.headers
        }
    }
    return middle_req
}

var middle2res = ({middle_res, readable}) => {
    let headers = new Headers()
    console.log(`middle2res 1`)
    headers.delete('set-cookie')
    for (let key in middle_res.headers) {
        if (Array.isArray(middle_res.headers[key])) {
            for (let entry of middle_res.headers[key]) {
                console.log(`header key:${key}`)
                headers.append(key, entry)
            }
        } else {
            console.log(`header key:${key}`)
            headers.append(key, middle_res.headers[key])
        }
    }
    console.log(`before creating Response, middle_res:${JSON.stringify(middle_res)}`)
    let cf_res
    if (middle_res.statusCode === 101 || middle_res.statusCode === 204 ||
        middle_res.statusCode === 205 || middle_res.statusCode === 304) {
        cf_res = new Response(null, {headers, url:middle_res.url, status:middle_res.statusCode})
    } else {
        cf_res = new Response(readable, {headers, url:middle_res.url, status:middle_res.statusCode})
    }
    console.log(`middle2res 2, cf_res:${JSON.stringify(cf_res)}`)
    return cf_res
}

var res2middleware = ({cf_res}) => { // readable in cf_res, and writable being used to redirect data to readable
    let middle_response = {
        headers:{},
        statusCode:cf_res.status,
        ok:cf_res.ok,
        body:cf_res.body,
        onDict: {},
        url: cf_res.url,
    }
    /*
    "1P_JAR=2020-09-13-14; expires=Tue, 13-Oct-2020 14:41:01 GMT; path=/; domain=.google.com; Secure; SameSite=none, "
    "_ga=; expires=Mon, 01-Jan-1990 00:00:00 GMT; path=/; domain=www.google.com, "
    "_ga=; expires=Mon, 01-Jan-1990 00:00:00 GMT; path=/; domain=.www.google.com, "
    "_ga=; expires=Mon, 01-Jan-1990 00:00:00 GMT; path=/; domain=google.com, "
    "_ga=; expires=Mon, 01-Jan-1990 00:00:00 GMT; path=/; domain=.google.com, "
    "NID=204=mE91mWs0nrN6EDW_zLntkq56D_CacrJcT3SZp2cOgMeEvaUIDbnyfUAwCJ3fEf-PtmM3HVbxvCik7Mi-4zsoT2V8zLx1eBwevcZqNQt_dXWuprWL-Q99DrtX_qC4k5maxX0sl8jP_Q3yIIm2xc5reGe-V0DzM83pEAcCscPViXI; expires=Mon, 15-Mar-2021 14:41:01 GMT; path=/; domain=.google.com; Secure; HttpOnly; SameSite=none"
    */
    for (let entry of cf_res.headers.entries()) {
        console.log(`cf_res header: ${entry[0]}, ${entry[1]}`)
        if (entry[0] === 'set-cookie') { // set-cookie member should be an array in http-proxy-middleware
            let cookieStr = cf_res.headers.get('set-cookie')
            cookieStr = cookieStr.replace(/xpires=Mon, /g, 'xpires=Mon,')
            cookieStr = cookieStr.replace(/xpires=Tue, /g, 'xpires=Tue,')
            cookieStr = cookieStr.replace(/xpires=Wed, /g, 'xpires=Wed,')
            cookieStr = cookieStr.replace(/xpires=Thu, /g, 'xpires=Thu,')
            cookieStr = cookieStr.replace(/xpires=Fri, /g, 'xpires=Fri,')
            cookieStr = cookieStr.replace(/xpires=Sat, /g, 'xpires=Sat,')
            cookieStr = cookieStr.replace(/xpires=Sun, /g, 'xpires=Sun,')
            console.log(`cookieStr=${cookieStr}`)
            middle_response.headers['set-cookie'] = cookieStr.split(', ')
        } else {
            middle_response.headers[entry[0]] = entry[1]
        }
    }
    middle_response.status = (statusCode) => {
        middle_response.statusCode = statusCode
        return middle_response
    }
    middle_response.setHeader = (headerName, value) => {
        middle_response.headers[headerName] = value
    }
    middle_response.getHeaders = () => {
        return middle_response.headers
    }
    middle_response.removeHeader = (headerName) => {
        delete middle_response.headers[headerName]
    }
    middle_response.emit = (evtStr, data) => {
        middle_response.onDict[evtStr](data)
    }
    middle_response.on = (evtStr, cb) => {
        console.log(`on called: ${evtStr}`)
        middle_response.onDict[evtStr] = cb
    }

    return middle_response
}

module.exports = { middle2req, res2middleware, middle2res, req2middleware }