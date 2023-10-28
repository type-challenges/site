// https://github.com/typescript-exercises/typescript-exercises/blob/main/src/components/monaco-editor/index.tsx
import debounce from 'lodash.debounce';
import React from 'react';
import { Editor, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Skeleton } from '@arco-design/web-react';
import { decorateWithAutoResize } from '@src/components/AutoResizer';
import {
  formatCodeByUpdateTabSize,
  ProblemFiles,
  ProblemRaw,
} from '@src/utils/problems';
import { Setting } from '@src/utils/setting';
import emitter from '@src/utils/emit';
import {
  assignMonacoInstance,
  setMonacoEditorStatus,
  validateMonacoModel,
} from '@src/utils/monaco';
import styles from './index.module.less';

export interface MonacoEditorProps {
  width?: number | string;
  height?: number | string;
  namespace?: string;
  raw: ProblemRaw;
  selectedFilename: Exclude<ProblemFiles, ProblemFiles.test>;
  onChange?: (filename: ProblemFiles, content: string) => void;
  setting: Setting;
}

const MonacoEditor = decorateWithAutoResize(
  class extends React.Component<MonacoEditorProps> {
    protected instance: editor.IStandaloneCodeEditor | null = null;
    protected models: Record<string, editor.IModel | undefined> = {};
    protected viewStates: { [filename: string]: editor.ICodeEditorViewState } =
      {};
    protected lastUpdates: { [filename: string]: string } = {};
    updateTabSize = (prev: Setting['tabSize'], next: Setting['tabSize']) => {
      const model = this.models[ProblemFiles.template];
      model?.setValue(
        formatCodeByUpdateTabSize(model?.getValue() || '', prev, next),
      );
    };
    beforeMount = (monaco: Monaco) => {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        strict: true,
        target: monaco.languages.typescript.ScriptTarget.ES2018,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        typeRoots: ['declarations'],
      });
      monaco.editor.defineTheme('light', {
        base: 'vs',
        colors: {},
        inherit: true,
        rules: [],
      });
      monaco.editor.defineTheme('dark', {
        base: 'vs-dark',
        colors: {},
        inherit: true,
        rules: [],
      });
      monaco.editor.setTheme(this.props.setting.theme);
      assignMonacoInstance(monaco);
      for (const [filename, { content }] of Object.entries(this.props.raw)) {
        this.lastUpdates[filename] = content;
        const model = monaco.editor.createModel(
          content,
          undefined,
          monaco.Uri.file(`${this.props.namespace}/${filename}`),
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
    };
    onMount = (instance: editor.IStandaloneCodeEditor) => {
      this.instance = instance;
      this.instance.layout();
      this.instance.updateOptions(this.props.setting);
      setMonacoEditorStatus(true);
      emitter.emit('monacoEditorLoaded');
      emitter.on('tabSizeChange', this.updateTabSize);
    };
    componentWillUnmount() {
      setMonacoEditorStatus(false);
      emitter.off('tabSizeChange', this.updateTabSize);
      for (const filename of Object.keys(this.models)) {
        this.models[filename]?.dispose();
      }
      if (this.instance) {
        this.instance.dispose();
      }
      this.models = {};
      this.viewStates = {};
      this.lastUpdates = {};
      this.instance = null;
    }
    componentDidUpdate(prevProps: Readonly<MonacoEditorProps>): void {
      if (!this.instance) {
        return;
      }
      if (
        this.props.width !== prevProps.width ||
        this.props.height !== prevProps.height
      ) {
        this.instance.layout();
      }
      this.instance.updateOptions(this.props.setting);
      const newSelectedFilename = this.props.selectedFilename;
      if (newSelectedFilename !== prevProps.selectedFilename) {
        const model = this.models[newSelectedFilename];
        this.viewStates[prevProps.selectedFilename] =
          this.instance.saveViewState()!;
        model && this.instance.setModel(model);
        this.instance.updateOptions({
          readOnly: Boolean(this.props.raw[newSelectedFilename].readOnly),
        });
        const viewState = this.viewStates[newSelectedFilename];
        if (viewState) {
          this.instance.restoreViewState(viewState);
        }
        this.instance.focus();
      }
      if (this.props.raw !== prevProps.raw) {
        for (const [filename, value] of Object.entries(this.props.raw)) {
          if (value.content !== this.lastUpdates[filename]) {
            this.lastUpdates[filename] = value.content;
            this.models[filename]?.setValue(value.content);
          }
        }
      }
      for (const filename of Object.keys(this.props.raw)) {
        this.models[filename]?.updateOptions(this.props.setting);
        if (!filename.includes('node_modules')) {
          validateMonacoModel(this.models[filename]);
        }
      }
    }
    render() {
      return (
        <Editor
          width={this.props.width}
          height={this.props.height}
          defaultPath={`${this.props.namespace}/${this.props.selectedFilename}`}
          loading={
            <Skeleton
              className={styles.skeleton}
              text={{ rows: 3 }}
              animation={true}
            />
          }
          beforeMount={this.beforeMount}
          onMount={this.onMount}
          theme={this.props.setting.theme === 'light' ? 'vs' : 'vs-dark'}
          options={{
            ...this.props.setting,
            renderValidationDecorations: 'on',
            minimap: {
              enabled: false,
            },
            autoIndent: 'advanced',
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: false,
          }}
        />
      );
    }
  },
);

export default MonacoEditor;
