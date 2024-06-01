import path from 'path';
import childProcess from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { RspackPluginInstance, Compiler } from '@rspack/core';

type RspackSSRPluginOptions = {
  id: string;
  template: string;
};

class RspackSSRPlugin implements RspackPluginInstance {
  private readonly templateContent: string;
  private readonly options: RspackSSRPluginOptions;
  constructor(options: RspackSSRPluginOptions) {
    this.options = options;
    const { template } = options;
    this.templateContent = readFileSync(template, { encoding: 'utf-8' });
  }
  apply(compiler: Compiler) {
    const mode = compiler.options.mode;
    const pluginName = RspackSSRPlugin.name;
    const tabFunc =
      mode === 'development'
        ? compiler.hooks.watchRun
        : compiler.hooks.beforeRun;
    tabFunc.tapAsync(pluginName, (compiler, callback) => {
      this.runSSRBuild(compiler, callback);
    });
    tabFunc.tap(pluginName, compiler => {
      this.replaceTemplateFile(compiler);
    });
    compiler.hooks.done.tap(pluginName, () =>
      this.recoverTemplateFile(compiler),
    );
  }
  runSSRBuild(compiler: Compiler, callback: () => void) {
    const mode = compiler.options.mode;
    if (mode !== 'development') {
      callback();
      return;
    }
    const buildProcess = childProcess.spawn('yarn', [
      'build:ssr',
      `--mode=${mode}`,
    ]);
    buildProcess.stdout.on('data', process.stdout.write);
    buildProcess.stderr.on('data', process.stderr.write);
    buildProcess.on('error', process.stderr.write);
    buildProcess.on('close', function (code) {
      if (code === 0) {
        callback();
      } else {
        console.error(`Generate SSR content failed with code ${code}`);
      }
    });
  }
  replaceTemplateFile(compiler: Compiler) {
    const id = this.options.id;
    const context = compiler.context;
    const templateContent = this.templateContent;
    const ssrFilePath = path.resolve(context, './dist/ssr/ssr.bundle.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const getSSRContent = require(ssrFilePath).default;
    delete require.cache[require.resolve(ssrFilePath)];
    const ssrContent = getSSRContent();
    const newTemplateContent = templateContent.replace(
      new RegExp(`<div id="${id}"><\\/div>`),
      `<div id="${id}">${ssrContent}</div>`,
    );
    writeFileSync(
      path.resolve(context, './html/index.html'),
      newTemplateContent,
      {
        encoding: 'utf-8',
      },
    );
  }
  recoverTemplateFile(compiler: Compiler) {
    const context = compiler.context;
    const { id, template } = this.options;
    const templateContent = this.templateContent.replace(
      new RegExp(`<div id="${id}"><\\/div>`),
      `<div id="${id}"></div>`,
    );
    writeFileSync(path.resolve(context, template), templateContent, {
      encoding: 'utf-8',
    });
  }
}

export default RspackSSRPlugin;
