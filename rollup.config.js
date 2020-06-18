import commonjs from '@rollup/plugin-commonjs'; 
import buble from '@rollup/plugin-buble';

export default {
  input: 'src/vue-element-spy.js',
  output: [{
    format: 'umd',
    name: 'VueElementSpy',
    exports: 'named',
    file: "dist/vue-element-spy.umd.js"
  }, {
    format: "es",
    file: "dist/vue-element-spy.esm.js"
  }, {
    format: "iife",
    name: 'VueElementSpy',
    file: "dist/vue-element-spy.js"
  }],
  plugins: [
    commonjs(),
    buble({transforms: { forOf: false }})
  ],
};
