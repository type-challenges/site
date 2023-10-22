import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@arco-design/web-react';
import debounce from 'lodash.debounce';
import Markdown from '@src/components/Markdown';
import Context from '@src/utils/context';
import linkJson from '@config/links.json';
import {
  getProblemDocs,
  NULL_CASE,
  Problem,
  ProblemDocs,
} from '@src/utils/problems';
import localCache from '@src/utils/local-cache';
import SubmitStatus from '@src/components/SubmitStatus';
import emitter from '@src/utils/emit';
import i18nJson from '@config/i18n.json';
import styles from './index.module.less';

const Description = function () {
  const [
    {
      currentProblem,
      setting: { theme, language },
    },
  ] = useContext(Context);
  const {
    key,
    title,
    contributor: { name, link } = { name: 'ZLY201', link: linkJson.github },
    cases = [NULL_CASE],
  } = currentProblem;
  const [desc, setDesc] = useState('');
  const [state, setState] = useState(false);
  const [loading, setLoading] = useState(true);

  const status = useMemo(
    function () {
      const cacheJson = localCache.getProblemCacheJson();
      const cache = cacheJson[key];
      return cache?.status;
    },
    [currentProblem, state],
  );

  const updateDescription = useCallback(
    debounce(async function (problem: Problem) {
      const desc = await getProblemDocs(problem, ProblemDocs.description);
      setDesc(desc);
      setLoading(false);
    }, 500),
    [],
  );

  useEffect(
    function () {
      setLoading(true);
      updateDescription(currentProblem);
    },
    [currentProblem],
  );

  useEffect(function () {
    emitter.on('submit-code', () => setState(prev => !prev));
  }, []);

  return (
    <div className={styles['desc-container']}>
      <div className={styles['desc-container-inner']}>
        <div className={styles['desc-header']}>
          <div className={styles['desc-title']}>
            <span>{title}</span>
            <SubmitStatus status={status} />
          </div>
        </div>
        <div className={styles['desc-keywords']}></div>
        <Skeleton
          className={styles['desc-skeleton']}
          loading={loading}
          text={{ rows: 3 }}
          animation={true}
        >
          <div className={styles['desc-content']}>
            <Markdown content={desc} theme={theme} />
          </div>
          <div className={styles['desc-cases']}>
            {cases.map(function ({ source, target }, index) {
              return (
                <div key={index} className={styles['desc-case']}>
                  <div className={styles['desc-case-title']}>
                    {`${i18nJson['case'][language]} ${index + 1}:`}
                  </div>
                  <div className={styles['desc-case-content']}>
                    <div className={styles['desc-case-content-inner']}>
                      <div className={styles['desc-case-content-source']}>
                        Source: {source}
                      </div>
                      <div className={styles['desc-case-content-target']}>
                        Target: {target}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Skeleton>
      </div>
      <div className={styles['desc-footer']}>
        <a
          href={link}
          target={'_blank'}
          rel="noreferrer"
          className={styles['desc-contributor']}
        >
          Provided By @{name}
        </a>
      </div>
    </div>
  );
};

export default Description;
