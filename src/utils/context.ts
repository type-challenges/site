import React from 'react';
import localCache from '@src/utils/local-cache';
import { getProblems, Problem } from '@src/utils/problems';
import { Setting } from '@src/utils/setting';

export type Context = {
  setting: Setting;
  problems: Problem[];
  currentProblem: Problem;
};

export type SetContext = React.Dispatch<Partial<Context>>;

export function getContext(): Context {
  const problems = getProblems();
  const { currentProblem: key = problems[0].key } =
    localCache.getProblemCacheJson();
  return {
    setting: localCache.getSettingCache(),
    problems,
    currentProblem: problems.filter(problem => problem.key === key)[0]!,
  };
}

const Context = React.createContext<[Context, SetContext]>([
  {},
  () => {},
] as unknown as [Context, SetContext]);

export default Context;
