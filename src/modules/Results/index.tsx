import { editor, Uri } from 'monaco-editor';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Input, Skeleton } from '@arco-design/web-react';
import debounce from 'lodash.debounce';
import { CustomTabs } from '@src/components/CustomTabs';
import localCache, { PROBLEM_STATUS } from '@src/utils/local-cache';
import emitter from '@src/utils/emit';
import Context from '@src/utils/context';
import { NULL_CASE, Problem } from '@src/utils/problems';
import i18nJson from '@config/i18n.json';
import styles from './index.module.less';

const enum MainTab {
  cases = 'cases',
  result = 'result',
}

const Results = function () {
  const [{ currentProblem, setting }] = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<string>(MainTab.cases);
  const [status, setStatus] = useState<string[] | 'Accept!'>([]);
  const { key, cases: originCases = [] } = currentProblem;
  const noCases = useMemo(() => originCases.length === 0, [originCases]);
  const [cases, setCases] = useState(noCases ? [NULL_CASE] : originCases);

  function onSubmit() {
    const markers = editor.getModelMarkers({});
    const errors = markers.map(function (maker) {
      return `${maker.resource.path}:${maker.startLineNumber}:${
        maker.startColumn
      }: error: ${maker.code ? `TS${maker.code}: ` : ''}${maker.message}`;
    });
    setStatus(errors.length > 0 ? errors : 'Accept!');
    const status =
      errors.length > 0 ? PROBLEM_STATUS.unAccepted : PROBLEM_STATUS.accepted;
    const code = editor.getModel(Uri.file(`${key}/template.ts`))!.getValue();
    localCache.setProblemCache(key, {
      records: [
        {
          time: dayjs().valueOf(),
          status,
          code,
        },
      ],
      status,
    });
    emitter.emit('submit-code');
    setActiveMainTab(MainTab.result);
  }

  const updateCases = useCallback(
    debounce(function (cases: Problem['cases']) {
      setCases(cases || [NULL_CASE]);
      setLoading(false);
    }, 500),
    [],
  );

  useEffect(
    function () {
      setLoading(true);
      setStatus([]);
      updateCases(currentProblem.cases);
    },
    [currentProblem],
  );

  return (
    <Skeleton
      loading={loading}
      text={{ rows: 3 }}
      animation={true}
      className={styles.skeleton}
    >
      <div className={styles.container}>
        <CustomTabs
          activeTab={activeMainTab}
          onChange={setActiveMainTab}
          className={styles['main-tabs']}
        >
          <CustomTabs.TabPane
            key={MainTab.cases}
            title={i18nJson[MainTab.cases][setting.language]}
          >
            <CustomTabs className={styles['case-tabs']}>
              {cases.map(function ({ source, target }, index) {
                return (
                  <CustomTabs.TabPane
                    key={index}
                    title={`${i18nJson['case'][setting.language]} ${index + 1}`}
                  >
                    <div className={styles['case-header']}>Source</div>
                    <Input.TextArea
                      value={source}
                      autoSize={true}
                      readOnly={noCases}
                      className={styles['case-input']}
                    />
                    <div className={styles['case-header']}>Target</div>
                    <Input.TextArea
                      value={target}
                      autoSize={true}
                      readOnly={noCases}
                      className={styles['case-input']}
                    />
                  </CustomTabs.TabPane>
                );
              })}
            </CustomTabs>
          </CustomTabs.TabPane>
          <CustomTabs.TabPane
            key={MainTab.result}
            title={i18nJson[MainTab.result][setting.language]}
          >
            {Array.isArray(status) && status.length === 0 && (
              <div className={styles['result-empty']}>
                {i18nJson['please_run_or_submit_first'][setting.language]}
              </div>
            )}
            {typeof status === 'string' && (
              <div className={styles['result-accept']}>{'Accepted!'}</div>
            )}
            {Array.isArray(status) && status.length > 0 && (
              <div className={styles['result-errors']}>
                <div className={styles['result-error-title']}>
                  Compilation Error
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
            )}
          </CustomTabs.TabPane>
        </CustomTabs>
        <div className={styles.footer}>
          <Button type={'primary'} className={styles.btn}>
            {i18nJson['run_code'][setting.language]}
          </Button>
          <Button
            type={'primary'}
            status={'success'}
            onClick={onSubmit}
            className={styles.btn}
          >
            {i18nJson['submit_code'][setting.language]}
          </Button>
        </div>
      </div>
    </Skeleton>
  );
};

export default Results;
