const af = require('./appendFiles')
const cf = require('./combineFiles')
const fn = require('./buckets/basecf')

exports.combineFiles = cf.combineFiles
exports.appendFiles = af.appendFiles

exports.tthotcancel = (res, req) => fn.basecf(res, req, TransactionTypeObj(30, 'cancel_', 'TTHOT/', 'Headers/headers_reservation.csv')) 
exports.tthotavail = (res, req) => fn.basecf(res, req, TransactionTypeObj(30, 'avail_', 'TTHOT/', 'Headers/headers_avail.csv')) 
exports.tthotvaluation = (res, req) => fn.basecf(res, req, TransactionTypeObj(30, 'valuation_', 'TTHOT/', 'Headers/headers_reservation.csv')) 
exports.tthotconfirm = (res, req) => fn.basecf(res, req, TransactionTypeObj(30, 'confirm_', 'TTHOT/', 'Headers/headers_reservation.csv')) 
exports.tthotstats = (res, req) => fn.basecf(res, req, TransactionTypeObj(30, 'stats_', 'TTHOT/', 'Headers/headers_stats.csv')) 


function TransactionTypeObj(days, prefix, path, headerFile){
    return {
        days: days,
        prefix: prefix,
        path: path,
        bucketName: 'xtg-bq-export',
        headerFile: headerFile,
        stream: false
    }
}