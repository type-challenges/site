import { Tabs, TabsProps } from '@arco-design/web-react';
import styles from './index.module.less';

const CustomTabs = function (props: TabsProps) {
  const { className } = props;

  const realClassName = [styles.tabs];

  if (typeof className === 'string') {
    realClassName.push(className);
  } else if (Array.isArray(className)) {
    realClassName.push(...className);
  }

  return <Tabs {...props} type={'card'} className={realClassName} />;
};

CustomTabs.TabPane = Tabs.TabPane;

export { CustomTabs };
