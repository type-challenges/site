import path from 'path';
import type { Configuration } from '@rspack/cli';

export default function createBaseRspackConfig(): Configuration {
  return {
    context: path.resolve(__dirname, '..'),
    output: {
      path: './dist',
      filename: '[name].[contenthash:8].bundle.js',
      chunkFilename: '[name].[contenthash:8].bundle.js',
      cssChunkFilename: '[name].[contenthash:8].bundle.js',
    },
    resolve: {
      alias: {
        '@config': './config',
        '@problems': './problems',
        '@src': './src',
      },
    },
    builtins: {
      css: {
        modules: {
          localIdentName: '[path][name]__[local]--[hash:6]',
        },
      },
    },
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
  };
}
