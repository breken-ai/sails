var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var rc;

describe('rc JSON config comments', function() {
  var home;
  var originalHome;
  var rcPath;

  before(function() {
    originalHome = process.env.HOME;
    home = fs.mkdtempSync(path.join(os.tmpdir(), 'sails-rc-'));
    process.env.HOME = home;
    rcPath = require.resolve('../../lib/util/rc');
    delete require.cache[rcPath];
    rc = require(rcPath);
    fs.writeFileSync(path.join(home, '.sailsrc'), [
      '{',
      '  // Commonly used to annotate local Sails configuration.',
      '  "port": 1337,',
      '  "message": "// remains part of the value",',
      '  /* block comments are accepted too */',
      '  "enabled": true',
      '}'
    ].join('\n'));
  });

  after(function() {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }
    delete require.cache[rcPath];
    fs.rmSync(home, {recursive: true, force: true});
  });

  it('loads JSON config with line and block comments', function() {
    var config = rc('sails', {}, {});
    assert.strictEqual(config.port, 1337);
    assert.strictEqual(config.message, '// remains part of the value');
    assert.strictEqual(config.enabled, true);
  });

  it('still rejects an unterminated block comment', function() {
    fs.writeFileSync(path.join(home, '.sailsrc'), '{"port": 1337 /* unfinished');
    assert.throws(function() {
      rc('sails', {}, {});
    }, SyntaxError);
  });
});
