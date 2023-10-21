// https://github.com/typescript-exercises/typescript-exercises/blob/main/src/components/monaco-editor/index.tsx
import debounce from 'lodash.debounce';
import { editor, languages, Uri } from 'monaco-editor';
import React from 'react';
import { decorateWithAutoResize } from '@src/components/AutoResizer';
import {
  formatCodeByUpdateTabSize,
  ProblemFiles,
  ProblemRaw,
} from '@src/utils/problems';
import { Setting } from '@src/utils/setting';
import emitter from '@src/utils/emit';
import { revalidateModel } from './revalidate-model';

self.MonacoEnvironment = {
  getWorker: function () {
    return new Worker(
      new URL(
        'monaco-editor/esm/vs/language/typescript/ts.worker',
        import.meta.url,
      ),
    );
  },
};

languages.typescript.typescriptDefaults.setCompilerOptions({
  strict: true,
  target: languages.typescript.ScriptTarget.ES2018,
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  typeRoots: ['declarations'],
});

editor.defineTheme('light', {
  base: 'vs',
  colors: {},
  inherit: true,
  rules: [],
});

editor.defineTheme('dark', {
  base: 'vs-dark',
  colors: {},
  inherit: true,
  rules: [],
});

export interface MonacoEditorProps {
  width?: number | string;
  height?: number | string;
  namespace?: string;
  raw: ProblemRaw;
  selectedFilename: ProblemFiles;
  onChange?: (filename: ProblemFiles, content: string) => void;
  setting: Setting;
}

interface Models {
  [key: string]: editor.IModel;
}

const MonacoEditor = decorateWithAutoResize(
  class extends React.Component<MonacoEditorProps> {
    protected instance: editor.IStandaloneCodeEditor | null = null;
    protected instanceDiv: HTMLElement | null = null;
    protected models: Models = {};
    protected viewStates: { [filename: string]: editor.ICodeEditorViewState } =
      {};
    protected lastUpdates: { [filename: string]: string } = {};
    updateTabSize = (prev: Setting['tabSize'], next: Setting['tabSize']) => {
      const model = this.models[ProblemFiles.template];
      model.setValue(formatCodeByUpdateTabSize(model.getValue(), prev, next));
    };
    componentDidMount() {
      for (const [filename, { content }] of Object.entries(this.props.raw)) {
        this.lastUpdates[filename] = content;
        const model = editor.createModel(
          content,
          undefined,
          Uri.file(`${this.props.namespace}/${filename}`),
        );
        model.onDidChangeContent(
          debounce(() => {
            const newValue = model.getValue();
            this.lastUpdates[filename] = newValue;
            this.props.onChange?.(filename as ProblemFiles, newValue);
          }, 200),
        );
        this.models[filename] = model;
      }
      this.instance = editor.create(this.instanceDiv!, {
        ...this.props.setting,
        model: this.models[this.props.selectedFilename],
        readOnly: Boolean(this.props.raw[this.props.selectedFilename].readOnly),
        renderValidationDecorations: 'on',
        minimap: {
          enabled: false,
        },
        autoIndent: 'advanced',
        formatOnPaste: true,
        formatOnType: true,
      });
      this.instance.layout();
      emitter.on('tabSizeChange', this.updateTabSize);
    }
    componentWillUnmount() {
      emitter.off('tabSizeChange', this.updateTabSize);
      for (const filename of Object.keys(this.models)) {
        this.models[filename].dispose();
      }
      if (this.instance) {
        this.instance.dispose();
      }
      this.instance = null;
    }
    componentDidUpdate(prevProps: Readonly<MonacoEditorProps>): void {
      if (!this.instance) {
        return;
      }
      this.instance.updateOptions(this.props.setting);
      const newSelectedFilename = this.props.selectedFilename;
      if (newSelectedFilename !== prevProps.selectedFilename) {
        const model = this.models[newSelectedFilename];
        this.viewStates[prevProps.selectedFilename] =
          this.instance.saveViewState()!;
        this.instance.setModel(model);
        this.instance.updateOptions({
          readOnly: Boolean(this.props.raw[newSelectedFilename].readOnly),
        });
        const viewState = this.viewStates[newSelectedFilename];
        if (viewState) {
          this.instance.restoreViewState(viewState);
        }
        this.instance.focus();
      }
      if (
        this.props.width !== prevProps.width ||
        this.props.height !== prevProps.height
      ) {
        this.instance.layout();
      }
      if (this.props.raw !== prevProps.raw) {
        for (const [filename, value] of Object.entries(this.props.raw)) {
          if (value.content !== this.lastUpdates[filename]) {
            this.lastUpdates[filename] = value.content;
            this.models[filename].setValue(value.content);
          }
        }
      }
      for (const filename of Object.keys(this.props.raw)) {
        this.models[filename].updateOptions(this.props.setting);
        if (!filename.includes('node_modules')) {
          revalidateModel(this.models[filename]);
        }
      }
    }
    render() {
      return (
        <div
          style={{ width: this.props.width, height: this.props.height }}
          ref={(newRef: HTMLElement | null) => (this.instanceDiv = newRef)}
        />
      );
    }
  },
);

export default MonacoEditor;
