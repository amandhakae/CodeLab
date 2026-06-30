/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.js',
  },
  mutate: [
    'src/modules/solutions/solutions.service.js',
    'src/modules/solutions/solutions.controller.js',
    'src/modules/auth/auth.service.js',
  ],
  coverageAnalysis: 'perTest',
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  thresholds: {
    high: 80,
    low: 60,
    break: 0,
  },
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
};
