import { Modal, Skeleton } from '@arco-design/web-react';
import { IconCode, IconUndo } from '@arco-design/web-react/icon';
import debounce from 'lodash.debounce';
import { useCallback, useContext, useEffect, useState } from 'react';
import Context from '@src/utils/context';
import {
  DEFAULT_RAW,
  getProblemRaw,
  Problem,
  ProblemFiles,
} from '@src/utils/problems';
import localCache from '@src/utils/local-cache';
import i18nJson from '@config/i18n.json';
import MonacoEditor from './monaco-editor';
import styles from './index.module.less';

function Editor() {
  const [raw, setRaw] = useState(DEFAULT_RAW);
  const [loading, setLoading] = useState(true);
  const [{ setting, currentProblem }] = useContext(Context);

  function onChange(filename: ProblemFiles, content: string) {
    if (!raw || filename !== ProblemFiles.template) return;
    localCache.setProblemCache(currentProblem.key, {
      lastUpdated: content,
    });
    setRaw({
      ...raw,
      [filename]: {
        content,
        readOnly: raw[filename].readOnly,
      },
    });
  }

  const updateRaw = useCallback(
    debounce(async function (problem: Problem) {
      const raw = await getProblemRaw(problem);
      setRaw(raw);
      setLoading(false);
    }, 500),
    [],
  );

  function resetCode() {
    const modal = Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure to reset code?',
      okText: 'confirm',
      cancelText: 'cancel',
      onOk: async function () {
        setLoading(true);
        localCache.setProblemCache(currentProblem.key, {
          lastUpdated: null,
        });
        await updateRaw(currentProblem);
        modal.close();
      },
    });
  }

  useEffect(
    function () {
      setLoading(true);
      updateRaw(currentProblem);
    },
    [currentProblem],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconCode />
        <span style={{ marginLeft: 5 }}>
          {i18nJson['code'][setting.language]}
        </span>
        <a onClick={resetCode} className={styles.reset}>
          <IconUndo />
        </a>
      </div>
      {loading && (
        <Skeleton
          className={styles.skeleton}
          text={{ rows: 3 }}
          animation={true}
        />
      )}
      {!loading && (
        <div className={styles['monaco-wrapper']}>
          <MonacoEditor
            namespace={currentProblem.key}
            selectedFilename={ProblemFiles.template}
            raw={raw}
            onChange={onChange}
            setting={setting}
          />
        </div>
      )}
    </div>
  );
}

export default Editor;
