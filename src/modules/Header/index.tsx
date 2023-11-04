import { IconGithub, IconLeft, IconRight } from '@arco-design/web-react/icon';
import { useContext } from 'react';
import linkJson from '@config/links.json';
import ProblemList from '@src/modules/Header/ProblemList';
import SettingComponent from '@src/modules/Header/Setting';
import Context from '@src/utils/context';
import IconRandom from '@src/static/random.svg';
import styles from './index.module.less';

const Header = function () {
  const [{ problems, currentProblem }, setContext] = useContext(Context);

  function go(step?: number) {
    step ||= Math.round(Math.random() * problems.length);
    setContext({
      currentProblem:
        problems[
          (currentProblem.index + step! + problems.length) % problems.length
        ],
    });
  }

  return (
    <div className={styles.container}>
      <ProblemList />
      <div className={styles.icon} onClick={() => go(-1)}>
        <IconLeft />
      </div>
      <div className={styles.icon} onClick={() => go(1)}>
        <IconRight />
      </div>
      <div className={styles.icon} onClick={() => go()}>
        <IconRandom />
      </div>
      <div style={{ marginLeft: 'auto' }} />
      <SettingComponent />
      <a
        style={{ color: 'inherit' }}
        className={styles.icon}
        href={linkJson['github-repo']}
        target={'_blank'}
        rel="noreferrer"
      >
        <IconGithub />
      </a>
    </div>
  );
};

export default Header;
