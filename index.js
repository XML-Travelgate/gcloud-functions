const ap = require('./appendFiles')
const cb = require('./combineFiles')

exports.combineFiles = cb.combineFiles(res, req)
exports.appendFiles = ap.appendFiles(res, req)
