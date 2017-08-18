const path = require('path');
const webpack = require('webpack');
const { config, assembler } = require('./fabricator.config.js')();
const WebpackOnBuildPlugin = require('on-build-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const watchTemplate = require('./watch-template.js');
let isWatching = false;
const isProd = process.env.NODE_ENV === 'production';

const extractSass = new ExtractTextPlugin({
    filename: (getPath) => {
      return getPath("[name].[contentHash].css").replace('scripts', 'styles');
    },
    disable: !isProd
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
function getPlugins() {
  const plugins = [
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({
      'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new WebpackOnBuildPlugin(function (stats) {
      assembler(stats);
      if (!isWatching && !isProd) {
        isWatching = true;
        watchTemplate.watch(assembler);
      }
    }),
    extractSass,
    new CopyWebpackPlugin(toolkitImages),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i })
  ];

  if (!isProd) {
    plugins.push(new webpack.NoEmitOnErrorsPlugin());
  } else {
    plugins.push(new UglifyJsPlugin({
      minimize: true,
      sourceMap: false,
      compress: {
        warnings: false,
      },
      uglifyOptions: {
        ecma: 8
      }
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
      use: {
  	     loader: 'babel-loader',
         options: {
           presets: ['es2015']
         }
       }
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
              loader: "sass-loader",
              options: {
                includePaths: ["node_modules/foundation-sites/scss"]
              }
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
    'fabricator/scripts/f': config.scripts.fabricator,
    'toolkit/scripts/toolkit': config.scripts.toolkit,
  },
  output: {
    path: path.resolve(__dirname, config.dest, 'assets'),
    publicPath: '/assets/',
    filename: '[name].[chunkhash].js',
  },
  devtool: 'source-map',
  plugins: getPlugins(),
  module: {
    loaders: getLoaders(),
  }
};
