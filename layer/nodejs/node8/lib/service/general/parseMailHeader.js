'use strict';


const getS3Object = require('core/getS3Object');
const parseMailHeader = require('core/parseMailHeader');

module.exports = async ({ s3, event, context, callback }) => {
  const bucket = event.Bucket;
  const key    = event.Key;

  const message = await getS3Object({ s3, bucket, key });
  const parsed = await parseMailHeader({ message });
  return {
    MailHeader: parsed,
    S3: {
      Bucket: bucket,
      Key: key,
    }
  };
};
