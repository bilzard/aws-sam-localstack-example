#!/bin/bash -eu

if [ -e .env-${STAGE} ]; then
  source .env-${STAGE}
fi
