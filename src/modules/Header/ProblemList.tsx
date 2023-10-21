import { Drawer, Input, Menu } from '@arco-design/web-react';
import { IconMenuUnfold } from '@arco-design/web-react/icon';
import { useContext, useEffect, useMemo, useState } from 'react';
import Context from '@src/utils/context';
import { Problem } from '@src/utils/problems';
import localCache from '@src/utils/local-cache';
import emitter from '@src/utils/emit';
import SubmitStatus from '@src/components/SubmitStatus';
import styles from './index.module.less';

const ProblemList = function () {
  const [state, setState] = useState(false);
  const [visible, setVisible] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [{ problems, currentProblem }, setContext] = useContext(Context);

  const problemsTree = useMemo(
    function () {
      const tree: Record<Problem['subject'], Problem[]> = {};
      problems.forEach(function (problem) {
        const { subject, title, keywords = [] } = problem;
        const shouldPushToTree = [title, ...keywords].some(function (str) {
          return str.toLowerCase().includes(searchKey);
        });
        if (!shouldPushToTree) {
          return;
        }
        if (!tree[subject]) {
          tree[subject] = [];
        }
        tree[subject].push(problem);
      });
      return tree;
    },
    [problems, searchKey],
  );

  const cacheJson = useMemo(localCache.getProblemCacheJson, [state]);

  function createMenuItem(problem: Problem) {
    const { key, title } = problem;
    const status = cacheJson[problem.key]?.status;
    return (
      <Menu.Item
        key={key}
        title={title}
        onClick={() => setContext({ currentProblem: problem })}
      >
        <div className={styles['drawer-problem-title']}>
          <span>{title}</span>
          <SubmitStatus status={status} />
        </div>
      </Menu.Item>
    );
  }

  function createSubMenu(subject: string) {
    const problems = problemsTree[subject];
    return (
      <Menu.SubMenu key={subject} title={subject}>
        {problems.map(createMenuItem)}
      </Menu.SubMenu>
    );
  }

  useEffect(function () {
    emitter.on('submit-code', () => setState(prev => !prev));
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
            <div className={styles['drawer-header-text']}>Problem List</div>
            <Input.Search
              className={styles['drawer-header-search']}
              value={searchKey}
              placeholder={'Type to search...'}
              onChange={key => setSearchKey(key.toLowerCase())}
            />
          </div>
        }
        onCancel={() => setVisible(false)}
      >
        <Menu selectedKeys={[currentProblem.key]} autoOpen={true}>
          {Object.keys(problemsTree).map(createSubMenu)}
        </Menu>
      </Drawer>
    </>
  );
};

export default ProblemList;
