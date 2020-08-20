// Imports
const importer = require('./lib/importer');
const metadata = require('./lib/metadata');
const utils = require('./lib/utils');
const s3 = require('./lib/s3');

// Constants
const VIDEO_MATCH_REGEX = '(.+/)*[^/]+.(?:.mp4|.mov|.mxf|.m4v|.mpg|.mpg2)$';
const DEFAULT_METADATA_MATCH_REGEX = '(.+/)*_default.json';

const functions = {};

/**
 * When called with an event from S3, import the file.
 *
 * @param event the event that fired this
 * @param context the execution context
 * @param callback the callback to call for completion
 * @return {Promise<*|void>}
 */
functions.handler = async (event, context, callback) => {
  console.log(JSON.stringify(event));
  try {

    // Get the record
    const record = event.Records[0];

    // Get the bucket and key
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))
    console.log(`Received event for [${bucket}/${key}]`);

    // Validate that we want to handle this key. We'll accept video files and default metadata files
    const videoMatcher = key.match(VIDEO_MATCH_REGEX);
    const defaultMetadataMatcher = key.match(DEFAULT_METADATA_MATCH_REGEX);
    if (!videoMatcher && !defaultMetadataMatcher) {
      console.log('Skipping as not handled');
      await s3.addTags(bucket, key, [{ Key: 'ArcExpire', Value: 'True' }]);
      callback(null, { status: 'success' });
      return;
    }

    // Get the execution context
    const executionContext = utils.getExecutionContext();
    console.log(`Execution context: ${JSON.stringify(executionContext)}`);

    // If this was a default metadata file, perform the expiration now
    if (defaultMetadataMatcher) {
      console.log(`Expiring default metadata for key [${key}]`);
      metadata.expireDefaultMetadata(key, executionContext);
      await s3.addTags(bucket, key, [{ Key: 'ArcExpire', Value: 'False' }]);
      callback(null, { status: 'success' });
      return;
    }

    // Set the media tag.
    await s3.addTags(bucket, key, [{ Key: 'ArcExpire', Value: 'True' }]);

    // Import the file
    await importer.importFile(bucket, key, executionContext);

  } catch (err) {
    console.log(err);
    callback({ status: 'error' });
    return;
  }

  callback(null, { status: 'success' });
};

functions.VIDEO_MATCH_REGEX = VIDEO_MATCH_REGEX;
module.exports = functions;
