import { Modal, Skeleton, Tooltip } from '@arco-design/web-react';
import { IconCode, IconUndo } from '@arco-design/web-react/icon';
import debounce from 'lodash.debounce';
import { useCallback, useContext, useEffect, useState } from 'react';
import Context from '@src/utils/context';
import localCache from '@src/utils/local-cache';
import i18nJson from '@config/i18n.json';
import {
  DEFAULT_RAW,
  getQuestionRaw,
  QuestionFiles,
} from '@src/utils/type-challenges';
import MonacoEditor from './MonacoEditor';
import styles from './index.module.less';

function Editor() {
  const [raw, setRaw] = useState(DEFAULT_RAW);
  const [loading, setLoading] = useState(true);
  const [{ setting, currentQuestion }] = useContext(Context);
  const { language } = setting;

  function onChange(filename: QuestionFiles, content: string) {
    if (!raw || filename !== QuestionFiles.template) return;
    localCache.setQuestionCache(currentQuestion, {
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
    debounce(async function (question: string) {
      const raw = await getQuestionRaw(question);
      setRaw(raw);
      setLoading(false);
    }, 500),
    [],
  );

  function resetCode() {
    const modal = Modal.confirm({
      title: i18nJson['confirm_title'][language],
      content: i18nJson['confirm_reset_code'][language],
      okText: i18nJson['confirm_btn'][language],
      cancelText: i18nJson['cancel_btn'][language],
      onOk: async function () {
        setLoading(true);
        localCache.setQuestionCache(currentQuestion, {
          lastUpdated: null,
        });
        await updateRaw(currentQuestion);
        modal.close();
      },
    });
  }

  useEffect(
    function () {
      setLoading(true);
      updateRaw(currentQuestion);
    },
    [currentQuestion],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconCode />
        <span style={{ marginLeft: 5 }}>{i18nJson['code'][language]}</span>
        <a onClick={resetCode} className={styles.reset}>
          <Tooltip mini={true} content={'reset'}>
            <IconUndo />
          </Tooltip>
        </a>
      </div>
      <Skeleton
        className={styles.skeleton}
        text={{ rows: 3 }}
        animation={true}
        loading={loading}
      >
        <div className={styles['monaco-wrapper']}>
          <MonacoEditor
            namespace={currentQuestion}
            selectedFilename={QuestionFiles.template}
            raw={raw}
            onChange={onChange}
            setting={setting}
          />
        </div>
      </Skeleton>
    </div>
  );
}

export default Editor;
