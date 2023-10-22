import axios from 'axios';
import problemsJson from '@config/problems.json';
import * as problemsUrl from '@src/problems';
import localCache from '@src/utils/local-cache';
import { Setting } from '@src/utils/setting';
import typeAssertions from '../../node_modules/type-assertions/lib/index.d.ts?raw';

export type Problem = {
  key: string;
  subject: string;
  subjectKey: string;
  title: string;
  contributor?: {
    name: string;
    link: string;
  };
  keywords?: string[];
  cases?: {
    source: string;
    target: string;
  }[];
  index: number;
};

const filePrefixes = ['check', 'template'] as const;

export enum ProblemFiles {
  check = 'check.ts',
  template = 'template.ts',
}

export enum ProblemDocs {
  description = 'description',
  tutorial = 'tutorial',
}

export type ProblemRaw = Record<
  ProblemFiles | `node_modules/type-assertions/index.${'d.ts' | 'js'}`,
  {
    content: string;
    readOnly?: boolean;
  }
>;

export const NULL_CASE: NonNullable<Problem['cases']>[number] = {
  source: 'null',
  target: 'null',
};

export function getProblems(): Problem[] {
  return problemsJson.map((problem, index) => ({
    ...problem,
    index,
  }));
}

export const DEFAULT_RAW: ProblemRaw = {
  [ProblemFiles.check]: {
    content: '',
    readOnly: true,
  },
  [ProblemFiles.template]: {
    content: '',
  },
  'node_modules/type-assertions/index.d.ts': {
    content: typeAssertions,
    readOnly: true,
  },
  'node_modules/type-assertions/index.js': {
    content: 'export function assert() { return true }',
    readOnly: true,
  },
};

export function formatCodeByUpdateTabSize(
  code: string,
  prev: Setting['tabSize'],
  next: Setting['tabSize'],
) {
  return code
    .split('\n')
    .map(function (line) {
      let index = 0;
      while (line[index] === ' ') {
        ++index;
      }
      if (index === 0) return line;
      const suffix = line.slice(index);
      index -= 1;
      if (index % 2 === 1) {
        index += 1;
      }
      const prefix = ' '.repeat((index * next) / prev);
      return `${prefix}${suffix}`;
    })
    .join('\n');
}

export async function getProblemRaw(
  problem: Problem,
  needDefault = false,
): Promise<ProblemRaw> {
  const raw: ProblemRaw = { ...DEFAULT_RAW };
  const { subjectKey, key } = problem;
  try {
    await Promise.all(
      filePrefixes.map(function (prefix) {
        if (ProblemFiles.template.includes(prefix) && !needDefault) {
          const problemsCacheJson = localCache.getProblemCacheJson();
          const cache = problemsCacheJson[problem.key];
          if (cache?.lastUpdated) {
            raw[ProblemFiles[prefix]] = {
              ...raw[ProblemFiles[prefix]],
              content: cache.lastUpdated,
            };
            return;
          }
        }
        const url = problemsUrl[subjectKey][key][prefix];
        return axios.get(url).then(function ({ data }: { data: string }) {
          if (ProblemFiles.template.includes(prefix)) {
            const { tabSize } = localCache.getSettingCache();
            if (tabSize === 4) {
              data = formatCodeByUpdateTabSize(data, 2, 4);
            }
          }
          raw[ProblemFiles[prefix]] = {
            ...raw[ProblemFiles[prefix]],
            content: data.replace(/\n\/\/ @ts-ignore/g, ''),
          };
        });
      }),
    );
  } catch {
    /* empty */
  }
  return raw;
}

export async function getProblemDocs(
  problem: Problem,
  type: ProblemDocs,
  language: Setting['language'] = 'en',
) {
  const { subjectKey, key } = problem;
  try {
    const url = problemsUrl[subjectKey][key][type][language];
    const { data } = await axios.get(url);
    return data;
  } catch {
    /* empty */
  }
  return '';
}
