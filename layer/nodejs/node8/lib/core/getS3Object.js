module.exports = async ({ s3, bucket, key }) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  const ret = await s3.getObject(params).promise();
  const message = ret.Body.toString();
  return message;
};
