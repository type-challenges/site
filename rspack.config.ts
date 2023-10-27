import path from 'path';
import type { Configuration } from '@rspack/cli';
import { ArcoDesignPlugin } from '@arco-plugins/unplugin-react';

export default function createRspackConfig(): Configuration {
  const mode = process.env.NODE_ENV as Configuration['mode'];
  return {
    mode,
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
    builtins: {
      html: [
        {
          minify: true,
          template: './html/index.html',
          favicon: './assets/favicon.svg',
        },
      ],
    },
    devtool: mode === 'production' ? false : 'source-map',
    resolve: {
      alias: {
        '@config': path.resolve(__dirname, './config'),
        '@src': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      new ArcoDesignPlugin({
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
          test: /\.less$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
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
