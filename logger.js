let logStr = ''

let logSave = (addStr) => {
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
