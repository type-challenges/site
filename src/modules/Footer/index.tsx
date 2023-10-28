import linkJson from '@config/links.json';
import styles from './index.module.less';

const Footer = function () {
  return (
    <div className={styles.container}>
      <a href={linkJson.github} target={'_blank'} rel="noreferrer">
        copyright © 2023-Present ZLY201
      </a>
    </div>
  );
};

export default Footer;
