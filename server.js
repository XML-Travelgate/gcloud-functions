var express = require('express');
var append = require('./appendFilesV2')
var app = express();

app.get('/', append.appendFilesV2);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
