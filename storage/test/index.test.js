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

var proxyquire = require('proxyquire').noCallThru();
var xtgCloudStorageUtils = proxyquire('../', {});

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:ping', function () {
  it('ping: should log a message', function () {
    var expectedMsg = 'ping!!';
    var context = getMockContext();
    xtgCloudStorageUtils.ping();

   // assert.equal(context.success.calledOnce, true);
  //  assert.equal(context.failure.called, false);
    assert.equal(console.log.calledWith(expectedMsg), true);
  });
});

