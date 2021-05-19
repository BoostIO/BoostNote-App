export function highlightComment(id: string) {
  return () =>
    document
      .querySelectorAll(`[data-inline-comment="${id}"]`)
      .forEach((element) => element.classList.add('active'))
}

export function unhighlightComment(id: string) {
  return () =>
    document
      .querySelectorAll(`[data-inline-comment="${id}"]`)
      .forEach((element) => element.classList.remove('active'))
}
