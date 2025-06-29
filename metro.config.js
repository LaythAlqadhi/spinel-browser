const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, '.'),
};

// Enable package exports for better ESM support
config.resolver.unstable_enablePackageExports = true;

// Fix Zustand compatibility with Metro
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    // Resolve to its CommonJS entry (fallback to main/index.js)
    return {
      type: 'sourceFile',
      // require.resolve will pick up the CJS entry (index.js) since "exports" is bypassed
      filePath: require.resolve(moduleName),
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;