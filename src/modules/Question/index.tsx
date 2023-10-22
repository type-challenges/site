import { useContext } from 'react';
import { CustomTabs } from '@src/components/CustomTabs';
import Description from '@src/modules/Question/Description';
import Tutorial from '@src/modules/Question/Tutorial';
import Records from '@src/modules/Question/Records';
import i18nJson from '@config/i18n.json';
import Context from '@src/utils/context';
import styles from './index.module.less';

const Question = function () {
  const [
    {
      setting: { language },
    },
  ] = useContext(Context);

  return (
    <div className={styles.container}>
      <CustomTabs type={'card'}>
        <CustomTabs.TabPane
          key={'description'}
          title={i18nJson['description'][language]}
        >
          <Description />
        </CustomTabs.TabPane>
        <CustomTabs.TabPane
          key={'records'}
          title={i18nJson['records'][language]}
        >
          <Records />
        </CustomTabs.TabPane>
        <CustomTabs.TabPane
          key={'tutorial'}
          title={i18nJson['tutorial'][language]}
        >
          <Tutorial />
        </CustomTabs.TabPane>
      </CustomTabs>
    </div>
  );
};

export default Question;
