import type { editor } from 'monaco-editor';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Input, Skeleton } from '@arco-design/web-react';
import debounce from 'lodash.debounce';
import { CustomTabs } from '@src/components/CustomTabs';
import localCache, { PROBLEM_STATUS } from '@src/utils/local-cache';
import emitter from '@src/utils/emit';
import Context from '@src/utils/context';
import {
  getProblemTestRaw,
  NULL_CASE,
  Problem,
  ProblemFiles,
  ProblemTestReplaceVal,
} from '@src/utils/problems';
import i18nJson from '@config/i18n.json';
import {
  monacoEditorLoaded,
  monacoInstance,
  validateMonacoModel,
} from '@src/utils/monaco';
import { Setting } from '@src/utils/setting';
import styles from './index.module.less';

const enum MainTab {
  cases = 'cases',
  result = 'result',
}

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
      <div className={styles['result-error-title']}>Compilation Error</div>
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

function createCasesError(
  cases: NonNullable<Problem['cases']>,
  casesErrors: string[][],
  language: Setting['language'],
) {
  return (
    <CustomTabs className={styles['case-tabs']}>
      {cases.map(function (_, index) {
        const result = casesErrors[index];
        return (
          <CustomTabs.TabPane
            key={index}
            title={`${i18nJson['case'][language]} ${index + 1}`}
          >
            {result.length > 0 && (
              <div className={styles['result-error-info']}>
                {result.map(function (error) {
                  return (
                    <div key={error} className={styles['result-error-item']}>
                      {error}
                    </div>
                  );
                })}
              </div>
            )}
            {result.length === 0 && (
              <div className={styles['result-pass']}>Pass!</div>
            )}
          </CustomTabs.TabPane>
        );
      })}
    </CustomTabs>
  );
}

