#!/bin/bash

case $1 in
    sandbox)
      ENV="sandbox"
      export $(cat .env.sandbox | sed 's/#.*//g' | xargs)
      ;;
    prod)
      ENV="prod"
      export $(cat .env.prod | sed 's/#.*//g' | xargs)
      ;;
    *)
      echo $"Usage: $0 {sandbox|prod}"
      exit 1
esac
      
STACK_NAME="arc-video-center-ingest-${ENV}"

# Install production dependencies.
rm -Rf node_modules
yarn install --production

# Package the CloudFormation script.
aws cloudformation package \
--template-file stack.yml \
--output-template-file stack.output.yml \
--s3-bucket ${S3_BUCKET} \
--profile ${PROFILE}

# Deploy the CloudFormation script.
aws cloudformation deploy \
--template-file stack.output.yml \
--stack-name ${STACK_NAME} \
--capabilities CAPABILITY_IAM \
--role-arn ${ROLE_ARN} \
--profile ${PROFILE} \
--parameter-overrides \
ArcToken=${ARC_TOKEN} \
ORG=${ORG} \
ENV=${ENV} \
VideoExpirationInDays=${VIDEO_EXPIRATION_IN_DAYS} \
SshPublicKey=${SSH_PUBLIC_KEY}

# Show the CloudFormation output params.
aws cloudformation describe-stacks \
--stack-name ${STACK_NAME} \
--profile ${PROFILE}

# Add dev dependencies back
yarn