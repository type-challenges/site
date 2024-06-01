import debounce from 'lodash.debounce';
import { Setting } from '@src/utils/setting';

export const enum QUESTION_STATUS {
  unAccepted,
  accepted,
}

export type QuestionsCache = {
  status?: QUESTION_STATUS;
  lastUpdated?: string | null;
};

export type QuestionsCacheJson = {
  [key: string]: QuestionsCache | undefined;
} & {
  currentQuestion?: string;
};

export const DEFAULT_SETTING: Setting = {
  theme: 'light',
  fontSize: 14,
  tabSize: 2,
  language: 'en',
};

const localCache = {
  __QUESTION_CACHE_KEY__: '__question_cache__',
  __SETTING_CACHE_KEY__: '__setting_cache__',
  getQuestionCacheJson(): Partial<QuestionsCacheJson> {
    let json: QuestionsCacheJson = {};
    if (WEBPACK_IS_SSR) return json;
    const cache = localStorage.getItem(localCache.__QUESTION_CACHE_KEY__);
    if (!cache) return json;
    try {
      json = JSON.parse(cache);
    } catch {
      localStorage.removeItem(localCache.__QUESTION_CACHE_KEY__);
    }
    return json;
  },
  setQuestionCache<T extends keyof QuestionsCacheJson>(
    key: T,
    cache: T extends 'currentQuestion' ? string : QuestionsCache,
  ) {
    const cacheJson = localCache.getQuestionCacheJson();
    let newCache;
    if (key === 'currentQuestion') {
      newCache = cache;
    } else {
      const { status, lastUpdated } = cache;
      const { status: oldStatus, lastUpdated: oldLastUpdated } = cacheJson[
        key
      ] || { lastUpdated: undefined };
      let newStatus: QUESTION_STATUS | undefined = oldStatus;
      if (oldStatus === undefined) {
        newStatus = status;
      } else if (oldStatus === QUESTION_STATUS.accepted) {
        newStatus = oldStatus;
      } else if (status === QUESTION_STATUS.accepted) {
        newStatus = status;
      }
      const newLastUpdated =
        lastUpdated === null ? undefined : lastUpdated ?? oldLastUpdated ?? '';
      newCache = {
        status: newStatus,
        lastUpdated: newLastUpdated,
      };
    }
    localStorage.setItem(
      localCache.__QUESTION_CACHE_KEY__,
      JSON.stringify({
        ...cacheJson,
        [key]: newCache,
      }),
    );
  },
  getSettingCache(): Setting {
    let json: Setting = {
      ...DEFAULT_SETTING,
    };
    if (WEBPACK_IS_SSR) return json;
    const cache = localStorage.getItem(localCache.__SETTING_CACHE_KEY__);
    if (!cache) {
      return json;
    }
    try {
      json = JSON.parse(cache);
    } catch {
      localStorage.removeItem(localCache.__SETTING_CACHE_KEY__);
    }
    return { ...DEFAULT_SETTING, ...json };
  },
  setSettingCache: debounce(function (setting: Setting) {
    localStorage.setItem(
      localCache.__SETTING_CACHE_KEY__,
      JSON.stringify(setting),
    );
  }),
} as const;

export default localCache;
