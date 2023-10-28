import debounce from 'lodash.debounce';
import { Setting } from '@src/utils/setting';

export const enum PROBLEM_STATUS {
  unAccepted,
  accepted,
}

export type ProblemRecord = {
  time: number;
  code: string;
  status: PROBLEM_STATUS;
};

export type ProblemCache = {
  records?: ProblemRecord[];
  status?: PROBLEM_STATUS;
  lastUpdated?: string | null;
};

export type ProblemsCacheJson = {
  [key: string]: ProblemCache | undefined;
} & {
  currentProblem?: string;
};

const RECORD_MAX_LENGTH = 8;

const DEFAULT_SETTING: Setting = {
  theme: 'light',
  fontSize: 14,
  tabSize: 2,
  language: 'en',
};

const localCache = {
  __PROBLEM_CACHE_KEY__: '__problem_cache__',
  __SETTING_CACHE_KEY__: '__setting_cache__',
  getProblemCacheJson() {
    let json = {} as ProblemsCacheJson;
    const cache = localStorage.getItem(localCache.__PROBLEM_CACHE_KEY__);
    if (!cache) return json;
    try {
      json = JSON.parse(cache) as ProblemsCacheJson;
    } catch {
      localStorage.removeItem(localCache.__PROBLEM_CACHE_KEY__);
    }
    return json;
  },
  setProblemCache<T extends keyof ProblemsCacheJson>(
    key: T,
    cache: T extends 'currentProblem' ? string : ProblemCache,
  ) {
    const cacheJson = localCache.getProblemCacheJson();
    let newCache;
    if (key === 'currentProblem') {
      newCache = cache;
    } else {
      const { records = [], status, lastUpdated } = cache;
      const {
        records: oldRecords = [],
        status: oldStatus,
        lastUpdated: oldLastUpdated,
      } = cacheJson[key] || { records: [], lastUpdated: undefined };
      const newRecords = oldRecords;
      newRecords.splice(
        0,
        records.length + oldRecords.length - RECORD_MAX_LENGTH,
      );
      newRecords.push(
        ...records.map(record => ({ ...record, code: record.code.trim() })),
      );
      let newStatus: PROBLEM_STATUS | undefined = oldStatus;
      if (oldStatus === undefined) {
        newStatus = status;
      } else if (oldStatus === PROBLEM_STATUS.accepted) {
        newStatus = oldStatus;
      } else if (status === PROBLEM_STATUS.accepted) {
        newStatus = status;
      }
      const newLastUpdated =
        lastUpdated === null ? undefined : lastUpdated ?? oldLastUpdated ?? '';
      newCache = {
        records: newRecords,
        status: newStatus,
        lastUpdated: newLastUpdated,
      };
    }
    localStorage.setItem(
      localCache.__PROBLEM_CACHE_KEY__,
      JSON.stringify({
        ...cacheJson,
        [key]: newCache,
      }),
    );
  },
  deleteProblemRecord(key: string, time: number) {
    const cacheJson = localCache.getProblemCacheJson();
    const cache = cacheJson[key];
    const records = cache?.records?.filter(record => record.time !== time);
    if (records?.length === cache?.records?.length) return false;
    localStorage.setItem(
      localCache.__PROBLEM_CACHE_KEY__,
      JSON.stringify({
        ...cacheJson,
        [key]: {
          ...cacheJson[key],
          records,
        },
      }),
    );
    return true;
  },
  getSettingCache(): Setting {
    let json: Setting = {
      ...DEFAULT_SETTING,
    };
    const cache = localStorage.getItem(localCache.__SETTING_CACHE_KEY__);
    if (!cache) {
      return json;
    }
    try {
      json = JSON.parse(cache) as Setting;
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
