// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var Storage = require('@google-cloud/storage');

var readline = require('readline');

function getFileStream (bucketName, fileName) {
  if (!bucketName) {
    throw new Error('Bucket not provided. Make sure you have a ' +
      '"bucket" property in your request');
  }
  if (!fileName) {
    throw new Error('Filename not provided. Make sure you have a ' +
      '"file" property in your request');
  }

  // Instantiate a storage client
  var storage = Storage();
  var bucket = storage.bucket(bucketName);
  return bucket.file(fileName).createReadStream();
}

exports.appendFiles = function appendFiles (req, res) {
  try {
     var id = req.query.id;
     var date = req.query.date;
     var days = req.query.days;
     var bucketName = req.query.bucketName;
     var fileName = req.query.fileName;
   
     console.log("id:" + id + ",date:" + date + ",days" + days, ",bucketName:"+bucketName)
    if (id === undefined || id != 'mypass') {
        // This is an error case, as "message" is required
        res.status(400).send('Invalid Id');
    } else {
      // Everything is ok
      console.log("Returning file");
      res.attachment("billing.csv");
      //getFileStream( "xtg-billing", fileName).pipe(res);
      getFileStream( bucketName, fileName).pipe(res);
      //getFileStream( "xtg-bq-export", "daf946fafdb74ca580a110187fdfeff3/TTHOT/avail_transposed_7days.csv").pipe(res);
    }
  } catch (err) {
    context.failure(err.message);
  }
}

exports.ping = function ping () {
 console.log("ping!!");
}

