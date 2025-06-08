const nodeResolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const copy = require('rollup-plugin-copy');
const postcss = require('rollup-plugin-postcss');
const htmlMinifier = require('html-minifier-terser');

const isProduction = process.env.NODE_ENV === 'production';

// Extreme minification config
const extremeTerserConfig = {
  compress: {
    passes: 3,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_math: true,
    unsafe_symbols: true,
    drop_console: true,
    drop_debugger: true,
    ecma: 2020,
  },
  mangle: {
    properties: {
      regex: /^_/,
      reserved: ['chrome', 'StorageManager']
    }
  },
  format: {
    comments: false
  }
};

// Shared plugins
const sharedPlugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs({
    strictRequires: true,
    sourceMap: false
  }),
  isProduction && terser(extremeTerserConfig)
].filter(Boolean);

// CSS processing
const cssPlugin = postcss({
  extract: true,
  minimize: isProduction,
  sourceMap: false,
  inject: false
});

module.exports = [
  // Background script
  {
    input: 'src/js/background.js',
    output: {
      file: 'dist/background.js',
      format: 'iife',
      compact: true,
      sourcemap: false
    },
    plugins: [
      ...sharedPlugins,
      copy({
        targets: [
          { 
            src: './manifest.json', 
            dest: 'dist',
            transform: contents => isProduction 
              ? JSON.stringify(JSON.parse(contents.toString())) 
              : contents
          },
          { src: 'src/assets/**/*', dest: 'dist/assets' },
          { 
            src: 'src/html/*.html', 
            dest: 'dist',
            rename: (name, extension, fullPath) => {
              return fullPath.includes('config.html') 
                ? 'config.html' 
                : name;
            },
            transform: contents => isProduction
              ? htmlMinifier.minify(contents.toString(), {
                  collapseWhitespace: true,
                  removeComments: true,
                  minifyCSS: true,
                  minifyJS: true
                })
              : contents
          }
        ]
      })
    ]
  },

  // Frontend bundle (JS + CSS)
  {
    input: 'src/js/explorerUI.js',
    output: {
      file: 'dist/frontend.js',
      format: 'iife',
      compact: true,
      sourcemap: false
    },
    plugins: [
      ...sharedPlugins,
      cssPlugin
    ]
  }
];