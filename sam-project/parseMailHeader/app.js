'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const parseMailHeader = require('service/general/parseMailHeader');

exports.lambdaHandler = async (event, context, callback) => {
  return await parseMailHeader({ s3, event, context, callback });
};
