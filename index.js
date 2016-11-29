const af = require('./appendFiles')
const cf = require('./combineFiles')

exports.combineFiles = af.combineFiles(res, req)
exports.appendFiles = cf.appendFiles(res, req)
