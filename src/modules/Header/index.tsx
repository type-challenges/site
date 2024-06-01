import { IconGithub, IconLeft, IconRight } from '@arco-design/web-react/icon';
import { useContext } from 'react';
import linkJson from '@config/links.json';
import QuestionList from '@src/modules/Header/QuestionList';
import SettingComponent from '@src/modules/Header/Setting';
import Context from '@src/utils/context';
import styles from './index.module.less';

const Header = function () {
  const [{ questions, currentQuestion }, setContext] = useContext(Context);

  function go(step: 1 | -1) {
    const index = questions.indexOf(currentQuestion) || 0;
    setContext({
      currentQuestion:
        questions[(index + step + questions.length) % questions.length],
    });
  }

  return (
    <div className={styles.container}>
      <QuestionList />
      <div className={styles.icon} onClick={() => go(-1)}>
        <IconLeft />
      </div>
      <div className={styles.icon} onClick={() => go(1)}>
        <IconRight />
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
