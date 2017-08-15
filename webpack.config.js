const path = require('path');
const webpack = require('webpack');
const { config, assembler } = require('./fabricator.config.js');
const WebpackOnBuildPlugin = require('on-build-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const watchTemplate = require('./watch-template.js');
let isWatching = false;

const extractSass = new ExtractTextPlugin({
    filename: (getPath) => {
      return getPath("[name].[contentHash].css").replace('scripts', 'styles');
    },
    disable: config.dev
});

const toolkitImages = (() => {
  return config.images.toolkit.map(from => {
    return { from }
  });
})();

/**
 * Define plugins based on environment
 * @param {boolean} isDev If in development mode
 * @return {Array}
 */
function getPlugins(isDev) {

  const plugins = [
    new CleanWebpackPlugin([config.dest]),
    new webpack.DefinePlugin({}),
    new WebpackOnBuildPlugin(function (stats) {
      assembler(stats);
      if (!isWatching) {
        isWatching = true;
        watchTemplate.watch(assembler);
      }
    }),
    extractSass,
    new CopyWebpackPlugin(toolkitImages),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i })
  ];

  if (isDev) {
    plugins.push(new webpack.NoErrorsPlugin());
  } else {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: false,
      compress: {
        warnings: false,
      },
    }));
  }

  return plugins;

}


/**
 * Define loaders
 * @return {Array}
 */
function getLoaders() {

  const loaders = [
    {
			test: /\.js$/,
			exclude: /(node_modules|prism\.js)/,
			loader: 'babel-loader'
		},
    {
      test: /\.scss$/,
      use: extractSass.extract({
          use: [{
              loader: "css-loader",
              options: {
                sourceMap: true,
                minimize: true
              }
          }, {
            loader: "postcss-loader",
            options: {
              sourceMap: true
            }
          }, {
              loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
      })
    }
  ];

  return loaders;

}

module.exports = {
  devtool: "source-map",
  devServer: {
    contentBase: path.resolve(__dirname, config.dest),
    watchContentBase: true
  },
  entry: {
    'fabricator/scripts/f': config.scripts.fabricator.src,
    'toolkit/scripts/toolkit': config.scripts.toolkit.src,
  },
  output: {
    path: path.resolve(__dirname, config.dest, 'assets'),
    publicPath: '/assets/',
    filename: '[name].[chunkhash].js',
  },
  devtool: 'source-map',
  plugins: getPlugins(config.dev),
  module: {
    loaders: getLoaders(),
  }
};
