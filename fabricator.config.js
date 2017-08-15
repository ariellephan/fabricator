const assembler = require('fabricator-assemble');
const fabricator = {
  config: {
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
    dest: 'dist'
  },
  assetMap: [],
  assembler: function (stats) {
    if (stats) {
      fabricator.assetMap = createHashMap(stats.toJson().assets);
    }
    console.log('Assembling templates.');
    assembler({
      logErrors: fabricator.config.dev,
      dest: fabricator.config.dest,
      buildData: fabricator.assetMap
    });
  }
}

function createHashMap (assets) {
  return assets.reduce(function (map, values) {
    const extension = values.name.split('.').pop();
    const chunkName = values.chunkNames[0];
    if (chunkName) {
      if (!map.hasOwnProperty(chunkName)) {
        map[chunkName] = {};
      }
      map[chunkName][extension] = values.name;
    }
    return map;
  }, {});
}

module.exports = fabricator;
