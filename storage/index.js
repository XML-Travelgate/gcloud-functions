'use strict';

const gcloud = require('google-cloud');
const fast = require('fast-csv');
const csv = require('csv-parse')
const gcs = gcloud.storage()

/**
* Given a list of files combine the files without repeating the headers
* and stream the result
*/
exports.appendFiles = function appendFiles (req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const days = req.query.days || 30
    const bucketName = req.query.bucketName
    const prefix = req.query.prefix

    const files = getFiles(date, days, prefix, '', bucketName)
    Promise.all(files)
    .then(data => {
      const files = data.filter(file => file.found).map(x => x.fileName)
      const promises = getDataPromisesFiles(files, bucketName);

      Promise.all(promises)
        .then(values => {
          let t = []
          values.forEach((value, i) => {
            if (i != 0) value.shift()
            t = t.concat(value)
          })
          fast.writeToStream(res, t, {headers: false})
        })
        .catch(err => {
          console.log(err)
          res.status(200).send(err)
        });

    }).catch(err => console.log(err))

  } catch (err) {
    console.log(err.message);
  }
}

/**
* Combine list of files and save it in tmp folder with a guid name
* (make it public) and redirects to the file
*/
exports.combineFiles = function combineFiles(req, res){
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const days = req.query.days || 30;
    const prefix = req.query.prefix;
    const bucketName = req.query.bucketName;
    const path = req.query.path;
    const export_path = req.query.export_path || 'tmp/';
    const id_guid = guid();

    if (!prefix || !bucketName) {
      res.status(400).send('prefix or bucketName not defined');
      return;
    }

    const bucket = gcs.bucket(bucketName);
    const files = getFiles(date, days, prefix, path, bucketName);

    Promise.all(files).then((values) => {

      console.log(files.filter(x => x.found))
      const bucket_files = values
                          .filter(x => x.found)
                          .map(x => x.fileName)
                          .map(f => bucket.file(f))
      const combinedFileName = `${export_path}${id_guid}.csv`
      console.log(`combiend file name: ${combinedFileName}`)
      const combinedFile = bucket.file(combinedFileName)

      let promise = new Promise((resolve, reject) => {
        if (values.length === 0) reject(`not files found for ${date} in ${days} with prefix: ${prefix}`); return;
        bucket.combine(bucket_files, combinedFile, (err, newFile, apiResponse) => {
            if (err) reject(`err: ${err.message}`)
            else resolve(newFile)});
      });

      promise
      .then((data) => {
        data.makePublic((err, apiResponse) => {
          if (!err) {
            res.writeHead(302, {'Location':`https://storage.googleapis.com/${bucketName}/${combinedFileName}`})
            res.end()
          }
        })
      })
      .catch(
        err => {
        console.log(`error @Promise: ${err}`);
        res.status(400).send(`error: ${err}`);
      })

    }).catch(
      err => {
        console.log(`error @Promises.all: ${err}`);
        res.status(400).send(`error: ${err}`);
    })

  } catch(err) {
    console.log(`err general: ${err}`)
  }
}

function showError(error) {
  console.log(err)
  res.status(400).send(`error: ${err}`)
}

/**
* CSV Files ONLY - Given an array of files returns an array of promises that resolvs in
* data from csv
*
* @method getDataPromisesFiles
* @param {Array} files An array of files
* @param {String} bucketName Name of bucket
* @return {Array} Returns An array of promises that resolvs in data of each file
*/
function getDataPromisesFiles(files, bucketName){
  let p = []
  files.forEach(file => {
    let promise = new Promise((resolve, reject) => {

      let file_bucket = getFile(bucketName, file)
      const data = []

      file_bucket.createReadStream()
        .pipe(csv())
        .on('data', (record) => data.push(record))
        .on('error', (err) => reject(`err on file: ${file}`))
        .on('end', () => {
          resolve(data)
        })
    })
    p.push(promise)
  });
  return p;
}

/**
* Method that returns an array of promises of files that resolve in
* an object {fileName: fileName, found: boolean} given a starting date
* and days beyond.
*
* @method getFiles
* @param {String} init_date Initial date that we're looking for
* @param {number} days Days beyond
* @param {String} prefix Common name of file: Ex: 'billing_company_'
* @param {String} path Path of file inside the bucket
* @param {String} bucketName Name of bucket
* @return {Array} Returns An array of promises that resolves in an
* Object with fileName and found status ('boolean')
*/
function getFiles(init_date, days, prefix, path, bucketName){
  let files = []


  for(let i = 0; i < days; i++){
    let date = new Date(init_date)
    date.setDate(date.getDate() - i)
    let time = date.toISOString().slice(0, 10)

    let fileName = `${path}${prefix}${time}.csv`
    let file = getFile(bucketName, fileName)

    let p = new Promise((resolve, reject) => {
      //we check if exists file
      file.exists((err, exists) => {
        if (err) console.log(err)
        else if (exists) {
          resolve({fileName: fileName, found: true})
        }
        resolve({fileName: fileName, found: false})
      })
    })

    files.push(p)

  }

  return files
}

/**
* Method to get a file from a Bucket
*
* @method getFile
* @param {String} bucketName Name of bucket
* @param {String} fileName Name of file
* @return {File} Returns File Object
*/
function getFile(bucketName, fileName) {
  let bucket = gcs.bucket(bucketName);
  return bucket.file(fileName)
}

/**
* Method to buid guid of 36 chars
*
* @method guid
* @return {Boolean} Returns guid
*/
function guid() {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
