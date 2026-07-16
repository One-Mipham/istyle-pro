const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure Metro resolves .ts/.tsx files when .js is requested (pnpm workspace compat)
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json'];

// Fix nanoid/non-secure resolution for react-navigation in CI
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'nanoid/non-secure') {
    // Resolve from the project's own nanoid, not react-navigation's hoisted copy
    const nanoidPath = path.resolve(projectRoot, 'node_modules', 'nanoid', 'non-secure', 'index.cjs');
    return { filePath: nanoidPath, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
