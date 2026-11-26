/** True when a keyboard event comes from a place where the user is typing. */
export function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent)
