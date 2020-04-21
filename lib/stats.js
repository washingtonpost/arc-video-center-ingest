// Imports
const _ = require('lodash');
const util = require('util');

// Constants
const DEFAULT_PREFIX = 'arc.video.center.ingest.';

const functions = {};

/**
 * Output a metric.
 *
 * Outputs a metric to the CloudWatch logs, which the DataDog harvester then picks up on.
 *
 * @param params the parameters, should look like:
 * {
 *   name: the name of the metric,
 *   type: the type of the metric (gauge, count),
 *   value: the value of the metric
 *   tags: an array of tags in the form 'key:value'
 * }
 */
function outputMetric(params) {

  // Set some sensible defaults
  if (_.isNil(params.value)) _.assign(params, { value: 1 });
  if (_.isNil(params.tags) || !_.isArray(params.tags)) _.assign(params, { tags: [] });

  const epochTimestamp = _.toInteger(new Date().getTime() / 1000);

  // Build the collection of default tags
  const defaultTags = [`name:${process.env.AWS_LAMBDA_FUNCTION_NAME}`];

  // Ensure that the name has the prefix
  const metricName = params.name.indexOf(DEFAULT_PREFIX) === 0 ? params.name : `${DEFAULT_PREFIX}${params.name}`;

  // Output the metric as a log message. The DataDog integration should pick it up
  console.log(util.format(
    'MONITORING|%s|%s|%s|%s|#%s',
    epochTimestamp,
    params.value,
    params.type,
    metricName,
    `,${_.join(_.union(defaultTags, params.tags))}`
  ));
}


/**
 * Send a gauge reading
 *
 * @param name the name of the gauge
 * @param value the value to send
 * @param tags the tags associated with the send
 */
functions.gauge = (name, value, tags) => {
  outputMetric({
    name,
    value,
    tags,
    type: 'gauge'
  });
};

/**
 * Send a metric increment
 *
 * @param name the name of the metric
 * @param value the value to send
 * @param tags the tags associated with the send
 */
functions.increment = (name, value, tags) => {
  outputMetric({
    name,
    value,
    tags,
    type: 'count'
  });
};

module.exports = functions;
