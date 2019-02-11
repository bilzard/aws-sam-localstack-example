# sam-localstack-example

This is the example project for testing your FaaS function locally using AWS SAM & localstack.

## Requirements

- docker
- AWS SAM cli

## Basic concept

- Do almost everyting on local & make your development cycle faster.
- Decouple your function code from the cloud pratform by dependency injection

The strategy I adopted is based on [the slide](https://speakerdeck.com/twada/testable-lambda-working-effectively-with-legacy-lambda) by Takuto Wada. I wrote the test code mostly based on the article.

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

You can place the dependency modules & your own library in `layer/`.
The resources you put there will be zip & push to the Lambda Layer.

### Set localstack's Dummy Credential

The proper credentials are unnecessary, but you have to set something, otherwise, the test using localstack will fail.

```
aws configure --profile localstack
AWS Access Key ID: dummy
AWS Secret Access Key: dummy
Default region name [None]: us-east-1
Default output format [None]: json
```

### Set Local Environment Variables

You should set the dependency module's include path in your local computer.

```
export NODE_PATH=(the pass to the repository)/layer/nodejs/node8/lib
```

### Run Localstack Docker Container in Background

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

You can place AWS SAM resources in `sam-ploject/`.

`template.yaml` is the SAM template.


### Setup Environment Variables

You should set your own environment setting in `.env-dev`.

```
# in .env-dev
export AWS_DEFAULT_REGION=us-east-1
export SAM_TEMPLATE=template.yaml
export S3_BUCKET_NAME_FOR_SAM_PACKAGE=(your s3 bucket for storing sam build artifacts)
export TEMPLATE_FILE=packaged.yaml
export AWS_PROFILE=(set your AWS profile)
export CFN_STACK_NAME=sam-localstack-example-dev
```

You should also set the `S3Bucket` parameter in `template.yaml`.

Be sure the S3 bucket you set in `S3_BUCKET_NAME_FOR_SAM_PACKAGE` and `S3Bucket` to be created before you package & deploy.

### Build

Run `build.sh` script which wraps `sam build` command:

```
cd sam-project/script
sh build.sh
```

### Package & Deploy

Run `deploy.sh` script which wraps both `sam package` and `sam deploy` commands:

```
cd sam-project/script
STAGE=dev sh deploy.sh
```

## How to Decouple Your Code from the Cloud Platform?

Generally speaking, any dependency in your code on the cloud platform (ex. s3, dynamo DB etc.) prevents your code from local testing. The most orthodox solution is to use the pattern called **dependency injection**.

For example, in the test code below, since the function code has dependency on `AWS.S3`, you can't test the function loccally.

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

But if you fix the funcion code as below:

```js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const parseMailHeader = require('core/getS3Object');

exports.lambdaHandler = async (event, context, callback) => {
  return await parseMailHeader({ s3, event, context, callback });
};
```

The original anonymous function still hard to test, but the new funciton `parseMailHeader` is easy to test, because you can give the dependency (s3) from outside of the function.

Now you can write the test code as below:

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

The endpoint `http://localhost:4572` is the localstack's mock S3 service.
Thus, you can switch dependency between production code and test code.

## Reference

- [Testable Lambda: Working Effectively with Legacy Lambda (Japanese)](https://speakerdeck.com/twada/testable-lambda-working-effectively-with-legacy-lambda)
