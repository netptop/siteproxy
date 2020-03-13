let logStr = ''

let logSave = (addStr) => {
    if (typeof(addStr) !== 'string') {
        return
    }
    if (process.env.localFlag === 'true') {
        let timestr = new Date().toISOString()
        console.log(`${timestr}: ${addStr}`)
    }
    logStr += `${addStr}\n`
}
let logGet = () => {
    return logStr
}
let logClear = () => {
    logStr = ''
}

module.exports = {logSave, logGet, logClear}
