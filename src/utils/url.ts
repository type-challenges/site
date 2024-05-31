const enum URL_SEARCH_PARAMS_KEY {
  question = 'question',
}

export function getCurrentQuestionFromUrl() {
  if (WEBPACK_IS_SSR) return undefined;
  const url = new URL(window.location.href);
  return url.searchParams.get(URL_SEARCH_PARAMS_KEY.question);
}

export function setCurrentQuestionForUrl(question: string) {
  if (WEBPACK_IS_SSR) return;
  const urlCurrentQuestion = getCurrentQuestionFromUrl();
  if (urlCurrentQuestion === question) {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set(URL_SEARCH_PARAMS_KEY.question, question);
  window.history.pushState({}, '', url);
}
