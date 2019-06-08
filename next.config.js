const withCSS = require('@zeit/next-css');

module.exports = Object.assign(
  withCSS({
    cssModules: false,
    webpack(config, options) {
      config.module.rules.push({
        test: /\.(png|woff|woff2|eot|ttf|svg|gif|jpg)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/',
          outputPath: 'static/',
        },
      });
      return config;
    },
  })
);
