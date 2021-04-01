export type FocusableDomElement =
  | HTMLDivElement
  | HTMLAnchorElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLInputElement
  | HTMLTextAreaElement

export type InputableDomElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement

export const isActiveElementAnInput = () => {
  const activeElement = document.activeElement
  const inputs = ['input', 'select', 'textarea']

  if (
    activeElement != null &&
    inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1
  ) {
    return true
  }

  return false
}

export const getAllFocusableChildrenOfElement = (element: Element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], area[href], input, select, textarea, button, [tabindex="0"]'
  )
  console.log(focusableElements)
  const filtered = Array.from(focusableElements).filter(
    (elem) => elem.id !== '' && elem['tabIndex'] !== -1 && !elem['disabled']
  ) as FocusableDomElement[]

  return filtered
}

export const getFirstFocusableChildOfElement = (element: Element) => {
  const focusableElements = getAllFocusableChildrenOfElement(element)
  return focusableElements.length > 0
    ? (focusableElements[0] as FocusableDomElement)
    : null
}

export const getFirstUnindexedOfElement = (element: Element) => {
  const focusableElements = getAllFocusableChildrenOfElement(element)
  return focusableElements.length > 0
    ? (focusableElements[0] as FocusableDomElement)
    : null
}

export function focusFirstChildFromElement(
  element: FocusableDomElement | null
) {
  if (element == null) {
    return
  }

  const focusableElement = getFirstFocusableChildOfElement(element)

  if (focusableElement != null) {
    focusableElement.focus()
  } else {
    element.focus()
  }
}

export function navigateToNextFocusableWithin(list: Element, loop = false) {
  const activeElement = document.activeElement
  const allLinks = getAllFocusableChildrenOfElement(list)
  const currentIndex =
    activeElement != null
      ? allLinks.reduce((acc, link, index) => {
          if (link.id === activeElement.id) {
            acc = index
          }
          return acc
        }, -1)
      : -1

  if (currentIndex + 1 >= allLinks.length) {
    if (loop && allLinks[0] != null) {
      allLinks[0].focus()
    }
    return
  }
  allLinks[currentIndex + 1].focus()
}

export function navigateToPreviousFocusableWithin(list: Element, loop = false) {
  const activeElement = document.activeElement
  const allLinks = getAllFocusableChildrenOfElement(list)
  const currentIndex =
    activeElement != null
      ? allLinks.reduce((acc, link, index) => {
          if (link.id === activeElement.id) {
            acc = index
          }
          return acc
        }, -1)
      : -1

  if (currentIndex - 1 < 0) {
    if (loop && allLinks[allLinks.length - 1] != null) {
      allLinks[allLinks.length - 1].focus()
    }
    return
  }
  allLinks[currentIndex - 1].focus()
}

export function isChildNode(
  parent?: Node | null,
  child?: Node | null
): boolean {
  if (parent == null || child == null) {
    return false
  }
  let target: Node | null = child
  while (target != null) {
    target = target.parentNode
    if (parent === target) {
      return true
    }
  }
  return false
}
