const zlib = require("zlib")
const queryString = require('query-string')
const parse = require('url-parse')

const cookiejar = require('cookiejar')
const {CookieAccessInfo, CookieJar, Cookie} = cookiejar

let config = {
    httpprefix: 'https', port: 443,
    serverName: 'siteproxy.netptop.workers.dev',
}
let blockedSites = ['www.chase.com'] // accessing to chase.com was reported by google

if (process.env.herokuAddr) {
    config.serverName = process.env.herokuAddr
}
config.serverName = config.serverName.replace(/https?:\/\//g, '')
console.log(`config.serverName:${config.serverName}`)
if (process.env.localFlag === 'true') {
    config.httpprefix = 'http'
    config.port = '8011'
    process.env.PORT = config.port
    config.serverName = '127.0.0.1'
}
if (process.env.wranglerDev === 'true') {
    console.log('env: wranglerDev=true')
    process.env.localFlag = 'true'
    config.httpprefix = 'http'
    config.serverName = '127.0.0.1'
    config.port = '8787'
}

let {httpprefix, serverName, port, accessCode} = config

const urlModify = ({httpType, host, url}) => {
    // this url is actually a partial url, without https://${host}:${port}
    let newpath = url.replace(`/${httpType}/${host}`, '') || '/'
    var parsed = parse(newpath)
    const parsedQuery = queryString.parse(parsed.query)
    if (host.indexOf('googlevideo.com') !== -1) {
        console.log(`mime = ${parsedQuery['mime']}`)
        if (parsedQuery['mime'] === 'audio/mp4') {
            // parsedQuery['mime'] = 'audio%2Fwebm'
        }
    }
    parsed.set('query', queryString.stringify(parsedQuery))
    // console.log(`after change: ${parsed.href}`)
    return parsed.href
}

const locationReplaceMap302 = ({location, serverName, httpprefix, host, httpType}) => {
    let myRe
    if (!location) {
        return '/'
    }
    if (location.startsWith('https://')) {
        myRe = new RegExp('https://([-a-z0-9A-Z.]+)', 'g')
        location = location.replace(myRe, `${httpprefix}://${serverName}:${port}/https/$1`)
    } else
    if (location.startsWith('http://')) {
        myRe = new RegExp('http://([-a-z0-9A-Z.]+)', 'g')
        location = location.replace(myRe, `${httpprefix}://${serverName}:${port}/http/$1`)
    } else
    if (location.startsWith('/') && location.indexOf(`/${httpType}/${host}`) === -1) {
        location = `/${httpType}/${host}${location}`
    }
    myRe = new RegExp(`/${httpprefix}/${serverName}:${port}`, 'g') // match group
    location = location.replace(myRe, '')
    return location
}

const regReplaceMap = {
    '(["\'])//([-a-z0-9A-Z.]+)': `$1//${serverName}:${port}/https/$2`, // default use https
    'url[(]//([-a-z0-9A-Z.]+)': `url(//${serverName}:${port}/https/$1`,// default use https
    '(http[s]?):(\\\\/)\\\\/([-a-z0-9A-Z])': `${httpprefix}:$2$2${serverName}:${port}$2$1$2$3`,
    '(http[s]?)://([-a-z0-9A-Z])': `${httpprefix}://${serverName}:${port}/$1/$2`,
    '(http[s]?)(%3[aA])(%2[fF])%2[fF]([-a-z0-9A-Z])': `${httpprefix}$2$3$3${serverName}$2${port}$3$1$3$4`,
    '"(http[s]?)://"': `"${httpprefix}://${serverName}:${port}/https/"`,
    ' integrity=".+?"': '', // remove integrity
}

const pathReplace = ({host, httpType, body}) => {
    // href="//127.0.0.1:8011/https/n
    let myRe = new RegExp(`href=([\"\']?)/([-a-z0-9_]+?)`, 'g')
    body = body.replace(myRe, `href=$1/${httpType}/${host}/$2`)

    myRe = new RegExp(`href[ ]?=[ ]?"/([-a-z0-9_])`, 'g')
    body = body.replace(myRe, `href="/${httpType}/${host}/$1`)

    myRe = new RegExp(`(href=\\\\")\\\\/`, 'g')
    body = body.replace(myRe, `$1\\/${httpType}\\/${host}\\/`)

    myRe = new RegExp(` src=([\"\']?)/([-a-z0-9_]+?)`, 'g')
    body = body.replace(myRe, ` src=$1/${httpType}/${host}/$2`)

    myRe = new RegExp(` src="/"`, 'g')
    body = body.replace(myRe, ` src="/${httpType}/${host}/"`)

    myRe = new RegExp(` src=(."././)([a-z])`, 'g')
    body = body.replace(myRe, ` src=$1${serverName}:${port}\\/${httpType}\\/$2`)  // src=\"\/\/s.ytimg.com\/yts\/img\/avatar_48-

    /*
    myRe = new RegExp(' src=(["\'])//([-a-z0-9]+?)', 'g')
    body = body.replace(myRe, ` src=$1//${serverName}:${port}/${httpType}/${host}/$2`)
    */

    myRe = new RegExp('([:, ]url[(]["\']?)/([-a-z0-9]+?)', 'g')
    body = body.replace(myRe, `$1/${httpType}/${host}/$2`)

    myRe = new RegExp('("url":[ ]?")/([-a-z0-9_]+?)', 'g')
    body = body.replace(myRe, `$1/${httpType}/${host}/$2`)

    myRe = new RegExp('("url":[ ]?")(\\\\/)([-a-z0-9_]+?)', 'g')
    body = body.replace(myRe, `$1$2${httpType}$2${host}/$3`)  // {"url":"\/watch?v=tTzRY7F_1OU",...}

    myRe = new RegExp('(sUrl":[ ]?")/([-a-z0-9_]+?)', 'g')
    body = body.replace(myRe, `$1/${httpType}/${host}/$2`)

    myRe = new RegExp('(url:[ ]?")/([-a-z0-9_]+?)', 'g')
    body = body.replace(myRe, `$1/${httpType}/${host}/$2`)

    myRe = new RegExp('(rl.":.")./([-a-z0-9_]+?)', 'g')
    body = body.replace(myRe, `$1\\/${httpType}\\/${host}\\/$2`)

    myRe = new RegExp('(rl.":.")././([-a-z0-9_]+?)', 'g') // interpreterUrl\":\"\/\/www.google.com\/js\/bg\/jeQSBy52GP_vj-aLADK6D_RsHFfZXrt-vZElH-uv2ok.js\"`)).toBe(-1)
    body = body.replace(myRe, `$1\\/\\/${serverName}:${port}\\/${httpType}\\/$2`)

    myRe = new RegExp('("path":")/([-a-z0-9_]+?)', 'g')
    body = body.replace(myRe, `$1/${httpType}/${host}/$2`)

    myRe = new RegExp(' action="/([-a-z0-9A-Z]+?)', 'g')
    body = body.replace(myRe, ` action="/${httpType}/${host}/$1`)

    return body
}

const siteSpecificReplace = {
    'www.google.com': {
        '(s=.)/images/': `$1/https/www.google.com/images/`,
        '(/xjs/_)':`/https/www.google.com$1`,
        'srcset="/images/branding/googlelogo': `srcset="/https/www.google.com/images/branding/googlelogo`,
        '"(/gen_204\?)': `"/https/www.google.com$1`,
        '"(www.gstatic.com)"': `"${serverName}:${port}/https/$1"`,
        'J+"://"': `J+"://${serverName}:${port}/https/"`,
        'continue=.+?"': 'continue="', // fix the gmail login issue.
        's_mda=/.https:(././).+?/http/': `s_mda=/^http:$1`, // recover Ybs regular expression
        'href="/https/www.google.com/g(.;)': 'href="/g$1',
        '[\(]"/url': `\("/https/www.google.com/url`, //s_Gj("/url?sa=t&source=web&rct=j");s_Nj
        '"/url"': `"/https/www.google.com/url"`,
        'f="/"[+]f': `f="/https/www.google.com/"\+f`, // mobile next page issue.
    },
    'www.gstatic.com': {
        'href="/https/www.gstatic.com/g(.;)': 'href="/g$1',
    },
    'accounts.google.com': {
        'Yba=/.+?/http/': `Yba=/^http:\\/\\/`, // recover Ybs regular expression
        'continue%3Dhttps.+?ManageAccount': 'continue%3D', // fix the gmail login issue.
        '"signin/v2': '"https/accounts.google.com/signin/v2',
        'quot;https://[:-a-z0-9A-Z.]+?/https/accounts.google.com/ManageAccount': `quot;`,
    },
    'youtube.com': {
        'b."get_video_info"': `"${httpprefix}://${serverName}:${port}/https/www.youtube.com/get_video_info"`,
        'c<a.C.length': `c<a.C.length&&a.C[c].style`, // fixed the exception.
        // ' .......*?"Captions URL".': ' true', // Ms(Os(a, jfa, null), a, b, "Captions URL") // time costy
        'throw Error."Untrusted URL.+?;': ';',
        '"//"(.this\.{6,10}"/api/stats/qoe")': `"//${serverName}:${port}/https/"$1`, // b=g.Ad("//"+this.o.o.Sh+"/api/stats/qoe"
        'return .\.protocol."://(i1.ytimg.com/vi/)"': `return "${httpprefix}://${serverName}:${port}/https/$1"`, // {return a.protocol+"://i1.ytimg.com/vi/"+b+"/"+(c||"hqdefault.jpg")};
        '(rl%22%3A%22%2F%2F)([-a-z0-9A-Z.]+?)': `$1${serverName}%3A${port}%2Fhttps%2F$2`, // rl%22%3A%22%2F%2Fwww.youtube.com
        // '(.\..."ptracking",)': `"${httpprefix}://${serverName}:${port}/https/www.youtube.com/ptracking",`,//(d.C+"ptracking",    in base.js
        ':"//"[+].\...[+]"/api/stats/"': `:"//${serverName}:${port}/https/www.youtube.com/api/stats/"`, // his.sa=this.O?"/api/stats/"+c:"//"+b.If+"/api/stats/"+c;d&&(t
        'iconChanged_:function.[a-z],[a-z],[a-z]...*\},': `iconChanged_:function(a,b,c){},`, // iconChanged_:function(a,b,c){
        '"/youtubei': `"/https/www.youtube.com/youtubei`,
        '"/api/stats/"': `"/https/www.youtube.com/api/stats/"`,
        '"/service_ajax"': `"/https/www.youtube.com/service_ajax"`,
        // '(this\..\.logo\.hidden.*?[,;])': ``,
        // '(&&this\..\.content\.insertBefore.*?;)': `;`, //  && this.$.content.insertBefore(this.$.guide, this.$["page-manager"]);
        '[&]{2}this\.connectedCallback[(][)][)]:': `):`, // &&this.connectedCallback()):
        '="/sw.js"': `="/https/www.youtube.com/sw.js"`,
        '"://"([+])': `"://${serverName}:${port}/https/"$1`,
        '("\\\\/\\\\/)(www.google.com)': `$1${serverName}:${port}/https/www.google.com`,
        '"://([a-z]+[.]youtube.com/)"': `"://${serverName}:${port}/https/$1"`,
        '"(\\\\\\\\\\\\/).../www.google.com': `"$1$1${serverName}:${port}$1www.google.com`, // tConfig('COMMENTS_BG_IU', \"\\\/\\\/www.google.com
        // '(.\..=this\.fx[(][)]);return (.)': `$1;$2.bandwidthEstimate=1000.1;return $2`,// a.C=this.fx();return a
        '[a-zA-Z]\.setSizeStyle[(]..,.[)]': `1`,
        'a\.....\.style.display=0===.."none":"";': `;`, // a.A[c].style.display = 0 === b ? "none" : "";
        '="/(watch_fragments2_ajax)"': `="/https/www.youtube.com/$1"`,
        '"(\\\\/)yts\\\\/': `"$1https$1www.youtube.com$1yts$1`,
    },
    'm.youtube.com': {
        '"/(results.search_query=)': `"/https/m.youtube.com/$1`,
        '"\\\\/(results.search_query=)': `"\\/https\\/m.youtube.com\\/$1`,
        'mobile-topbar-header-content search-mode"': `mobile-topbar-header-content non-search-mode"`, // enable search on youtube.
        ' non-search-mode cbox"': ` search-mode cbox"`,
        'PLAYER_JS_URL":"': `PLAYER_JS_URL":"\\/https\\/m.youtube.com`,
        'PLAYER_CSS_URL":"': `PLAYER_CSS_URL":"\\/https\\/m.youtube.com`,
        '(if...[|][|])(.\.isMutedByMutedAutoplay)..': `$1($2&&$2())`, // if(!a||a.isMutedByMutedAutoplay())
    },
    'www.youtube.com': {
        '"/(results.search_query=)': `"/https/m.youtube.com/$1`,
        '"./(results.search_query=)': `"\\/https\\/www.youtube.com\\/$1`,
        'PLAYER_JS_URL":"': `PLAYER_JS_URL":"\\/https\\/www.youtube.com`,
        'PLAYER_CSS_URL":"': `PLAYER_CSS_URL":"\\/https\\/www.youtube.com`,
        '(action=.")/results': `$1/https/www.youtube.com/results`,
       // '"/channel': `"/https/www.youtube.com/channel`,
        '"(\\\\/channel)': `"\\/https\\/www.youtube.com$1`,
    },
    'search.yahoo.com': {
        '"./ra./click"': `"\\/https\\/search.yahoo.com\\/ra\\/click"`,
        '(["\']).?/beacon': `$1${serverName}:${port}\\/https\\/search.yahoo.com\\/beacon`,
    },
    'wikipedia.org': {
    },
    'wikimedia.org': {
    },
    'twitter.com': {
        '"/settings"': '"/https/twitter.com/settings"',
        '"/signup"': '"/https/twitter.com/signup"',
        '"/login/error"': '"/https/twitter.com/login/error"',
        '"/i/flow/signup"': '"/https/twitter.com/i/flow/signup"',
        '"/i/sms_login"': '"/https/twitter.com/i/sms_login"',
        '"/login/check"': '"/https/twitter.com/login/check"',
        '"/login"': '"/https/twitter.com/login"',
    },
    'zh-cn.facebook.com': {
        '"/ajax/bz"': `"/https/zh-cn.facebook.com/ajax/bz"`,
    },
    'static.xx.fbcdn.net': {
        '"/ajax/bz"': `"/https/zh-cn.facebook.com/ajax/bz"`,
        '"/intern/common/': '"/https/static.xx.fbcdn.net/intern/common/',
    },
    'www.mitbbs.com': {
        'src="img/': `src="/https/www.mitbbs.com/img/`,
        'alt="img/': `alt="/https/www.mitbbs.com/img/`,
        'src="[.]/img/': `src="/https/www.mitbbs.com/img/`,
        'src="[.]{2}/img/': `src="/https/www.mitbbs.com/img/`,
    },
    'web.telegram.org': {
        '"pluto"': `"${serverName}:${port}/https/pluto"`,
        '"venus"': `"${serverName}:${port}/https/venus"`,
        '"aurora"':`"${serverName}:${port}/https/aurora"`,
        '"vesta"': `"${serverName}:${port}/https/vesta"`,
        '"flora"': `"${serverName}:${port}/https/flora"`,
        ' href=([\"\']?)([-a-z0-9_]+?)': ` href=$1/https/web.telegram.org/$2`,
        ' src=([-a-z0-9_]+?)': ` src=/https/web.telegram.org/$1`,
        '(getJSON.")(js/locales/)': `$1/https/web.telegram.org/js/locales/`,
    },
    'doubibackup.com': {
        ' href=([\"\']?)([-a-z0-9_]+?)': ` href=$1/https/doubibackup.com/$2`,
        ' src=("[-a-z0-9_]+?)': ` src=/https/doubibackup.com/$1`,
    },
    'pornhub.com': {
        '"/dv.p"([ ]?[+][ ]?"hn")': `"/https/www.pornhub.com/dv.p"[ ]?[+][ ]?"$1`,
    },
    'phncdn.com': {
        // '("[:]?//)': `$1${serverName}:${port}/https/`, // default to https
    }
}

module.exports = { blockedSites, urlModify, httpprefix, serverName, port, locationReplaceMap302, regReplaceMap, siteSpecificReplace, pathReplace }
