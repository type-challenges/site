import path from 'path';
import type { Configuration } from '@rspack/cli';
import type { SwcLoaderOptions } from '@rspack/core';

export default function createBaseRspackConfig(): Configuration {
  const mode = process.env.NODE_ENV as Configuration['mode'];
  return {
    mode,
    output: {
      path: './dist',
      filename: '[name].[contenthash:8].bundle.js',
      chunkFilename: '[name].[contenthash:8].bundle.js',
      cssChunkFilename: '[name].[contenthash:8].bundle.js',
    },
    resolve: {
      alias: {
        '@config': path.resolve(__dirname, '../config'),
        '@src': path.resolve(__dirname, '../src'),
      },
      extensions: ['...', 'js', '.ts', 'jsx', '.tsx'],
    },
    experiments: {
      css: true,
    },
    module: {
      parser: {
        css: { namedExports: false },
        'css/module': { namedExports: false },
      },
      generator: {
        'css/module': {
          localIdentName: '[local]-[hash]',
        },
      },
      rules: [
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
          test: /\.(jsx?|tsx?)$/,
          exclude: [/node_modules\/@type-challenges\/utils\/index\.d\.ts/],
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                  },
                  transform: {
                    react: {
                      runtime: 'automatic',
                    },
                  },
                },
                rspackExperiments: {
                  import: [
                    {
                      libraryName: '@arco-design/web-react',
                      customName: '@arco-design/web-react/es/{{ member }}',
                      style: true,
                    },
                  ],
                },
              } as SwcLoaderOptions,
            },
          ],
        },
      ],
    },
  };
}
