import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/list.js',
    output: {
      file: 'dist/scripts/list.js',
      format: 'iife'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'src/post.js',
    output: {
      file: 'dist/scripts/post.js',
      format: 'iife'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'src/toc.js',
    output: {
      file: 'dist/scripts/toc.js',
      format: 'iife'
    }
  }
];
