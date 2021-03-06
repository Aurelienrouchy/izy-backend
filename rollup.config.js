import run from '@rollup/plugin-run';
import babel from 'rollup-plugin-babel';

const dev = process.env.NODE_ENV !== 'production';

export default {
  input: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
  plugins: [
    babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
    }),
    dev &&
      run({
        execArgv: ['-r', 'dotenv/config'],
      }),
  ],
};