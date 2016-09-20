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
    console.log("hola!!!");

     var id = req.body.id;
     var dateFrom = req.body.dateFrom;
     var days = req.body.days;
   
     console.log("id:" + id + ",dateFrom:" + dateFrom + ",days" + days)

    if (id === undefined) {
        // This is an error case, as "message" is required
        res.status(400).send('Request message error');
    } else {
      // Everything is ok
      console.log("OK");
      res.status(200).end();
    }
  } catch (err) {
    context.failure(err.message);
  }
}

exports.ping = function ping () {
 console.log("ping!!");
}

