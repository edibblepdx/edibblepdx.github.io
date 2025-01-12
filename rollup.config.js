import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
    {
        input: 'scripts/post.js',
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
        input: 'scripts/toc.js',
        output: {
            file: 'dist/scripts/toc.js',
            format: 'iife'
        }
    }
];