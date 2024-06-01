import { useCallback, useContext, useEffect, useState } from 'react';
import { Skeleton } from '@arco-design/web-react';
import debounce from 'lodash.debounce';
import Markdown from '@src/components/Markdown';
import Context from '@src/utils/context';
import { Setting } from '@src/utils/setting';
import createOrGetTypeChallenges, {
  QuestionInfo,
} from '@src/utils/type-challenges';
import styles from './index.module.less';

const Description = function () {
  const [
    {
      currentQuestion,
      setting: { theme, language },
    },
  ] = useContext(Context);
  const [info, setInfo] = useState<QuestionInfo>({});
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);

  const { author } = info;

  const updateData = useCallback(
    debounce(async function (question: string, language?: Setting['language']) {
      const tc = createOrGetTypeChallenges(question);
      const info = await tc.getInfo();
      const desc = await tc.getReadme({ language });
      setInfo(info);
      setDesc(desc);
      setLoading(false);
    }, 500),
    [],
  );

  useEffect(
    function () {
      setInfo({});
      setLoading(true);
      updateData(currentQuestion, language);
    },
    [currentQuestion, language],
  );

  return (
    <div className={styles['desc-container']}>
      <div className={styles['desc-container-inner']}>
        <Skeleton
          className={styles['desc-skeleton']}
          loading={loading}
          text={{ rows: 3 }}
          animation={true}
        >
          <div className={styles['desc-content']}>
            <Markdown content={desc} theme={theme} />
          </div>
        </Skeleton>
      </div>
      <div className={styles['desc-footer']}>
        <a
          href={author?.github ? `https://github.com/${author.github}` : undefined}
          target={'_blank'}
          rel="noreferrer"
          className={styles['desc-contributor']}
        >
          Provided By {author?.name || author?.github ? `@${author.name || author?.github}` : '--'}
        </a>
      </div>
    </div>
  );
};

export default Description;
