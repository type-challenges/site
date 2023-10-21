import { useCallback, useContext, useEffect, useState } from 'react';
import { Skeleton } from '@arco-design/web-react';
import debounce from 'lodash.debounce';
import Markdown from '@src/components/Markdown';
import Context from '@src/utils/context';
import { getProblemDocs, Problem, ProblemDocs } from '@src/utils/problems';
import styles from './index.module.less';

const Tutorial = function () {
  const [
    {
      currentProblem,
      setting: { theme },
    },
  ] = useContext(Context);
  const [tutorial, setTutorial] = useState('');
  const [loading, setLoading] = useState(true);

  const updateTutorial = useCallback(
    debounce(async function (problem: Problem) {
      const tutorial = await getProblemDocs(problem, ProblemDocs.tutorial);
      setTutorial(tutorial);
      setLoading(false);
    }, 500),
    [],
  );

  useEffect(
    function () {
      setLoading(true);
      updateTutorial(currentProblem);
    },
    [currentProblem],
  );

  return (
    <div className={styles['tutorial-container']}>
      <Skeleton loading={loading} text={{ rows: 3 }} animation={true}>
        <Markdown content={tutorial} theme={theme} />
      </Skeleton>
    </div>
  );
};

export default Tutorial;
