const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
      };
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
      return webpackConfig;
    },
  },
};
