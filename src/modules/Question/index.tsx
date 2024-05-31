import { useContext } from 'react';
import { CustomTabs } from '@src/components/CustomTabs';
import Description from '@src/modules/Question/Description';
import Solution from '@src/modules/Question/Solution';
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
          key={'solution'}
          title={i18nJson['solution'][language]}
        >
          <Solution />
        </CustomTabs.TabPane>
      </CustomTabs>
    </div>
  );
};

export default Question;
