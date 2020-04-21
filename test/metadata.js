const _ = require('lodash');
const mocha = require('mocha');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const describe = mocha.describe;

const TEST_BUCKET = 'arc-goldfish-staging-videos';
const TEST_DEFAULT_KEY = 'foo/bar/bat/_default.json';
const EXECUTION_CONTEXT = {
  org: 'theorg',
  env: 'theenv',
  importDomain: 'theimportdomain'
};

/* eslint-disable */
describe('importer', async () => {

  let s3Mock;

  // Set up the stubs
  let s3Stub = {
    doesObjectExist: (bucket, key) => {
    }
  };

  // Set up the module
  let metadataModule = proxyquire('../lib/metadata', {
    './s3': s3Stub
  });

  beforeEach(() => {
    s3Mock = sinon.mock(s3Stub);
  });

  afterEach(() => {
    s3Mock.restore();
  });

  describe('getMetadataForKey', async () => {
    it('should return an empty object if not found', async () => {

      s3Mock.expects('doesObjectExist')
        .once()
        .withArgs(TEST_BUCKET, TEST_DEFAULT_KEY)
        .throws();

      const result = await metadataModule.getMetadataForKey(TEST_BUCKET, TEST_DEFAULT_KEY, EXECUTION_CONTEXT);
      expect(_.isEmpty(result))
        .to
        .equal(true);

      s3Mock.verify();
    });
  });
});
