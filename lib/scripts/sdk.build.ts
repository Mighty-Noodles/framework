import browserify from 'browserify';
import tsify from 'tsify';
import fs from 'fs';

import Config from '../../src/config.json';

const bundleFs = fs.createWriteStream('./public/sdk/app.sdk.js');

const b = browserify()
  .plugin(tsify)
  .add('./lib/sdk/auth.sdk.ts');

Config.sdkPaths.forEach(path => {
  b.add(path)
});

b.bundle()
  .on('error', function (error) { console.error(error.toString()); })
  .pipe(bundleFs);

bundleFs.on('finish', function () {
  process.exit();
});
