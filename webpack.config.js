const path = require('path');
const webpack = require('webpack');
const assembler = require('fabricator-assemble');
const WebpackOnBuildPlugin = require('on-build-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Define fabricator build config
 */
const config = {
  dev: process.env.NODE_ENV === "development",
  scripts: {
    fabricator: {
      src: './src/assets/fabricator/scripts/fabricator.js'
    },
    toolkit: {
      src: './src/assets/toolkit/scripts/toolkit.js'
    },
  },
  images: {
    toolkit: ['src/assets/toolkit/images/**/*', 'src/favicon.ico']
  },
  templates: {
    watch: 'src/**/*.{html,md,json,yml}',
  },
  dest: 'dist',
};

const extractSass = new ExtractTextPlugin({
    filename: (getPath) => {
      return getPath("[name].css").replace('scripts', 'styles');
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
    new WebpackOnBuildPlugin(function() {
      assembler({
        logErrors: config.dev,
        dest: config.dest,
      });
    }),
    extractSass,
    new CopyWebpackPlugin(toolkitImages),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i })
  ];

  if (isDev) {
    plugins.push(new webpack.NoErrorsPlugin());
    plugins.push(function(compiler) {
      compiler.plugin("after-compiler", function() {
        this.fileDependencies.push(config.templates.watch);
      });
    });
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
    open: true
  },
  entry: {
    'fabricator/scripts/f': config.scripts.fabricator.src,
    'toolkit/scripts/toolkit': config.scripts.toolkit.src,
  },
  output: {
    path: path.resolve(__dirname, config.dest, 'assets'),
    publicPath: '/assets/',
    filename: '[name].js',
  },
  devtool: 'source-map',
  plugins: getPlugins(config.dev),
  module: {
    loaders: getLoaders(),
  }
};
