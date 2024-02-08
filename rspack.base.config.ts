import path from 'path';
import type { Configuration } from '@rspack/cli';

export default function createBaseRspackConfig(): Configuration {
  return {
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
