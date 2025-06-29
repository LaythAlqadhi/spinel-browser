const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, '.'),
};
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'require',
  'react-native',
  'default',
];

// Add watchFolders to ensure Metro properly watches react-native modules
config.watchFolders = [
  path.resolve(__dirname, './node_modules/react-native')
];

module.exports = config;