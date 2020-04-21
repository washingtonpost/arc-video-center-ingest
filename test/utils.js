const mocha = require('mocha');
const expect = require('chai').expect;
const utils = require('../lib/utils');

const describe = mocha.describe;

const TEST_BUCKET = 'arc-goldfish-staging-videos';
const TEST_KEY = 'bulk-import/sandbox/foo/bar/bat.mp4';

/* eslint-disable */
describe('utils', async () => {

  describe('getExecutionContext', () => {
    it('should use bucket/key to get the org/env/import domain', () => {

      const context = utils.getExecutionContext(TEST_BUCKET, TEST_KEY);
      expect(context.org)
        .to
        .equal('staging');
      expect(context.env)
        .to
        .equal('sandbox');
      expect(context.importDomain)
        .to
        .equal('staging-sandbox.goldfish.video.aws.arc.pub.');
    });
  });

  describe('splitKeyToComponents', () => {
    it('should return the split key components', () => {

      const { path, name, extension } = utils.splitKeyToComponents(TEST_KEY);
      expect(path)
        .to
        .equal('bulk-import/sandbox/foo/bar');
      expect(name)
        .to
        .equal('bat');
      expect(extension)
        .to
        .equal('.mp4');
    });
  });

  describe('splitKeyToPaths', () => {
    it('should return the split key paths', () => {

      const paths = utils.splitKeyToPaths(TEST_KEY);
      expect(paths)
        .to
        .have
        .lengthOf(4);
      expect(paths[0])
        .to
        .equal('bulk-import/');
      expect(paths[1])
        .to
        .equal('bulk-import/sandbox/');
      expect(paths[2])
        .to
        .equal('bulk-import/sandbox/foo/');
      expect(paths[3])
        .to
        .equal('bulk-import/sandbox/foo/bar/');
    });
  });
});
