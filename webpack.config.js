const path = require('path');
const webpack = require('webpack');
const assembler = require('fabricator-assemble');
const WebpackOnBuildPlugin = require('on-build-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Define fabricator build config
 */
const config = {
  dev: process.env.NODE_ENV === "development",
  styles: {
    browsers: 'last 1 version',
    fabricator: {
      src: 'src/assets/fabricator/styles/fabricator.scss',
      dest: 'dist/assets/fabricator/styles',
      watch: 'src/assets/fabricator/styles/**/*.scss',
    },
    toolkit: {
      src: 'src/assets/toolkit/styles/toolkit.scss',
      dest: 'dist/assets/toolkit/styles',
      watch: 'src/assets/toolkit/styles/**/*.scss',
    },
  },
  scripts: {
    fabricator: {
      src: './src/assets/fabricator/scripts/fabricator.js',
      dest: 'dist/assets/fabricator/scripts',
      watch: 'src/assets/fabricator/scripts/**/*',
    },
    toolkit: {
      src: './src/assets/toolkit/scripts/toolkit.js',
      dest: 'dist/assets/toolkit/scripts',
      watch: 'src/assets/toolkit/scripts/**/*',
    },
  },
  images: {
    toolkit: {
      src: ['src/assets/toolkit/images/**/*', 'src/favicon.ico'],
      dest: 'dist/assets/toolkit/images',
      watch: 'src/assets/toolkit/images/**/*',
    },
  },
  templates: {
    watch: 'src/**/*.{html,md,json,yml}',
  },
  dest: 'dist',
};

const extractSass = new ExtractTextPlugin({
    filename: (getPath) => {
      return getPath("[name].[contenthash].css").replace('scripts', 'styles');
    },
    disable: config.dev
});

/**
 * Define plugins based on environment
 * @param {boolean} isDev If in development mode
 * @return {Array}
 */
function getPlugins(isDev) {

  const plugins = [
    new CleanWebpackPlugin([config.dest]),
    new webpack.DefinePlugin({}),
    new WebpackOnBuildPlugin(function() {
      assembler({
        logErrors: config.dev,
        dest: config.dest,
      });
    }),
    extractSass
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
      test: /(\.jpg|\.png)$/,
      loader: 'url-loader?limit=10000',
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
  entry: {
    'fabricator/scripts/f': config.scripts.fabricator.src,
    'toolkit/scripts/toolkit': config.scripts.toolkit.src,
  },
  output: {
    path: path.resolve(__dirname, config.dest, 'assets'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  plugins: getPlugins(config.dev),
  module: {
    loaders: getLoaders(),
  }
};
