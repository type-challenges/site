const enum URL_SEARCH_PARAMS_KEY {
  problem = 'problem',
}

export function getCurrentProblemFromUrl() {
  if (WEBPACK_IS_SSR) return undefined;
  const url = new URL(window.location.href);
  return url.searchParams.get(URL_SEARCH_PARAMS_KEY.problem);
}

export function setCurrentProblemForUrl(key: string) {
  if (WEBPACK_IS_SSR) return;
  const url = new URL(window.location.href);
  url.searchParams.set(URL_SEARCH_PARAMS_KEY.problem, key);
  window.history.pushState({}, '', url);
}
