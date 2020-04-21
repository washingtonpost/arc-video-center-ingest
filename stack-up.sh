#!/bin/bash

PROFILE="???" # AWS credentials 
ROLE_ARN="???" # CloudFormation role that user has access to assume
S3_BUCKET="???" # Bucket where artifacts are uploaded and used by CloudFormation
ORG="???" # Your ARC organization ID
VIDEO_EXPIRATION_IN_DAYS='1'

case $1 in
    sandbox)
      ENV="sandbox"
      ;;
    prod)
      ENV="prod"
      ;;
    *)
      echo $"Usage: $0 {sandbox|prod}"
      exit 1
esac

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
--stack-name arc-video-center-ingest \
--capabilities CAPABILITY_IAM \
--role-arn ${ROLE_ARN} \
--profile ${PROFILE} \
--parameter-overrides \
ArcToken=$(aws kms decrypt --ciphertext-blob fileb://resources/ArcToken.txt ${PROFILE} --output text --query Plaintext | base64 --decode) \
ORG=${ORG} \
ENV=${ENV} \
VideoExpirationInDays=${VIDEO_EXPIRATION_IN_DAYS}

# Show the CloudFormation output params.
aws cloudformation describe-stacks  \
--stack-name arc-video-center-ingest \
--profile ${PROFILE}

# Add dev dependencies back
yarn