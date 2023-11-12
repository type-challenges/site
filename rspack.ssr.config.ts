import path from 'path';
import type { Configuration } from '@rspack/cli';
import { HtmlRspackPlugin, DefinePlugin } from '@rspack/core';

export default function createRspackConfig(): Configuration {
  const mode = process.env.NODE_ENV as Configuration['mode'];
  return {
    mode,
    target: 'node',
    context: __dirname,
    entry: {
      ssr: './src/ssr.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'output'),
      filename: 'ssr.bundle.js',
    },
    devtool: false,
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
          exportsOnly: true,
          localIdentName: '[path][name]__[local]--[hash:6]',
        },
      },
    },
    plugins: [
      new HtmlRspackPlugin({
        templateContent: '<!DOCTYPE html><html lang="en"></html>',
      }),
      new DefinePlugin({
        WEBPACK_IS_SSR: true,
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
  };
}
