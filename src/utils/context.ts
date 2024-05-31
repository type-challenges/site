import React from 'react';
import localCache from '@src/utils/local-cache';
import { Setting } from '@src/utils/setting';
import {
  getCurrentQuestionFromUrl,
  setCurrentQuestionForUrl,
} from '@src/utils/url';

export type Context = {
  setting: Setting;
  questions: string[];
  currentQuestion: string;
};

export type SetContext = React.Dispatch<Partial<Context>>;

export function getContext(): Context {
  const urlCurrentQuestion = getCurrentQuestionFromUrl();
  const { currentQuestion: localCurrentQuestion } =
    localCache.getQuestionCacheJson();
  const currentQuestion =
    urlCurrentQuestion || localCurrentQuestion || '00013-warm-hello-world';
  setCurrentQuestionForUrl(currentQuestion);
  return {
    setting: localCache.getSettingCache(),
    questions: [],
    currentQuestion,
  };
}

const Context = React.createContext<[Context, SetContext]>([
  {},
  () => {},
] as unknown as [Context, SetContext]);

export default Context;
