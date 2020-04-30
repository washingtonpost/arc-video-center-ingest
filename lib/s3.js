const AWS = require('aws-sdk');
const _ = require('lodash');

const s3 = new AWS.S3();

const functions = {};

// Create thin promise wrappers for the SDK methods
functions.copyObject = params => s3.copyObject(params)
  .promise();
functions.getObject = params => s3.getObject(params)
  .promise();
functions.getObjectAcl = params => s3.getObjectAcl(params)
  .promise();
functions.headObject = params => s3.headObject(params)
  .promise();
functions.putObject = params => s3.putObject(params)
  .promise();
functions.putObjectAcl = params => s3.putObjectAcl(params)
  .promise();
functions.putObjectTagging = params => s3.putObjectTagging(params)
  .promise();
functions.getObjectTagging = params => s3.getObjectTagging(params)
  .promise();

// Create some helper methods for common things we do

/**
 * Determines if the specified object exists
 * @param bucket the bucket
 * @param key the key
 * @returns {Promise<boolean>}
 */
functions.doesObjectExist = async (bucket, key) => {

  // Make the request. If it succeeds, we have a file and can proceed.
  //  Else, it will error.
  try {
    await functions.headObject({
      Bucket: bucket,
      Key: key
    });
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Gets the contents of the specified object
 * @param bucket the bucket
 * @param key the key
 * @returns {Promise<string|null>}
 */
functions.getObjectContentsAsJsonString = async (bucket, key) => {

  try {

    // Get the object
    const s3Object = await functions.getObject({
      Bucket: bucket,
      Key: key,
      ResponseContentType: 'application/json'
    });

    // Read the data
    return s3Object.Body.toString('utf-8');

  } catch (err) {
    console.log(`Could not get contents of [${bucket}/${key}]. Error was:\n${err}`);
    return null;
  }
};

/**
 * Get signed url.
 *
 * @param bucket the bucket in which the file resides
 * @param key the key representing the file
 * @returns {Promise<void>}
 */
functions.getSignedUrl = (Bucket, Key) => s3.getSignedUrlPromise(
  'getObject',
  {
    Bucket,
    Key,
    Expires: 60 * 60 * 24 * parseInt(process.env.VideoExpirationInDays, 10)
  }
);

/**
 * Add the additional tags to the S3 object.
 */
functions.addTags = async (Bucket, Key, TagSet) => {
  try {
    const getObjectTaggingData = await functions.getObjectTagging({ Bucket, Key });
    const params = {
      Bucket,
      Key,
      Tagging: {
        TagSet: _.unionWith(getObjectTaggingData.TagSet, TagSet, _.isEqual)
      }
    };
    await functions.putObjectTagging(params);
  } catch (err) {
    console.log(err);
  }
};

module.exports = functions;
