'use strict';

const gcloud = require('google-cloud');
const fast = require('fast-csv');
const csv = require('csv-parse')

const gcs = gcloud.storage()

function getFile(bucketName, fileName) {
  if (!bucketName) {
    throw new Error('Bucket not provided. Make sure you have a ' +
      '"bucket" property in your request');
  }
  if (!fileName) {
    throw new Error('Filename not provided. Make sure you have a ' +
      '"file" property in your request');
  }

  // Instantiate a storage client
  let bucket = gcs.bucket(bucketName);
  return bucket.file(fileName)
}

exports.appendFiles = function appendFiles (req, res) {
  try {
    const date = req.query.date
    const days = req.query.days
    const bucketName = req.query.bucketName
    const prefix = req.query.prefix

    let files = getFilesName(date, days, prefix);
    getPromisesFiles(files, bucketName);

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

  } catch (err) {
    context.failure(err.message);
  }
}

function getPromisesFiles(files, bucketName){
  files.forEach(file => {
    let promise = new Promise((resolve, reject) => {

      let file_bucket = getFileStream(bucketName, file)
      const data = []


      file_bucket.exists((err, exists) => {
        if (!exists) reject(`file not found: ${file}`);
      })

      file_bucket.createReadStream()
        .pipe(csv())
        .on('data', (record) => data.push(record))
        .on('error', (err) => reject(`err on file: ${file}`))
        .on('end', () => {
          resolve(data)
        })
    })
    promises.push(promise)
  });
}

function getFilesName(init_date, days, prefix){
  let date = init_date.split('-')
  let day = date.pop()
  let month = date.pop()
  let year = date.pop()
  let files = []


  for(let i = 0; i < days; i++){
    let d = day - i;

    if (d < 0) {
      d = 31;
      month--;
    }

    if (month < 0) {
      month = 12;
      year--;
    }

    let file = `${prefix}${year}-${month}-${d}.csv`
    files.push(file)
  }

  return files
}

exports.ping = function ping () {
 console.log("ping!!");
}
