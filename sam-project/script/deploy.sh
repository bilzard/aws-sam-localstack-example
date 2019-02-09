#!/bin/bash -eu
DIR=$(cd `dirname $0`/../; pwd)
cd $DIR

source script/settings.sh

echo '--- package ---'
sam package \
  --template-file ${SAM_TEMPLATE} \
  --s3-bucket ${S3_BUCKET_NAME_FOR_SAM_PACKAGE} \
  --output-template-file ${TEMPLATE_FILE} \
  --profile ${AWS_PROFILE} \
;

echo '--- deploy ---'
sam deploy \
  --template-file ${TEMPLATE_FILE} \
  --stack-name ${CFN_STACK_NAME} \
  --capabilities CAPABILITY_IAM \
  --profile ${AWS_PROFILE} \
  --parameter-overrides Stage=${STAGE} \
;
