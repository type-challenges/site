import path from 'path';
import type { Configuration } from '@rspack/cli';
import { ArcoDesignPlugin } from '@arco-plugins/unplugin-react';

export default function createRspackConfig(env: {
  production?: boolean;
}): Configuration {
  const { production } = env;
  return {
    context: __dirname,
    entry: {
      main: './src/main.tsx',
    },
    output: {
      filename: '[name].[contenthash:8].bundle.js',
      chunkFilename: '[name].[contenthash:8].bundle.js',
      cssChunkFilename: '[name].[contenthash:8].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    builtins: {
      html: [
        {
          template: './html/index.html',
          minify: true,
        },
      ],
    },
    devtool: production ? false : 'source-map',
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
        minSize: 500 * 1024,
        maxSize: 1000 * 1024,
        cacheGroups: {
          common0: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|@arco-design[\\/]web-react)[\\/]/,
            priority: 100,
            name: 'common0',
            reuseExistingChunk: true,
          },
          common1: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react-syntax-highlighter|refractor)[\\/]/,
            priority: 100,
            name: 'common1',
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
