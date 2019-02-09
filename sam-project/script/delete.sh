#!/bin/bash -eu
DIR=$(cd `dirname $0`/../; pwd)
cd $DIR

source script/settings.sh

echo '--- delete-stack ---'
aws cloudformation delete-stack \
  --stack-name ${CFN_STACK_NAME} \
  --profile ${AWS_PROFILE} \
;

aws cloudformation wait stack-delete-complete \
  --stack-name ${CFN_STACK_NAME} \
  --profile ${AWS_PROFILE} \
;
