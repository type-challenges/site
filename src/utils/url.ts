const enum URL_SEARCH_PARAMS_KEY {
  problem = 'problem',
}

export function getCurrentProblemFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get(URL_SEARCH_PARAMS_KEY.problem);
}

export function setCurrentProblemForUrl(key: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(URL_SEARCH_PARAMS_KEY.problem, key);
  window.history.pushState({}, '', url);
}
