import dayjs from 'dayjs';
import linkJson from '@config/links.json';
import styles from './index.module.less';

const Footer = function () {
  return (
    <div className={styles.container}>
      <a href={linkJson['github-repo']} target={'_blank'} rel="noreferrer">
        copyright © 2023-{dayjs().year()} Type Challenges
      </a>
    </div>
  );
};

export default Footer;
