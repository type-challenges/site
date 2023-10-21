import { CustomTabs } from '@src/components/CustomTabs';
import Description from '@src/modules/Question/Description';
import Tutorial from '@src/modules/Question/Tutorial';
import Records from '@src/modules/Question/Records';
import styles from './index.module.less';

const Question = function () {
  return (
    <div className={styles.container}>
      <CustomTabs type={'card'}>
        <CustomTabs.TabPane key={'description'} title={'Description'}>
          <Description />
        </CustomTabs.TabPane>
        <CustomTabs.TabPane key={'records'} title={'Records'}>
          <Records />
        </CustomTabs.TabPane>
        <CustomTabs.TabPane key={'tutorial'} title={'Tutorial'}>
          <Tutorial />
        </CustomTabs.TabPane>
      </CustomTabs>
    </div>
  );
};

export default Question;
