const mocha = require('mocha');
const proxyquireStrict = require('proxyquire')
  .noCallThru();
const sinon = require('sinon');

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

});
