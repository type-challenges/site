import yaml from 'js-yaml';
import { merge as deepmerge } from 'ts-deepmerge';
import { Setting } from '@src/utils/setting';
import localCache from '@src/utils/local-cache';
import typeChallengesRaw from '../../node_modules/@type-challenges/utils/index.d.ts?raw';

export type QuestionInfo = Partial<{
  title: string;
  author: Partial<{
    name: string;
    email: string;
    github: string;
  }>;
  difficulty: string;
}>;

export enum QuestionFiles {
  check = 'test-cases.ts',
  template = 'template.ts',
}

export type QuestionRaw = Record<
  QuestionFiles | `node_modules/@type-challenges/utils/index.${'d.ts' | 'js'}`,
  {
    content: string;
    readOnly?: boolean;
  }
>;

export const DEFAULT_RAW: QuestionRaw = {
  [QuestionFiles.check]: {
    content: '',
    readOnly: true,
  },
  [QuestionFiles.template]: {
    content: '',
  },
  'node_modules/@type-challenges/utils/index.d.ts': {
    content: typeChallengesRaw,
    readOnly: true,
  },
  'node_modules/@type-challenges/utils/index.js': {
    content: 'export {}',
    readOnly: true,
  },
};

class TypeChallenges {
  private static readonly FETCH_PREFIX =
    'https://cdn.jsdelivr.net/gh/type-challenges/type-challenges/questions';
  readonly id: string;
  private readme: Record<Setting['language'], string | undefined> = {} as any;
  private template?: string;
  private testCases?: string;
  private solution?: string;
  private info?: QuestionInfo;
  constructor(id: string) {
    this.id = id;
  }
  private async getFile(fileName: string) {
    return await fetch(
      `${TypeChallenges.FETCH_PREFIX}/${this.id}/${fileName}`,
    ).then(res => res.text());
  }
  async getReadme(options: { language?: 'zh-CN' | 'en' } = {}): Promise<string> {
    const { language = 'en' } = options;
    if (this.readme[language]) {
      return this.readme[language]!;
    }
    const fileName = `README${language === 'en' ? '' : `.${language}`}.md`;
    const readmeSource = await this.getFile(fileName);
    if (language !== 'en' && readmeSource.includes('Couldn\'t find the requested file')) {
      return await this.getReadme();
    }
    let readme = readmeSource;
    const questionLinks =
      readmeSource.match(
        new RegExp(
          `https:\\/\\/github\\.com\\/type-challenges\\/type-challenges\\/blob\\/main\\/questions\\/.*\\/${fileName}`,
        ),
      ) || [];
    for (const link of questionLinks) {
      const question = link.match(/(?<=\/)[0-9]+-([a-zA-Z0-9-])+(?=\/)/g)?.[0];
      if (!question) {
        continue;
      }
      const url = new URL(window.location.href);
      url.searchParams.set('question', question);
      readme = readme.replace(link, url.toString());
    }
    const readmeLinks = readmeSource.match(
      /(?<=<a.*)href="\.\/README\.[a-zA-Z-]+\.md"(?=(\s|>))/g,
    ) || [];
    for (const link of readmeLinks) {
      const name = link.match(/(?<=href="\.\/)README\.[a-zA-Z-]+\.md(?=")/)?.[0];
      readme = readme.replace(
        link,
        `<a href="https://github.com/type-challenges/type-challenges/tree/main/questions/${this.id}/${name}"`
      );
    }
    readme = readme.replace(
      `../../${fileName}`,
      `https://github.com/type-challenges/type-challenges/tree/main/${fileName}`
    );
    this.readme[language] = readme;
    return this.readme[language]!;
  }
  async getTemplate() {
    if (this.template) {
      return this.template;
    }
    this.template = await this.getFile(QuestionFiles.template);
    return this.template;
  }
  async getTestCases() {
    if (this.testCases) {
      return this.testCases;
    }
    this.testCases = await this.getFile(QuestionFiles.check);
    return this.testCases;
  }
  async getInfo() {
    if (this.info) {
      return this.info;
    }
    const infoYml = await this.getFile('info.yml');
    try {
      this.info = yaml.load(infoYml) as any;
    } catch (e) {
      console.error(e);
    }
    return this.info || {};
  }
  async getSolution(cnt: number = 3): Promise<string> {
    if (this.solution) {
      return this.solution;
    }
    if (cnt === 0) {
      return 'Get solution failed!';
    }
    const id = this.id;
    const index = id.match(/[0-9]+(?=-)/)?.[0];
    if (!index) {
      return 'Get solution failed!';
    }
    const controller = new AbortController();
    const res = await fetch(
      // eslint-disable-next-line max-len
      'https://api.github.com/repos/type-challenges/type-challenges/issues?&sort=reactions-+1-desc&per_page=1&labels=answer,' +
        String(Number(index)),{
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        signal: controller.signal,
      }
    );
    setTimeout(() => controller.abort(), 5000);
    try {
      const solutions = await res.json();
      const solution = solutions?.[0];
      const { body, html_url } = solution;
      this.solution = `<a href='${html_url}' target='_blank'>${html_url}</a>\n${body}`;
      return this.solution;
    } catch {
      return await this.getSolution(cnt - 1);
    }
  }
}

const CACHE = new Map<string, TypeChallenges>();

export default function createOrGetTypeChallenges(id: string) {
  const cache = CACHE.get(id);
  if (cache) {
    return cache;
  }
  const typeChallenges = new TypeChallenges(id);
  CACHE.set(id, typeChallenges);
  return typeChallenges;
}

let QuestionListCache: string[] | null;

export async function getQuestionList() {
  if (QuestionListCache) {
    return QuestionListCache;
  }
  const rootReadme = await fetch(
    'https://cdn.jsdelivr.net/gh/type-challenges/type-challenges/README.md',
  ).then(res => res.text());
  QuestionListCache = rootReadme.match(
    /(?<=<a.*href="\.\/questions\/)([0-9A-Za-z-]+)/g,
  );
  return Array.from(new Set(QuestionListCache)) || [];
}

export async function getQuestionRaw(question: string): Promise<QuestionRaw> {
  const tc = createOrGetTypeChallenges(question);
  const template = await tc.getTemplate();
  const testCases = await tc.getTestCases();
  const cache = localCache.getQuestionCacheJson();
  const { lastUpdated } = cache[question] || {};
  return deepmerge(DEFAULT_RAW, {
    [QuestionFiles.check]: { content: testCases },
    [QuestionFiles.template]: { content: lastUpdated ?? template },
  });
}
