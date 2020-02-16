let logStr = ''

let logSave = (addStr) => {
	logStr += `${addStr}\n`
}
let logGet = () => {
	return logStr
}
let logClear = () => {
	logStr = ''
}

module.exports = {logSave, logGet, logClear}
