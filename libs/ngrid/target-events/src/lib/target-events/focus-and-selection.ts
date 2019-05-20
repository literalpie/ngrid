import { LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW, SHIFT } from '@angular/cdk/keycodes';

import { PblNgridContextApi, GridDataPoint, PblNgridCellContext } from '@pebula/ngrid';
import { PblNgridRowEvent, PblNgridCellEvent } from './events';
import { PblNgridTargetEventsPlugin } from './target-events-plugin';
import { isCellEvent } from './utils';

export function handleFocusAndSelection(targetEvents: PblNgridTargetEventsPlugin) {
  targetEvents.keyDown.subscribe( e => handleKeyDown(targetEvents, e) );
}

function handleKeyDown(targetEvents: PblNgridTargetEventsPlugin, event: PblNgridRowEvent | PblNgridCellEvent): void {
  const source: KeyboardEvent = event.source as any;
  if (isCellEvent(event)) {
    const sourceCell = event.cellTarget;

    let coeff: 1 | -1 = 1;
    let axis: 'h' | 'v';

    switch (source.keyCode) {
      case UP_ARROW:
        coeff = -1;
      case DOWN_ARROW: // tslint:disable-line: no-switch-case-fall-through
        axis = 'v';
        break;
      case LEFT_ARROW:
        coeff = -1;
      case RIGHT_ARROW: // tslint:disable-line: no-switch-case-fall-through
        axis = 'h';
        break;
      default:
        return;
    }

    const { contextApi } = targetEvents.table;
    const cellContext = contextApi.getCell(sourceCell);
    const activeFocus = contextApi.focusedCell || {
      rowIdent: cellContext.rowContext.identity,
      colIndex: cellContext.index,
    };

    if (!!source.shiftKey) {
      handleSelectionChange1(contextApi, activeFocus, axis === 'h' ? [coeff, 0] : [0, coeff]);
      // handleSelectionChange(contextApi, cellContext, axis === 'h' ? [coeff, 0] : [0, coeff]);
    } else {
      handleSingleItemFocus(contextApi, activeFocus, axis === 'h' ? [coeff, 0] : [0, coeff])
    }
  }
}

function handleSelectionChange1(contextApi: PblNgridContextApi<any>,
                                sourceCellRef: GridDataPoint,
                                direction: [0, 1 | -1] | [1 | -1, 0]) {
  const { rowIdent, colIndex } = sourceCellRef;
  const sourceCellState = contextApi.findRowInCache(rowIdent);
  const [moveH, moveV] = direction;

  const hAdj = [ sourceCellState.cells[colIndex - 1], sourceCellState.cells[colIndex + 1] ];
  const vAdj = [ contextApi.findRowInCache(rowIdent, -1, true), contextApi.findRowInCache(rowIdent, 1, true) ];

  let h = (hAdj[0] && hAdj[0].selected ? -1 : 0) + (hAdj[1] && hAdj[1].selected ? 1 : 0);
  let v = (vAdj[0] && vAdj[0].cells[colIndex].selected ? -1 : 0) + (vAdj[1] && vAdj[1].cells[colIndex].selected ? 1 : 0);

  if (h === 0) {
    h += moveH;
  }
  if (v === 0) {
    v += moveV;
  }

  const hCells: GridDataPoint[] = [];
  if (h !== 0) {
    let hContextIndex = colIndex;
    let hContext = sourceCellState.cells[colIndex];
    while (hContext && hContext.selected) {
      hCells.push({ rowIdent, colIndex: hContextIndex });
      hContextIndex += h;
      hContext = sourceCellState.cells[hContextIndex];
    }

    if (moveH) {
      if (h === moveH) {
        if (hContext) {
          hCells.push({ rowIdent, colIndex: hContextIndex });
        }
      } else {
        hCells.pop();
      }
    }
  }

  const vCells: GridDataPoint[] = [ ];
  if (v !== 0) {
    let vContextIdent = rowIdent;
    let vContext = contextApi.findRowInCache(vContextIdent, v, true);
    while (vContext && vContext.cells[colIndex].selected) {
      vContextIdent = vContext.identity;
      vCells.push({ rowIdent: vContextIdent, colIndex });
      vContext = contextApi.findRowInCache(vContextIdent, v, true);
    }

    if (moveV) {
      if (v === moveV) {
        if (vContext) {
          vCells.push({ rowIdent: vContext.identity, colIndex });
        }
      } else {
        vCells.pop();
      }
    }

  }

  const vhCells: GridDataPoint[] = [ ];
  for (const vCell of vCells) {
    for (const hCell of hCells) {
      const vhContext = contextApi.findRowInCache(vCell.rowIdent).cells[hCell.colIndex];
      if (vhContext) {
        vhCells.push({ rowIdent: vCell.rowIdent, colIndex: hCell.colIndex });
      }
    }
  }

  contextApi.selectCells();
  contextApi.selectCells([ sourceCellRef, ...hCells, ...vCells, ...vhCells ]);
}

/**
 * Swap the focus from the source cell to a straight adjacent cell (not diagonal).
 * @param contextApi The context API instance
 * @param sourceCellRef A point reference to the source cell the direction is relative to
 * @param direction The direction of the new cell.
 * [1 | -1, 0] -> HORIZONTAL
 * [0, 1 | -1] -> VERTICAL
 */
function handleSingleItemFocus(contextApi: PblNgridContextApi<any>,
                               sourceCellRef: GridDataPoint,
                               direction: [0, 1 | -1] | [1 | -1, 0]) {
  const rowState = contextApi.findRowInCache(sourceCellRef.rowIdent, direction[1], true);
  if (rowState) {
    contextApi.focusCell({ rowIdent: rowState.identity, colIndex: sourceCellRef.colIndex + direction[0] }, true);
  }
}
