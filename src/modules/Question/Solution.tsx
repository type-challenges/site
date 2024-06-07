import { useContext, useEffect, useState } from 'react';
import { Skeleton } from '@arco-design/web-react';
import Context from '@src/utils/context';
import createOrGetTypeChallenges from '@src/utils/type-challenges';
import Markdown from '@src/components/Markdown';
import styles from './index.module.less';

const Solution = function () {
  const [
    {
      currentQuestion,
      setting: { theme },
    },
  ] = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState('');

  useEffect(
    function () {
      setLoading(true);
      createOrGetTypeChallenges(currentQuestion)
        .getSolution()
        .then(setSolution)
        .then(() => setLoading(false));
    },
    [currentQuestion],
  );

  return (
    <div className={styles['solution-container']}>
      <Skeleton loading={loading} style={{ marginTop: 20 }} animation={true}>
        <Markdown content={solution} theme={theme} />
      </Skeleton>
    </div>
  );
};

export default Solution;
