const af = require('./appendFiles')
const cf = require('./combineFiles')
const c = require('./buckets/cftthot')

exports.combineFiles = cf.combineFiles
exports.appendFiles = af.appendFiles

exports.tthotcancel = tthotcancelfn
// exports.tthotAvail = avail.cfavail
// exports.tthotValutaion = valutaion.cfvalutaion
// exports.tthotConfirm = confirm.cfconfirm


function tthotcancelfn(res, req) {
    const data = {
        days: 30,
        prefix: 'cancel_',
        path: 'TTHOT/',
        bucketName: 'xtg-bq-export',
        headerFile: 'Headers/headers_reservation.csv',
        stream: false
    }
    c.cftthot(res, req, data)
}