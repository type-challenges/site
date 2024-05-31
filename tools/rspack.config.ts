import type { Configuration } from '@rspack/cli';
import HtmlRspackPlugin from '@rspack/plugin-html';
import { DefinePlugin } from '@rspack/core';
import { merge as deepmerge } from 'ts-deepmerge';
import RspackSSRPlugin from './RspackSSRPlugin';
import createBaseRspackConfig from './rspack.base.config';

export default function createRspackConfig(): Configuration {
  const baseConfig = createBaseRspackConfig();
  const mode = process.env.NODE_ENV as Configuration['mode'];
  const template = './html/index.html';
  return deepmerge<[Configuration, Configuration]>(baseConfig, {
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
        id: 'root',
      }),
      new HtmlRspackPlugin({
        template,
        minify: true,
        sri: 'sha256',
        inject: 'body',
        scriptLoading: 'defer',
        favicon: './assets/favicon.png',
      }),
      new DefinePlugin({
        WEBPACK_IS_SSR: false,
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
  });
}
