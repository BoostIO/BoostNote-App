export function highlightComment(id: string, className = 'active') {
  return () =>
    document
      .querySelectorAll(`[data-inline-comment="${id}"]`)
      .forEach((element) => element.classList.add(className))
}

export function unhighlightComment(id: string, className = 'active') {
  return () =>
    document
      .querySelectorAll(`[data-inline-comment="${id}"]`)
      .forEach((element) => element.classList.remove(className))
}
