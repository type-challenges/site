import emitter from '@src/utils/emit';

export type Setting = {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: 2 | 4;
  language: 'en' | 'zh-CN';
};

const settingList: {
  [setting in keyof Setting]: {
    languageKey: 'theme' | 'font_size' | 'tab_size' | 'language';
    options: {
      text: string;
      value: Setting[setting];
    }[];
    onChange?: (next: Setting[setting], prev?: Setting[setting]) => void;
  };
} = {
  theme: {
    languageKey: 'theme',
    options: [
      {
        text: 'Light',
        value: 'light',
      },
      {
        text: 'Dark',
        value: 'dark',
      },
    ],
    onChange(value) {
      if (value === 'dark') {
        document.body.setAttribute('arco-theme', 'dark');
      } else if (value === 'light') {
        document.body.removeAttribute('arco-theme');
      }
    },
  },
  fontSize: {
    languageKey: 'font_size',
    options: new Array(7).fill(0).map(function (_, index) {
      const size = index + 12;
      return {
        text: `${size}px`,
        value: size,
      };
    }),
  },
  tabSize: {
    languageKey: 'tab_size',
    options: [
      {
        text: '2',
        value: 2,
      },
      {
        text: '4',
        value: 4,
      },
    ],
    onChange(next, prev) {
      // TODO: Required
      emitter.emit('tabSizeChange', prev!, next);
    },
  },
  language: {
    languageKey: 'language',
    options: [
      {
        text: 'English',
        value: 'en',
      },
      {
        text: '简体中文',
        value: 'zh-CN',
      },
    ],
    onChange(lang) {
      let langTag: string = lang;
      if (lang === 'zh-CN') {
        langTag = 'zh-cmn-Hans';
      }
      document.documentElement.setAttribute('lang', langTag);
    },
  },
};

export default settingList;
