'use strict';

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const assert = require('power-assert');
const parseMailHeader = require('service/general/parseMailHeader');

const credentials = new AWS.SharedIniFileCredentials({profile: 'localstack'});
AWS.config.credentials = credentials;

const config = {
  endpoint: 'http://localhost:4572',
  s3ForcePathStyle: 'true',
}
const s3 = new AWS.S3(config);

/*
 * test suits
 */
describe('service/general/parseMailHeader test suit', () => {
  // shared variables over the test suit
  let event;
  const callback = () => {};

  /*
   * starup
  */
  before(async () => {
    // generate test resource sequence code from timestamp
    const now = new Date().getTime();
    const bucket = `test-bucket-${now}`;
    const key = `message_${now}.txt`;
    event = {
      Bucket: bucket,
      Key: key,
    };
    // create bucket & bucket key
    await s3.createBucket({Bucket: bucket}).promise();
    await s3.putObject({
      Bucket: bucket,
      Key: key,
      ContentType: 'text/plain',
      Body: fs.readFileSync(path.join(__dirname, '..', '..', '..','fixture', 'mail', 'message.txt')),
    }).promise();
  });

  /*
   * test cases
  */
  it('successfully parse message', async () => {
    const message = await parseMailHeader({s3, event, context, callback});
    assert.deepEqual(message, {
      MailHeader: {
        From: {
          Address: 'from-address@example.com',
          Name: 'John Smith',
        },
        Subject: 'Greeting Message',
      },
      S3: {
        Bucket: event.Bucket,
        Key: event.Key,
      },
    });
  });

  // TODO: write text cases for parameter check

  it('throw error if access to non-existent key', async () => {
    await parseMailHeader({s3, event: { Bucket: event.Bucket, Key: 'non-existent' }, context, callback }).catch((error) => {
      assert.equal(error.name, 'NoSuchKey');
      assert.equal(error.message, 'The specified key does not exist.');
    });
  });

  it('throw error if access to non-existent bucket', async () => {
    await parseMailHeader({s3, event: { Bucket: 'non-existent', Key: 'non-existent' }, context, callback }).catch((error) => {
      assert.equal(error.name, 'NoSuchBucket');
      assert.equal(error.message, 'The specified bucket does not exist');
    });
  });

  /*
   * tear-down
   */
  after(async () => {
    // delete bucket key & bucket
    await s3.deleteObject({
      Bucket: event.Bucket,
      Key: event.Key,
    }).promise();
    await s3.deleteBucket({ Bucket: event.Bucket }).promise();
  });
});
