import type { Configuration } from '@rspack/cli';
import HtmlRspackPlugin from '@rspack/plugin-html';
import { CopyRspackPlugin, DefinePlugin } from '@rspack/core';
import { ArcoDesignPlugin } from '@arco-plugins/unplugin-react';
import RspackSSRPlugin from './RspackSSRPlugin';
import createBaseRspackConfig from './rspack.base.config';

export default function createRspackConfig(): Configuration {
  const baseConfig = createBaseRspackConfig();
  const mode = process.env.NODE_ENV as Configuration['mode'];
  const template = './html/index.html';
  return {
    ...baseConfig,
    mode,
    stats: mode === 'production',
    entry: {
      main: './src/main.tsx',
    },
    devtool: mode === 'production' ? false : 'source-map',
    watchOptions: {
      ignored: template,
    },
    plugins: [
      new RspackSSRPlugin({
        template,
        token: '{% ROOT_CONTENT %}',
      }),
      new HtmlRspackPlugin({
        template,
        minify: true,
        sri: 'sha256',
        inject: 'body',
        scriptLoading: 'defer',
        favicon: './assets/favicon.png',
      }),
      new CopyRspackPlugin({
        patterns: [
          {
            from: './assets/monaco-editor',
            to: './assets/monaco-editor',
            force: true,
          },
        ],
      }),
      new DefinePlugin({
        WEBPACK_IS_SSR: false,
      }),
      new ArcoDesignPlugin({
        style: 'css',
        theme: '@arco-design/theme-line',
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 100 * 1024,
        maxSize: 200 * 1024,
        cacheGroups: {
          common: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|@arco-design[\\/]web-react)[\\/]/,
            priority: 100,
            name: 'common',
            reuseExistingChunk: true,
          },
          vendors: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            name: 'vendors',
            reuseExistingChunk: true,
          },
          async: {
            chunks: 'async',
            priority: 1,
            name: 'async',
            reuseExistingChunk: true,
          },
        },
      },
    },
  };
}
