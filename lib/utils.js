// Imports
const moment = require('moment-timezone');
const path = require('path');
const util = require('util');

// Constants
const ANS_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]';
const IMPORT_DOMAIN_FORMAT = {
  sandbox: 'https://api.sandbox.%s.arcpublishing.com/goldfish/video/v2/import/ans',
  prod: 'https://api.%s.arcpublishing.com/goldfish/video/v2/import/ans'
};

const functions = {};

/**
 * Gets a formatted date for ANS from the present moment.
 *
 * @returns {*} a formatted date string
 */
functions.getFormattedAnsDateForNow = () => moment()
  .tz('UTC')
  .format(ANS_DATE_FORMAT);

/**
 * Gets the execution metadata.
 *
 * This includes the org, environment, and import domain. As of this writing, for simplicity's sake,
 * we're going to extract it from the bucket and key. In the future, we'll add the ability to add
 * a custom data file in the root of the bucket, or to otherwise attach metadata somewhere.
 *
 * @param bucket the bucket
 * @param key the key being processed
 */
functions.getExecutionContext = () => {

  // Build the import domain
  const importDomain = util.format(IMPORT_DOMAIN_FORMAT[process.env.ENV], process.env.ORG);

  // Return a metadata object with execution metadata
  return {
    org: process.env.ORG,
    env: process.env.ENV,
    importDomain: importDomain
  };
};

/**
 * Splits the key into components: the path, base filename, and extension
 * @param key the key to split
 * @returns {{path: string, extension: string, name: string}}
 */
functions.splitKeyToComponents = (key) => {

  const basepath = path.dirname(key);
  const extension = path.extname(key);
  const basename = path.basename(key, extension);

  return {
    path: basepath,
    name: basename,
    extension: extension
  };
};

/**
 * Splits the specified key into a collection of subpaths, excluding the last file.
 *
 * For example, a key of 'foo/bar/bat/file.ext', should split to:
 * ['foo/', 'foo/bar/', 'foo/bar/bat/']
 *
 * @param key the key to split
 * @returns {Array} an array of the subpaths
 */
functions.splitKeyToPaths = (key) => {
  if (!key) return [];

  const elements = key.split('/');
  const paths = [];
  for (let i = 0; i < elements.length - 1; i += 1) {
    paths.push(`${elements.slice(0, i + 1)
      .join('/')}/`);
  }

  return paths;
};

module.exports = functions;
