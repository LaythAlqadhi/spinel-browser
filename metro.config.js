const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, '.'),
};
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = [
    'require',
    'react-native',
    'default',
];

module.exports = config;