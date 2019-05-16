/** IE 11 compatible matches implementation. */
export function matches(element: Element, selector: string): boolean {
  return element.matches ?
      element.matches(selector) :
      (element as any)['msMatchesSelector'](selector);
}

/** IE 11 compatible closest implementation. */
export function closest(element: EventTarget|Element|null|undefined, selector: string): Element | null {
  if (!(element instanceof Node)) { return null; }

  let curr: Node|null = element;
  while (curr != null && !(curr instanceof Element && matches(curr, selector))) {
    curr = curr.parentNode;
  }

  return (curr || null) as Element|null;
}

export function findRowRenderedIndex(el: HTMLElement): number {
  const rows = Array.from(closest(el, 'pbl-cdk-table').querySelectorAll('pbl-ngrid-row'));
  return rows.indexOf(el);
}

export function findCellRenderedIndex(el: HTMLElement): [number, number] {
  const rowEl = closest(el, 'pbl-ngrid-row') as HTMLElement;
  const cells = Array.from(rowEl.querySelectorAll('pbl-ngrid-cell'));
  return [ findRowRenderedIndex(rowEl), cells.indexOf(el) ];
}
