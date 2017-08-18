const deepmerge = require('deepmerge');
const assembler = require('fabricator-assemble');
const fabricator = (basePath = './src/', userConfig = {}, userAssembler = {}) => {
  const config = deepmerge({
    dev: !(process.env.NODE_ENV === "production"),
    scripts: {
      fabricator: basePath + 'assets/fabricator/scripts/fabricator.js',
      toolkit: basePath + 'assets/toolkit/scripts/toolkit.js',
    },
    images: {
      toolkit: ['src/assets/toolkit/images/**/*', 'src/favicon.ico']
    },
    dest: 'dist'
  }, userConfig);
  let assetMap = {};
  const assemblerConfig = () => {
    return deepmerge({
      layouts: [basePath + 'views/layouts/*'],
      layoutIncludes: [basePath + 'views/layouts/includes/*'],
      views: [basePath + 'views/styleguide/**/*', basePath + 'views/pages/**/*'],
      logErrors: config.dev,
      dest: config.dest,
      buildData: Object.assign({
        dev: config.dev,
        env: (config.dev) ? 'devData': 'prodData'
      }, assetMap)
    }, userAssembler);
  };
  return {
    config,
    assembler: function (stats) {
      if (stats) {
        assetMap = createHashMap(stats.toJson().assets);
      }
      console.log('Assembling templates.');
      assembler(assemblerConfig());
    }
  };
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
