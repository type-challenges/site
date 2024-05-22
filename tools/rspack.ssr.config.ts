import type { Configuration } from '@rspack/cli';
import { HtmlRspackPlugin, DefinePlugin } from '@rspack/core';
import { merge as deepmerge } from 'ts-deepmerge';
import createBaseRspackConfig from './rspack.base.config';

export default function createSSRRspackConfig(): Configuration {
  const baseConfig = createBaseRspackConfig();
  return deepmerge<[Configuration, Configuration]>(baseConfig, {
    target: 'node',
    entry: {
      ssr: './src/ssr.tsx',
    },
    output: {
      path: './dist/ssr',
      filename: 'ssr.bundle.js',
      library: {
        type: 'commonjs',
      },
    },
    devtool: false,
    plugins: [
      new HtmlRspackPlugin({
        templateContent: '<!DOCTYPE html><html lang="en"></html>',
      }),
      new DefinePlugin({
        WEBPACK_IS_SSR: true,
      }),
    ],
  });
}
