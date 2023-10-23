import path from 'path';
import { type Configuration } from '@rspack/cli';
import { ArcoDesignPlugin } from '@arco-plugins/unplugin-react';

module.exports = {
  context: __dirname,
  entry: {
    main: './src/main.tsx',
  },
  output: {
    globalObject: 'self',
    filename: '[name].[contenthash:8].bundle.js',
    chunkFilename: '[name].[contenthash:8].bundle.js',
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
      minChunks: 1,
      minSize: 500 * 1024,
      maxSize: 1000 * 1024,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        common: {
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|@arco-design[\\/]web-react|@monaco-editor\/react)/,
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
} as Configuration;
