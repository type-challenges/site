import { Drawer, Input, Menu } from '@arco-design/web-react';
import { IconMenuUnfold } from '@arco-design/web-react/icon';
import { useContext, useEffect, useMemo, useState } from 'react';
import Context from '@src/utils/context';
import localCache from '@src/utils/local-cache';
import emitter from '@src/utils/emit';
import SubmitStatus from '@src/components/SubmitStatus';
import i18nJson from '@config/i18n.json';
import styles from './index.module.less';

const QuestionList = function () {
  const [state, setState] = useState(false);
  const [visible, setVisible] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [{ setting, questions, currentQuestion }, setContext] =
    useContext(Context);

  const questionsTree = useMemo(
    function () {
      const subjects: Record<string, string[] | undefined> = {};
      for (const question of questions) {
        if (!question.includes(searchKey.toLowerCase())) {
          continue;
        }
        const _subject =
          question.match(/(?<=-)[a-zA-Z0-9]*(?=-)/)?.[0] || 'extreme';
        const subject =
          _subject[0].toUpperCase() + _subject.substring(1, _subject.length);
        subjects[subject]?.push(question);
        subjects[subject] ||= [question];
      }
      return subjects;
    },
    [questions, searchKey],
  );

  const cacheJson = useMemo(localCache.getQuestionCacheJson, [state]);

  function createMenuItem(question: string) {
    const status = cacheJson[question]?.status;
    return (
      <Menu.Item
        key={question}
        title={question}
        onClick={() => setContext({ currentQuestion: question })}
      >
        <div className={styles['drawer-problem-title']}>
          <span>{question}</span>
          <SubmitStatus status={status} />
        </div>
      </Menu.Item>
    );
  }

  function createSubMenu(subject: string) {
    const problems = questionsTree[subject];
    return (
      <Menu.SubMenu key={subject} title={subject}>
        {problems?.map(createMenuItem)}
      </Menu.SubMenu>
    );
  }

  useEffect(function () {
    emitter.on('submitCode', () => setState(prev => !prev));
  }, []);

  return (
    <>
      <div className={styles.icon} onClick={() => setVisible(true)}>
        <IconMenuUnfold />
      </div>
      <Drawer
        width={450}
        footer={null}
        visible={visible}
        placement={'left'}
        title={
          <div className={styles['drawer-header']}>
            <div className={styles['drawer-header-text']}>
              {i18nJson['question_list'][setting.language]}
            </div>
            <Input.Search
              className={styles['drawer-header-search']}
              value={searchKey}
              placeholder={i18nJson['type_to_search'][setting.language]}
              onChange={key => setSearchKey(key.toLowerCase())}
            />
          </div>
        }
        onCancel={() => setVisible(false)}
      >
        <Menu selectedKeys={[currentQuestion]} autoOpen={true}>
          {Object.keys(questionsTree).map(createSubMenu)}
        </Menu>
      </Drawer>
    </>
  );
};

export default QuestionList;