const Results = function () {
  const [{ currentProblem, setting }] = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<string>(MainTab.cases);
  const [status, setStatus] = useState<string[] | 'Accept!'>([]);
  const { key, cases: originCases = [] } = currentProblem;
  const noCases = useMemo(() => originCases.length === 0, [originCases]);
  const [cases, setCases] = useState(noCases ? [NULL_CASE] : originCases);
  const [testRaw, setTestRaw] = useState<string | undefined>(undefined);
  const [casesErrors, setCasesErrors] = useState<string[][]>([]);
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [activeCase, setActiveCase] = useState<string>('0');

  const monacoEditorStatusListener = useCallback(
    () => setBtnDisabled(false),
    [setBtnDisabled],
  );

  const updateData = useCallback(
    debounce(async function (problem: Problem) {
      const raw = await getProblemTestRaw(problem);
      setTestRaw(raw);
      setStatus([]);
      setCasesErrors([]);
      setActiveCase('0');
      setCases(problem.cases || [NULL_CASE]);
      setActiveMainTab(MainTab.cases);
      setLoading(false);
    }, 500),
    [],
  );

  useEffect(
    function () {
      setLoading(true);
      updateData(currentProblem);
    },
    [currentProblem],
  );

  useEffect(function () {
    if (!monacoEditorLoaded) {
      emitter.on('monacoEditorLoaded', monacoEditorStatusListener);
    } else {
      setBtnDisabled(false);
    }
    return function () {
      emitter.off('monacoEditorLoaded', monacoEditorStatusListener);
    };
  }, []);

  async function run() {
    if (!monacoInstance || !testRaw) return;
    setLoading(true);
    setActiveMainTab(MainTab.result);
    setStatus([]);
    await new Promise(resolve => setTimeout(resolve, 500));
    const templateUri = monacoInstance.Uri.file(
      `${currentProblem.key}/${ProblemFiles.template}`,
    );
    const markers = monacoInstance.editor.getModelMarkers({
      resource: templateUri,
    });
    const errors = formatErrorFromMarkers(markers);
    if (errors.length > 0) {
      setStatus(errors);
    } else if (testRaw) {
      const e = [];
      const uri = monacoInstance.Uri.file(
        `${currentProblem.key}/${ProblemFiles.test}`,
      );
      const model =
        monacoInstance.editor.getModel(uri) ||
        monacoInstance.editor.createModel(testRaw, undefined, uri);
      for (const { source, target } of cases) {
        const content = testRaw
          .replace(ProblemTestReplaceVal.source, source)
          .replace(ProblemTestReplaceVal.target, target);
        model.setValue(content);
        await validateMonacoModel(model);
        const markers = monacoInstance.editor.getModelMarkers({
          resource: monacoInstance.Uri.file(
            `${currentProblem.key}/${ProblemFiles.test}`,
          ),
        });
        const errors = formatErrorFromMarkers(markers);
        e.push(errors);
      }
      model.dispose();
      setCasesErrors(e);
    }
    setLoading(false);
  }

  async function onSubmit() {
    if (!monacoInstance) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const markers = [
      ...monacoInstance.editor.getModelMarkers({
        resource: monacoInstance.Uri.file(
          `${currentProblem.key}/${ProblemFiles.template}`,
        ),
      }),
      ...monacoInstance.editor.getModelMarkers({
        resource: monacoInstance.Uri.file(
          `${currentProblem.key}/${ProblemFiles.check}`,
        ),
      }),
    ];
    const errors = formatErrorFromMarkers(markers);
    setStatus(errors.length > 0 ? errors : 'Accept!');
    const status =
      errors.length > 0 ? PROBLEM_STATUS.unAccepted : PROBLEM_STATUS.accepted;
    const code = monacoInstance.editor
      .getModel(monacoInstance.Uri.file(`${key}/template.ts`))!
      .getValue();
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
    emitter.emit('submitCode');
    setActiveMainTab(MainTab.result);
    setLoading(false);
  }

  const resultContent = useMemo(
    function () {
      if (typeof status === 'string') {
        return <div className={styles['result-accept']}>Accepted!</div>;
      } else if (Array.isArray(status) && status.length > 0) {
        return createResultError(status);
      } else if (casesErrors.length > 0) {
        return createCasesError(cases, casesErrors, setting.language);
      } else {
        return (
          <div className={styles['result-empty']}>
            {i18nJson['please_run_or_submit_first'][setting.language]}
          </div>
        );
      }
    },
    [cases, casesErrors, status],
  );

  function onAddCase() {
    if (cases.length >= 5) return;
    setActiveCase(String(cases.length));
    setCases([...cases, NULL_CASE]);
  }

  function onDeleteCase(key: string) {
    if (cases.length <= 1) return;
    if (String(cases.length - 1) === activeCase) {
      setActiveCase(String(cases.length - 2));
    }
    setCases(cases.filter((_, index) => String(index) !== key));
  }

  function onChangeCase(
    key: number,
    newCase: Partial<NonNullable<Problem['cases']>[number]>,
  ) {
    setCases(
      cases.map(function (originCase, index) {
        if (key === index) {
          return {
            ...originCase,
            ...newCase,
          };
        }
        return originCase;
      }),
    );
  }

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
            <CustomTabs
              editable={!noCases}
              onAddTab={onAddCase}
              onDeleteTab={onDeleteCase}
              activeTab={activeCase}
              onChange={setActiveCase}
              className={styles['case-tabs']}
            >
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
                      onChange={newSource =>
                        onChangeCase(index, { source: newSource })
                      }
                    />
                    <div className={styles['case-header']}>Target</div>
                    <Input.TextArea
                      value={target}
                      autoSize={true}
                      readOnly={noCases}
                      className={styles['case-input']}
                      onChange={newTarget =>
                        onChangeCase(index, { target: newTarget })
                      }
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
            {resultContent}
          </CustomTabs.TabPane>
        </CustomTabs>
        <div className={styles.footer}>
          <Button
            type={'primary'}
            onClick={run}
            disabled={btnDisabled}
            className={styles.btn}
          >
            {i18nJson['run_code'][setting.language]}
          </Button>
          <Button
            type={'primary'}
            status={'success'}
            onClick={onSubmit}
            disabled={btnDisabled}
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
