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
  assembler: function () {
    console.log('Assembling templates.');
    assembler({
      logErrors: fabricator.config.dev,
      dest: fabricator.config.dest,
    });
  }
}

module.exports = fabricator;
