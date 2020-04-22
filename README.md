# arc-video-center-ingest
Ingest videos into ARC Video Center via SFTP &amp; S3 uploads

# How to deploy and host this on your AWS account?

## Fork this GitHub repo

## Create .env.prod and .env.sandbox files
Create a new `.env.prod` file.  This will be ignored by git.

```
PROFILE=
ROLE_ARN=
S3_BUCKET=
ORG=
ENV=prod
ARC_TOKEN=
VIDEO_EXPIRATION_IN_DAYS=1
```

Create a new `.env.sandbox` file.  This will be ignored by git.

```
PROFILE=
ROLE_ARN=
S3_BUCKET=
ORG=
ENV=sandbox
ARC_TOKEN=
VIDEO_EXPIRATION_IN_DAYS=1
```

Here is what each variable is for:
 - PROFILE -> [AWS credentials](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_credentials_profiles.html)
 - ROLE_ARN -> [CloudFormation service role](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html)
 - S3_BUCKET -> Bucket where the lambda artifacts are uploaded and used by CloudFormation.  Create an S3 bucket manually and add the bucket name here
 - ORG -> Your ARC organization ID
 - ARC_TOKEN -> Create an ARC Access Token here: https://<ORG>.arcpublishing.com/developer/access/tokens or here: https://sandbox.<ORG>.arcpublishing.com/developer/access/tokens.  ** Don't check this into GitHub.
 - VIDEO_EXPIRATION_IN_DAYS -> How many days before the video uploaded to S3 should be removed?