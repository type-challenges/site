// https://github.com/typescript-exercises/typescript-exercises/blob/main/src/components/monaco-editor/index.tsx
import debounce from 'lodash.debounce';
import React from 'react';
import { Editor, Monaco, loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Skeleton } from '@arco-design/web-react';
import { Setting } from '@src/utils/setting';
import emitter from '@src/utils/emit';
import {
  assignMonacoInstance,
  setMonacoEditorStatus,
  validateMonacoModel,
} from '@src/utils/monaco';
import { QuestionFiles, QuestionRaw } from '@src/utils/type-challenges';
import { formatCodeByUpdateTabSize } from '@src/utils/utils';
import withAutoResize from './autoResize';
import styles from './index.module.less';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs',
  },
});

export interface MonacoEditorProps {
  width?: number | string;
  height?: number | string;
  namespace?: string;
  raw: QuestionRaw;
  selectedFilename: QuestionFiles;
  onChange?: (filename: QuestionFiles, content: string) => void;
  setting: Setting;
}

const MonacoEditor = withAutoResize(
  class extends React.Component<MonacoEditorProps> {
    protected instance?: editor.IStandaloneCodeEditor;
    protected models: Record<string, editor.IModel | undefined> = {};
    protected viewStates: { [filename: string]: editor.ICodeEditorViewState } =
      {};
    protected lastUpdates: { [filename: string]: string } = {};
    updateTabSize = (prev: Setting['tabSize'], next: Setting['tabSize']) => {
      const model = this.models[QuestionFiles.template];
      model?.setValue(
        formatCodeByUpdateTabSize(model?.getValue() || '', prev, next),
      );
    };
    beforeMount = (monaco: Monaco) => {
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
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2017,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        allowJs: true,
        strict: true,
        noImplicitReturns: true,
        noUnusedLocals: false,
        noUnusedParameters: true,
        esModuleInterop: true,
        skipLibCheck: true,
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
        if (filename === QuestionFiles.template) {
          model.onDidChangeContent(
            debounce(() => {
              const newValue = model.getValue();
              this.lastUpdates[filename] = newValue;
              this.props.onChange?.(filename, newValue);
            }, 200),
          );
        }
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
      this.instance = undefined;
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
          validateMonacoModel(this.models[filename]).then(() =>
            emitter.emit('validate'),
          );
        }
      }
    }
    render() {
      const { width, height, setting, namespace, selectedFilename } =
        this.props;
      return (
        <Editor
          width={width}
          height={height}
          defaultPath={`${namespace}/${selectedFilename}`}
          loading={
            <Skeleton
              className={styles.skeleton}
              text={{ rows: 3 }}
              animation={true}
            />
          }
          beforeMount={this.beforeMount}
          onMount={this.onMount}
          theme={setting.theme === 'light' ? 'vs' : 'vs-dark'}
          options={{
            ...setting,
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
