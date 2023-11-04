import React from 'react';
import localCache from '@src/utils/local-cache';
import { getProblems, Problem } from '@src/utils/problems';
import { Setting } from '@src/utils/setting';
import {
  getCurrentProblemFromUrl,
  setCurrentProblemForUrl,
} from '@src/utils/url';

export type Context = {
  setting: Setting;
  problems: Problem[];
  currentProblem: Problem;
};

export type SetContext = React.Dispatch<Partial<Context>>;

export function getContext(): Context {
  const problems = getProblems();
  const { currentProblem: key } = localCache.getProblemCacheJson();
  const urlCurrentProblem = getCurrentProblemFromUrl();
  const searchKey = urlCurrentProblem || key;
  const currentProblem = problems.filter(
    problem => problem.key === searchKey,
  )[0];
  if (currentProblem === undefined) {
    setCurrentProblemForUrl(problems[0].key);
  }
  return {
    setting: localCache.getSettingCache(),
    problems,
    currentProblem: currentProblem || problems[0],
  };
}

const Context = React.createContext<[Context, SetContext]>([
  {},
  () => {},
] as unknown as [Context, SetContext]);

export default Context;
