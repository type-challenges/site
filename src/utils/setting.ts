import emitter from '@src/utils/emit';

export type Setting = {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: 2 | 4;
};

const settingList: {
  [setting in keyof Setting]: {
    name: string;
    options: {
      text: string;
      value: Setting[setting];
    }[];
    onChange?: (next: Setting[setting], prev?: Setting[setting]) => void;
  };
} = {
  theme: {
    name: 'theme',
    options: [
      {
        text: 'light',
        value: 'light',
      },
      {
        text: 'dark',
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
    name: 'font size',
    options: new Array(7).fill(0).map(function (_, index) {
      const size = index + 12;
      return {
        text: `${size}px`,
        value: size,
      };
    }),
  },
  tabSize: {
    name: 'tab size',
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
      emitter.emit('tabSizeChange', prev, next);
    },
  },
};

export default settingList;
