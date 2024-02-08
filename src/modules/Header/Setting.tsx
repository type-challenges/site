import { Modal, Select } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import { useContext, useState } from 'react';
import Context from '@src/utils/context';
import localCache from '@src/utils/local-cache';
import settingList, { Setting } from '@src/utils/setting';
import i18nJson from '@config/i18n.json';
import styles from './index.module.less';

const SettingComponent = function () {
  const [visible, setVisible] = useState(false);
  const [{ setting: settingCache }, setContext] = useContext(Context);

  function createSelectItem(setting: keyof Setting) {
    const defaultValue = settingCache[setting];
    const { languageKey, options, onChange } = settingList[setting];
    function onSettingChange(value: Setting[keyof Setting]) {
      // TODO: Type Error
      onChange?.(
        value as unknown as never,
        // @ts-ignore
        settingCache[setting],
      );
      const newSetting = {
        ...settingCache,
        [setting]: value,
      };
      setContext({
        setting: newSetting,
      });
      localCache.setSettingCache(newSetting);
    }
    return (
      <div key={setting} className={styles['modal-setting-item']}>
        <div className={styles['modal-setting-item-text']}>
          {i18nJson[languageKey][settingCache.language]}
        </div>
        <div className={styles['modal-setting-item-option']}>
          <Select
            className={styles['modal-setting-item-select']}
            defaultValue={defaultValue}
            onChange={onSettingChange}
          >
            {options.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.text}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.icon} onClick={() => setVisible(true)}>
        <IconSettings />
      </div>
      <Modal
        simple={true}
        title={
          <div className={styles['modal-header']}>
            <IconSettings />
            <div>{i18nJson['setting'][settingCache.language]}</div>
          </div>
        }
        footer={null}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <div className={styles['modal-content']}>
          {Object.keys(settingList).map(createSelectItem)}
        </div>
      </Modal>
    </>
  );
};

export default SettingComponent;
