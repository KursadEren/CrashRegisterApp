const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [],
  watch: {
    usePolling: true,
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'json', 'ts', 'tsx'], // Kullanılan dosya uzantılarını ekleyin
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
