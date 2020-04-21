// Imports
const _ = require('lodash');
const NodeCache = require('node-cache');
const s3 = require('./s3');
const utils = require('./utils');

// Constants
const DEFAULT_METADATA_FILENAME = '_default.json';


// Create an in-memory cache. While this seems a little unusual for Lambda—which suggests per-file
// invocation—the reality (as documented) is that it's possible that this Lambda can live through a
// couple of calls. Hence, comparing the relative expense of retrieving data from S3, versus the
// cost of standing up a cache that might be reused, we want to stand up a cache with the hopes
// that it will be reused.
const CACHE_PERIOD_SECONDS = 120;
const LOCAL_CACHE = new NodeCache({ stdTTL: CACHE_PERIOD_SECONDS });

const functions = {};

/**
 * Expires any default metadata for the specified key
 * @param key the key to expire
 * @param context the execution context
 */
functions.expireDefaultMetadata = (key, context) => {

  // See if this is a file we want to handle
  if (key.indexOf(DEFAULT_METADATA_FILENAME) < 0) {
    return;
  }

  // Create a cache key
  const cacheKey = `${context.org}-${context.env}:${key}`;

  // Remove any value cached under the key
  LOCAL_CACHE.del(cacheKey);
};

/**
 * Gets the composite default metadata for the specified bucket/key.
 *
 * This returns a single metadata object that represents a merge, from left to right, of the
 * metadata represented by any default metadata files.
 *
 * @param bucket the bucket in which the files reside
 * @param key the key being processed, for which we'll look for metadata files
 * @param context the execution context for this import
 * @returns {Promise<{}>} the object that represents the composite metadata for this import
 */
functions.getDefaultMetadata = async (bucket, key, context) => {

  // Split the key into paths
  const paths = utils.splitKeyToPaths(key);

  // Convert the key paths into an array of keys representing probable default metadata files
  const defaultMetadataKeys = paths.map(path => `${path}${DEFAULT_METADATA_FILENAME}`);

  // Iterate through the default metadata keys and pull metadata for each that exist
  const metadataObjects = [];
  for (let i = 0; i < defaultMetadataKeys.length; i += 1) {
    const defaultMetadataKey = defaultMetadataKeys[i];
    const metadata = await functions.getMetadataForKey(bucket, defaultMetadataKey, context);
    console.log(`Using: ${JSON.stringify(metadata)}`);
    metadataObjects.push(metadata);
  }

  // Return a merged version of the objects, or an empty object
  return metadataObjects.length > 0 ? _.merge({}, ...metadataObjects) : {};
};

/**
 * Gets a metadata object for the specified JSON file.
 *
 * @param bucket the bucket in which the file resides
 * @param key the key to the JSON file
 * @param context the execution context for this import
 * @returns {Promise<{}>} the object that represents the metadata for the specified key
 */
functions.getMetadataForKey = async (bucket, key, context) => {
  console.log(`Getting metadata for [${key}]`);

  // Create a cache key
  const cacheKey = `${context.org}-${context.env}:${key}`;

  // See if the cache holds our data
  const cachedData = LOCAL_CACHE.get(cacheKey);
  if (cachedData) {
    console.log(`Found cached version for [${key}]: ${JSON.stringify(cachedData)}`);
    return Object.assign({}, cachedData);
  }

  // See if the file exists in S3. Load it if it does
  let metadata = {};
  try {

    // If the object exists, get the data from it.
    const exists = await s3.doesObjectExist(bucket, key);
    if (exists) {
      const fileContents = await s3.getObjectContentsAsJsonString(bucket, key);
      if (fileContents) {
        metadata = JSON.parse(fileContents);
        console.log(`Found version in S3 for [${key}]: ${JSON.stringify(metadata)}`);
      }
    } else {
      console.log(`File does not exist for [${key}]`);
    }

  } catch (err) {
    console.log(`Couldn't load file for [${key}]\nError was: ${err}`);
  }

  // Cache the metadata (only for _default files)
  if (key.indexOf(DEFAULT_METADATA_FILENAME) > 0) {
    LOCAL_CACHE.set(cacheKey, metadata);
  }

  return Object.assign({}, metadata);
};

module.exports = functions;
