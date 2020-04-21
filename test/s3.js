const mocha = require('mocha');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const describe = mocha.describe;

const TEST_BUCKET = 'arc-goldfish-staging-videos';
const TEST_KEY = 'bulk-import/sandbox/foo/bar/bat.mp4';
const TEST_REGION = 'us-east-1';

/* eslint-disable */
describe('s3', async () => {

  // Set up the module
  let s3Module = proxyquire('../lib/s3', {});

  describe('createUrl', () => {
    it('should create an S3 url', () => {

      process.env.AWS_REGION = TEST_REGION;

      const url = s3Module.createUrl(TEST_BUCKET, TEST_KEY);
      expect(url)
        .to
        .equal(`https://${TEST_BUCKET}.s3.${TEST_REGION}.amazonaws.com/${TEST_KEY}`);

    });
  });
});
