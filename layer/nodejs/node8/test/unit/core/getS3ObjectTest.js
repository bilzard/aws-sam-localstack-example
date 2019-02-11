/* eslint-env mocha */

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const assert = require('power-assert');
const getS3Object = require('core/getS3Object');

const credentials = new AWS.SharedIniFileCredentials({ profile: 'localstack' });
AWS.config.credentials = credentials;

const config = {
  endpoint: 'http://localhost:4572',
  s3ForcePathStyle: 'true',
};
const s3 = new AWS.S3(config);

/*
 * test suits
 */
describe('core/getS3Object test suit #1', () => {
  // shared variables over the test suit
  let bucket;
  let key;

  /*
   * starup
  */
  before(async () => {
    // generate test resource sequence code from timestamp
    const now = new Date().getTime();
    bucket = `test-bucket-${now}`;
    key = `message_${now}.txt`;
    // create bucket & bucket key
    await s3.createBucket({ Bucket: bucket }).promise();
    await s3.putObject({
      Bucket: bucket,
      Key: key,
      ContentType: 'text/plain',
      Body: fs.readFileSync(path.join(__dirname, '..', '..', 'fixture', 's3', 'message.txt')),
    }).promise();
  });

  /*
   * test cases
  */
  it('successfully get an object from S3 bucket', async () => {
    const message = await getS3Object({ s3, bucket, key });
    assert.equal(message, 'Hi, there.\n');
  });

  it('throw error if access to non-existent key', async () => {
    await getS3Object({ s3, bucket, key: 'non-existent' }).catch((error) => {
      assert.equal(error.name, 'NoSuchKey');
      assert.equal(error.message, 'The specified key does not exist.');
    });
  });

  it('throw error if access to non-existent bucket', async () => {
    await getS3Object({ s3, bucket: 'non-existent', key: 'non-existent' }).catch((error) => {
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
      Bucket: bucket,
      Key: key,
    }).promise();
    await s3.deleteBucket({ Bucket: bucket }).promise();
  });
});
