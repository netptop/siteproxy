let logStr = ''

let logSave = (addStr) => {
    if (typeof(addStr) !== 'string') {
        return
    }
    try {
        if (process.env.localFlag === 'true') {
            let timestr = new Date().toISOString()
            console.log(`${timestr}: ${addStr}`)
        }
        logStr += `${addStr}\n`
    } catch(e) {
        console.log(`logSave error happened:${e}`)
    }
}
let logGet = () => {
    return logStr
}
let logClear = () => {
    logStr = ''
}

module.exports = {logSave, logGet, logClear}
