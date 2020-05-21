const mocha = require('mocha');
const proxyquireStrict = require('proxyquire')
  .noCallThru();
const sinon = require('sinon');
const assert = require('chai').assert;

const describe = mocha.describe;

const TEST_BUCKET = 'arc-goldfish-staging-videos';
const TEST_KEY = 'bulk-import/sandbox/foo/bar/bat.mp4';
const TEST_CONTEXT = {
  org: 'staging',
  env: 'sandbox',
  importDomain: 'staging-sandbox.goldfish.video.aws.arc.pub.'
};

/* eslint-disable */
describe('index', async () => {

  let importerMock;

  // Set up the stubs
  let importerStub = {
    importFile: () => {
    }
  };

  // Set up the index module
  let indexModule = proxyquireStrict('../index', {
    './lib/importer': importerStub
  });

  beforeEach(() => {
    importerMock = sinon.mock(importerStub);
  });

  afterEach(() => {
    importerMock.restore();
  });

  describe('handler', () => {
    it('should call importFile with bucket/key, context', async () => {

      importerMock.expects('importFile')
        .once()
        .withArgs(TEST_BUCKET, TEST_KEY, TEST_CONTEXT);

      const event = {
        Records: [
          {
            s3: {
              bucket: {
                name: TEST_BUCKET
              },
              object: {
                key: TEST_KEY
              }
            }
          }
        ]
      };

      await indexModule.handler(event, sinon.fake(), sinon.fake());

      importerMock.verify();
    });
  });
  describe('regex', () => {
    it('should only match keys(strings) ending with mp4/mov/mxf', async () => {
      const {invalidKeys,validKeys} = require('./data/testRegexForS3Keys.json').S3Keys;
      const {VIDEO_MATCH_REGEX} = require('../index');

      validKeys.forEach((key) => {
        try{
          assert.isNotNull(key.match(VIDEO_MATCH_REGEX));
        } catch (e) {
          e.message = "KEY: " + key + " should NOT be null, this should be a valid key";
          throw e;
        }
      });

      invalidKeys.forEach((key) => {
        try{
          assert.isNull(key.match(VIDEO_MATCH_REGEX));
        } catch (e) {
          e.message = "KEY: " + key + " should BE null, this should be and INVALID key";
          throw e;
        }
      });
    });
  });
});
