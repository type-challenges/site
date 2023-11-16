import path from 'path';
import type { Configuration } from '@rspack/cli';
import { HtmlRspackPlugin, DefinePlugin } from '@rspack/core';
import createBaseRspackConfig from './rspack.base.config';

export default function createSSRRspackConfig(): Configuration {
  const baseConfig = createBaseRspackConfig();
  const mode = process.env.NODE_ENV as Configuration['mode'];
  return {
    ...baseConfig,
    mode,
    target: 'node',
    entry: {
      ssr: './src/ssr.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'dist/ssr'),
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
  };
}
