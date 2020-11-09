import browserify from 'browserify';
import tsify from 'tsify';
import fs from 'fs';

import Config from '../../app.config.json';

const DEFAULT_FOLDER = '.';
const FILENAME = Config.sdk.outFile || 'app.sdk.js';
const DEFAULT_FILEPATH = `${DEFAULT_FOLDER}/${FILENAME}`;

const LIB_SDKS = [
  './lib/sdk/auth.sdk.ts',
];

function run() {
  const bundleFs = fs.createWriteStream(DEFAULT_FILEPATH);
  const b = browserify()
    .plugin(tsify)
    .add('./lib/sdk/auth.sdk.ts');

  addFiles(b);

  b.bundle()
    .on('error', function (error) { console.error(error.toString()); })
    .pipe(bundleFs);
    bundleFs.on('finish', copySdkToOutDirs);
}

function copySdkToOutDirs() {
  Config.sdk.outDirs.forEach(dir => {
    fs.copyFileSync(DEFAULT_FILEPATH, `${dir}/${FILENAME}`);
  });

  fs.unlinkSync(DEFAULT_FILEPATH);

  process.exit();
}

function addFiles(b) {
  [
    ...Config.sdk.files,
    ...LIB_SDKS,
  ].forEach(file => b.add(file));
}

run();
