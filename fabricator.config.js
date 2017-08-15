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
  assembler: function (stats) {
    const assets = stats.toJson().assets;
    const assetMap = assets.reduce(function (map, values) {
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
    console.log(assetMap);
    console.log('Assembling templates.');
    assembler({
      logErrors: fabricator.config.dev,
      dest: fabricator.config.dest,
      assetMap
    });
  }
}

module.exports = fabricator;
