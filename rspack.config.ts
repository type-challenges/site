import path from 'path';
import type { Configuration } from '@rspack/cli';
import { ArcoDesignPlugin } from '@arco-plugins/unplugin-react';
import { CopyRspackPlugin, DefinePlugin } from '@rspack/core';
import HtmlRspackPlugin from '@rspack/plugin-html';

export default function createRspackConfig(): Configuration {
  const mode = process.env.NODE_ENV as Configuration['mode'];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _ = require(path.resolve(__dirname, 'output/ssr.bundle.js'));
  // @ts-ignore
  const ssrFunc = global.getSSRContent;
  const ssrContent = ssrFunc();
  return {
    mode,
    stats: mode === 'production',
    context: __dirname,
    entry: {
      main: './src/main.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash:8].bundle.js',
      chunkFilename: '[name].[contenthash:8].bundle.js',
      cssChunkFilename: '[name].[contenthash:8].bundle.js',
    },
    devtool: mode === 'production' ? false : 'source-map',
    resolve: {
      alias: {
        '@config': path.resolve(__dirname, './config'),
        '@problems': path.resolve(__dirname, './problems'),
        '@src': path.resolve(__dirname, './src'),
      },
    },
    builtins: {
      css: {
        modules: {
          localIdentName: '[path][name]__[local]--[hash:6]',
        },
      },
    },
    plugins: [
      new HtmlRspackPlugin({
        minify: true,
        sri: 'sha256',
        inject: 'body',
        scriptLoading: 'defer',
        favicon: './assets/favicon.png',
        template: './html/index.html',
        templateParameters: {
          ROOT_CONTENT: ssrContent,
        },
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
    module: {
      rules: [
        {
          resourceQuery: /url$/,
          type: 'asset/resource',
        },
        {
          resourceQuery: /raw$/,
          type: 'asset/source',
        },
        {
          test: /\.less$/i,
          use: [
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
          type: 'css',
        },
        {
          test: /\.module\.less$/i,
          use: [
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
          type: 'css/module',
        },
        {
          test: /\.svg$/,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
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
