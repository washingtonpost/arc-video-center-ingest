const AWS = require('aws-sdk');

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

// Create some helper methods for common things we do

/**
 * Creates an S3 URL, given a bucket and key, and the region in which the Lambda is running
 *
 * @param bucket the bucket
 * @param key the key
 * @return {string}
 */
functions.createUrl = (bucket, key) => {

  const region = process.env.AWS_REGION;

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

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
 * Makes the specified file readable by Video Center.
 *
 * @param bucket the bucket in which the file resides
 * @param key the key representing the file
 * @returns {Promise<void>}
 */
functions.makeFilePublic = async (bucket, key) => {

  // Update the ACL for the object to make it readable by Video Center
  await functions.putObjectAcl({
    Bucket: bucket,
    Key: key,
    ACL: 'public-read'
  });
};

module.exports = functions;
