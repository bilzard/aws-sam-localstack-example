# sam-localstack-example

This is a sample implementation of AWS SAM local test using Localstack.

## Requirements

- docker
- AWS SAM cli

## Basic concept

- Make development cycles faster by testing locally
- Keep the Lambda function code loosely coupled from the cloud platform

This code was implemented based on the test strategy introduced in the following slide by Takuto Wada
https://speakerdeck.com/twada/testable-lambda-working-effectively-with-legacy-lambda

## Direcotry Structure

```
.
├── README.md
├── layer/                  # lambda layer
│   └── nodejs/
│       └── node8/
│           ├── lib/
│           │   ├── core/
│           │   └── service/
│           ├── package.json
│           ├── tests/
│           │   ├── fixture/
│           │   └── unit/
│           └── yarn.lock
├── localstack/             # localstack docker compose
│   └── docker-compose.yml
└── sam-project/            # AWS SAM project
    ├── parseMailHeader/
    ├── script/
    ├── .env.dev
    └── template.yaml
```

## Lambda Layer (layer/)

The Lambda Layer code can be placed in `layer/`.
The code placed here is zipped by AWS SAM.

### Set the Dummy Credentials of the Localstack

Localstack does not work if you have not set the dummy credentials.

```
aws configure --profile localstack
AWS Access Key ID: dummy
AWS Secret Access Key: dummy
Default region name [None]: us-east-1
Default output format [None]: json
```

### Setting environment variables

Set the path where the dependency module has installed.

```
export NODE_PATH=(the pass to the repository)/layer/nodejs/node8/lib
```

### Run the Localstack Docker Container in the Background

```
cd localstack
docker compose up -d
```

### Run Unit Test (manually)

```
cd layer/nodejs/node8
yarn install
yarn test
```

### Run Unit Text (automatically)

If you want to run test codes anytime you make changes:

```
yarn watch
```

## AWS SAM Project

SAM resources can be placed in `sam-ploject/`.

### Setup Environment Variables

The setting of the local environment should be described in `.env-dev`.

```
# in .env-dev
export AWS_DEFAULT_REGION=us-east-1
export SAM_TEMPLATE=template.yaml
export S3_BUCKET_NAME_FOR_SAM_PACKAGE=(your s3 bucket for storing sam build artifacts)
export TEMPLATE_FILE=packaged.yaml
export AWS_PROFILE=(set your AWS profile)
export CFN_STACK_NAME=sam-localstack-example-dev
```

Create the S3 Buckets specified for `S3_BUCKET_NAME_FOR_SAM_PACKAGE` and `S3Bucket` in advance.

It is necessary to set the information of S3 Bucket that stores the material to be deployed in temlate.yaml.

### Build

```
cd sam-project/script
sh build.sh
```

### Package & Deploy

```
cd sam-project/script
STAGE=dev sh deploy.sh
```

## Keep Your Code Loosely Coupled to the Cloud Platform

If you want to access the managed services from your Lambda functions, local testing will be difficult.
Use dependency injection to avoid this.

The following code uses S3's client library, so it is difficult to test locally.

```js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.lambdaHandler = async (event, context, callback) => {
  const params = {
    Bucket: bucket,
    Key: key
  };
  const ret = await s3.getObject(params).promise();
  const message = ret.Body.toString();
  ...
};
```

However, modifying the code as follows by injecting S3 client from outside, it is possible to replace S3's client library with test code and production code.

```js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const parseMailHeader = require('core/getS3Object');

exports.lambdaHandler = async (event, context, callback) => {
  return await parseMailHeader({ s3, event, context, callback });
};
```


The lambdaHander function's test is still difficult as local, but parseMailHeader function is locally testable.

You can write test code as follows:

```js
const AWS = require('aws-sdk');
const config = {
  endpoint: 'http://localhost:4572',
  s3ForcePathStyle: 'true',
}
const s3 = new AWS.S3(config);

...
it('successfully parse message', async () => {
  const message = await parseMailHeader({s3, event, context, callback});
  ...
});
```

The endpoint `http://localhost:4572` is a pseudo S3 service endpoint of the local stack.

## Reference

- [Testable Lambda: Working Effectively with Legacy Lambda (Japanese)](https://speakerdeck.com/twada/testable-lambda-working-effectively-with-legacy-lambda)
