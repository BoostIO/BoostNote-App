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
    ((activeElement as HTMLElement).isContentEditable ||
      inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1)
  ) {
    return true
  }

  return false
}

export const getAllFocusableChildrenOfElement = (element: Element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], area[href], input, select, textarea, button, [tabindex="0"]'
  )
  return Array.from(focusableElements).filter(
    (elem) => elem.id !== '' && elem['tabIndex'] !== -1 && !elem['disabled']
  ) as FocusableDomElement[]
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

export function downloadString(
  content: string,
  fileName: string,
  type = 'text/plain'
) {
  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.href = window.URL.createObjectURL(new Blob([content], { type }))
  anchor.setAttribute('download', fileName)
  anchor.click()
  window.URL.revokeObjectURL(anchor.href)
  document.body.removeChild(anchor)
}

export function downloadBlob(blob: Blob, fileName: string) {
  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.href = window.URL.createObjectURL(blob)
  anchor.setAttribute('download', fileName)
  anchor.click()
  window.URL.revokeObjectURL(anchor.href)
  document.body.removeChild(anchor)
}

export function printIframe(content: string, fileName: string) {
  const previousFrame = document.getElementById('iframe-print')
  if (previousFrame) previousFrame.parentNode?.removeChild(previousFrame)
  const frame = document.createElement('iframe')
  frame.id = 'iframe-print'
  frame.name = 'iframe-print'
  frame.src = 'about:blank'
  frame.style.display = 'none'
  frame.title = fileName
  frame.srcdoc = content
  document.body.appendChild(frame)
  const iframe = window.frames['iframe-print']
  if (iframe == null) {
    return
  }
  iframe.focus()
  iframe.print()
}
