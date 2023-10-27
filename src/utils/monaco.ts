// https://github.com/typescript-exercises/typescript-exercises/blob/main/src/components/monaco-editor/revalidate-model.ts
import type { editor } from 'monaco-editor';
import { DiagnosticMessageChain } from 'typescript';
import { Monaco } from '@monaco-editor/react';

export let monacoInstance: Monaco | undefined;
export let monacoEditorLoaded = false;

export function assignMonacoInstance(monaco: Monaco) {
  monacoInstance = monaco;
}

export function setMonacoEditorStatus(status: boolean) {
  monacoEditorLoaded = status;
}

export function flattenDiagnosticMessageText(
  diag: string | DiagnosticMessageChain | undefined,
  newLine: string,
  indent = 0,
): string {
  if (typeof diag === 'string') {
    return diag;
  } else if (diag === undefined) {
    return '';
  }
  let result = '';
  if (indent) {
    result += newLine;

    for (let i = 0; i < indent; i++) {
      result += '  ';
    }
  }
  result += diag.messageText;
  indent++;
  if (diag.next) {
    for (const kid of diag.next) {
      result += flattenDiagnosticMessageText(kid, newLine, indent);
    }
  }
  return result;
}

export async function validateMonacoModel(model?: editor.IModel) {
  if (!monacoInstance || !model || model.isDisposed()) return;
  const getWorker =
    await monacoInstance.languages.typescript.getTypeScriptWorker();
  const worker = await getWorker(model.uri);
  if (model.isDisposed()) return;
  const diagnostics = (
    await Promise.all([
      worker.getSyntacticDiagnostics(model.uri.toString()),
      worker.getSemanticDiagnostics(model.uri.toString()),
    ])
  ).reduce((a, it) => a.concat(it));
  if (model.isDisposed()) return;
  const markers = diagnostics.map(d => {
    const start = model.getPositionAt(d.start!);
    const end = model.getPositionAt(d.start! + d.length!);
    return {
      severity: monacoInstance!.MarkerSeverity.Error,
      startLineNumber: start.lineNumber,
      startColumn: start.column,
      endLineNumber: end.lineNumber,
      endColumn: end.column,
      message: flattenDiagnosticMessageText(d.messageText, '\n'),
    };
  });
  monacoInstance.editor.setModelMarkers(model, 'typescript', markers);
}
