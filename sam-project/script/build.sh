#!/bin/bash -eu
DIR=$(cd `dirname $0`/../; pwd)
cd $DIR

source script/settings.sh

echo '--- build ---'
sam build --use-container
