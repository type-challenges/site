import type { editor } from 'monaco-editor';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@arco-design/web-react';
import localCache, { QUESTION_STATUS } from '@src/utils/local-cache';
import emitter from '@src/utils/emit';
import Context from '@src/utils/context';
import { monacoEditorLoaded, monacoInstance } from '@src/utils/monaco';
import { QuestionFiles } from '@src/utils/type-challenges';
import SubmitStatus from '@src/components/SubmitStatus';
import styles from './index.module.less';

function formatErrorFromMarkers(markers: editor.IMarker[]) {
  return markers.map(function (maker) {
    return `${maker.resource.path}:${maker.startLineNumber}:${
      maker.startColumn
    }: error: ${maker.code ? `TS${maker.code}: ` : ''}${maker.message}`;
  });
}

function createResultError(status: string[]) {
  return (
    <div className={styles['result-errors']}>
      <div className={styles['result-error-title']}>
        <SubmitStatus status={QUESTION_STATUS.unAccepted} />
        <span style={{ marginLeft: 8 }}>Compilation Error</span>
      </div>
      <div className={styles['result-error-info']}>
        {status.map(function (error) {
          return (
            <div key={error} className={styles['result-error-item']}>
              {error}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Results = function () {
  const [{ currentQuestion }] = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string[]>([]);

  const resultContent = useMemo(
    function () {
      if (status.length === 0) {
        return (
          <div className={styles['result-accept']}>
            <div className={styles['result-accept-title']}>
              <SubmitStatus status={QUESTION_STATUS.accepted} />
              <span style={{ marginLeft: 8 }}>Compilation Successful</span>
            </div>
            <div className={styles['result-accept-info']}>
              🎉 Yay! You have finished this challenge.
            </div>
          </div>
        );
      } else {
        return createResultError(status);
      }
    },
    [status],
  );

  const validate = useCallback(
    function () {
      setLoading(true);
      if (!monacoInstance || !monacoEditorLoaded) {
        return;
      }
      const model = monacoInstance.editor.getModel(
        monacoInstance.Uri.file(`${currentQuestion}/${QuestionFiles.template}`),
      );
      if (!model) {
        return;
      }
      const markers = [
        ...monacoInstance.editor.getModelMarkers({
          resource: monacoInstance.Uri.file(
            `${currentQuestion}/${QuestionFiles.template}`,
          ),
        }),
        ...monacoInstance.editor.getModelMarkers({
          resource: monacoInstance.Uri.file(
            `${currentQuestion}/${QuestionFiles.check}`,
          ),
        }),
      ];
      const errors = formatErrorFromMarkers(markers);
      setStatus(errors);
      const status =
        errors.length > 0
          ? QUESTION_STATUS.unAccepted
          : QUESTION_STATUS.accepted;
      localCache.setQuestionCache(currentQuestion, {
        status,
        lastUpdated: model.getValue(),
      });
      emitter.emit('submitCode');
      setLoading(false);
    },
    [currentQuestion],
  );

  useEffect(
    function () {
      validate();
      emitter.on('validate', validate);
      return function () {
        emitter.off('validate', validate);
      };
    },
    [currentQuestion],
  );

  return (
    <Skeleton
      loading={loading}
      text={{ rows: 3 }}
      animation={true}
      className={styles.skeleton}
    >
      <div className={styles.container}>{resultContent}</div>
    </Skeleton>
  );
};

export default Results;
