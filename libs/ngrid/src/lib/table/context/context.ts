import { ViewContainerRef, EmbeddedViewRef } from '@angular/core';
import { RowContext } from '@angular/cdk/table';

import { PblNgridExtensionApi } from '../../ext/table-ext-api';
import { PblNgridComponent } from '../table.component';
import { PblNgridCellContext, PblNgridMetaCellContext, PblNgridRowContext  } from './types';
import { PblColumn } from '../columns/column';
import { PblMetaColumn } from '../columns/meta-column';
import { ColumnApi } from '../column-api';
import { findCellRenderedIndex, findRowRenderedIndex } from './utils';

declare module '@angular/cdk/table/typings/row.d' {
  export interface CdkCellOutletRowContext<T> {
    pblRowContext: PblNgridRowContext<T>;
  }
  export interface CdkCellOutletMultiRowContext<T> {
    pblRowContext: PblNgridRowContext<T>;
  }
}

export interface CellContextState<T = any> {
  editing: boolean;
  focused: boolean;
  selected: boolean;
}

export interface RowContextState<T = any> {
  identity: any;
  dataIndex: number;
  cells: CellContextState<T>[];
  firstRender: boolean;
}

export class MetaCellContext<T, TCol extends PblMetaColumn | PblColumn = PblMetaColumn> implements PblNgridMetaCellContext<T, TCol> {
  get $implicit(): MetaCellContext<T, TCol> { return this; }

  constructor(public col: TCol, public table: PblNgridComponent<any>) {}
}

export class CellContext<T = any> implements PblNgridCellContext<T> {
  private static ACTIVE_FOCUSED = new WeakMap<PblNgridComponent, { rowIdentity: any, colIndex: number }>();

  get $implicit(): CellContext<T> { return this; }
  get row(): T { return this.rowContext.$implicit; };
  get value(): any { return this.col.getValue(this.row); }
  set value(v: any) { this.col.setValue(this.row, v); }

  get rowContext(): PblNgridRowContext<T> { return this._rowContext; }
  get editing(): boolean { return this._editing; }
  get focused(): boolean { return this._focused; }
  get selected(): boolean { return this._selected; }

  readonly index: number;

  private _rowContext: PblNgridRowContext<T>;
  private _editing = false;
  private _focused = false;
  private _selected = false;

  constructor(rowContext: PblNgridRowContext<T>, public col: PblColumn, public table: PblNgridComponent<any>) {
    this.index = table.columnApi.indexOf(col);
    this._rowContext = rowContext;
  }

  static fromState<T>(rowContext: PblRowContext<T>, state: CellContextState<T>, cellContext: CellContext<T>, skipRowUpdate?: boolean): void {
    const requiresReset = !skipRowUpdate && cellContext._editing === state.editing;

    cellContext._rowContext = rowContext;
    cellContext._editing = state.editing;
    cellContext._focused = state.focused;
    cellContext._selected = state.selected;

    if (requiresReset) {
      PblRowContext.updateCell(rowContext, cellContext);
    }
  }

  static defaultState<T = any>(): CellContextState<T> {
    return { editing: false, focused: false, selected: false };
  }

  clone(): CellContext<T> {
    const ctx = new CellContext<T>(this._rowContext, this.col, this.table);
    CellContext.fromState(this._rowContext as PblRowContext<T>, this.getState(), ctx, true);
    return ctx;
  }

  getState(): CellContextState<T> {
    return {
      editing: this._editing,
      focused: this._focused,
      selected: this._selected,
    };
  }

  startEdit(markForCheck?: boolean): void {
    if (this.col.editorTpl && !this.editing) {
      this._editing = true;
      PblRowContext.updateCell(this.rowContext as PblRowContext<T>, this);
      if (markForCheck) {
        this.table._cdkTable.syncRows('data', true, this.rowContext.index);
      }
    }
  }

  stopEdit(markForCheck?: boolean): void {
    if (this.editing && !this.table.viewport.isScrolling) {
      this._editing = false;
      PblRowContext.updateCell(this.rowContext as PblRowContext<T>, this);
      if (markForCheck) {
        this.table._cdkTable.syncRows('data', this.rowContext.index);
      }
    }
  }

  focus(state: boolean, markForCheck?: boolean): void {
    if (state !== this._focused && !this.table.viewport.isScrolling) {
      this._focused = state;

      const activeFocused = CellContext.ACTIVE_FOCUSED.get(this.table);
      const isSelfState = activeFocused
        ? activeFocused.rowIdentity === this.rowContext.identity
        : null
      ;

      if (!state && isSelfState) {
        CellContext.ACTIVE_FOCUSED.delete(this.table);
      } else {
        if (isSelfState === false) {
          const extApi: PblNgridExtensionApi = this.rowContext['extApi'];
          extApi.contextApi.updateCache(activeFocused.rowIdentity, activeFocused.colIndex, { focused: false });
        }
        CellContext.ACTIVE_FOCUSED.set(this.table, { rowIdentity: this.rowContext.identity, colIndex: this.index });
      }

      if (markForCheck) {
        this.table._cdkTable.syncRows('data', this.rowContext.index);
      }
    }
  }

  select(state: boolean, markForCheck?: boolean): void {
    if (state !== this._selected && !this.table.viewport.isScrolling) {
      this._selected = state;
      PblRowContext.updateCell(this.rowContext as PblRowContext<T>, this);
      if (markForCheck) {
        this.table._cdkTable.syncRows('data', this.rowContext.index);
      }
    }
  }
}

export class PblRowContext<T> implements PblNgridRowContext<T> {
  /** Data for the row that this cell is located within. */
  $implicit?: T;
  /** Index of the data object in the provided data array. */
  index?: number;
  /** Index location of the rendered row that this cell is located within. */
  renderIndex?: number;
  /** Length of the number of total rows. */
  count?: number;
  /** True if this cell is contained in the first row. */
  first?: boolean;
  /** True if this cell is contained in the last row. */
  last?: boolean;
  /** True if this cell is contained in a row with an even-numbered index. */
  even?: boolean;
  /** True if this cell is contained in a row with an odd-numbered index. */
  odd?: boolean;

  firstRender: boolean;
  outOfView: boolean;
  readonly table: PblNgridComponent<T>;

  /**
   * Returns the length of cells context stored in this row
   */
  get length(): number {
    return (this.cells && this.cells.length) || 0;
  }

  get pblRowContext(): PblNgridRowContext<T> { return this; }
  set pblRowContext(value: PblNgridRowContext<T>) { }

  private cells: CellContext<T>[];

  constructor(public identity: any, public dataIndex: number, private extApi: PblNgridExtensionApi<T>) {
    /*  TODO: material2#14198
        The row context come from the `cdk` and it can be of 2 types, depending if multiple row templates are used or not.
        `index` is used for single row template mode and `renderIndex` for multi row template mode.

        There library and/or plugins require access to the rendered index and having 2 locations is a problem...
        It's a bug trap, adding more complexity and some time access issue because the `CdkTable` instance is not always available.

        This is a workaround for have a single location for the rendered index.
        I chose to `index` as the single location although `renderIndex` will probably be chosen by the material team.
        This is because it's less likely to occur as most tables does not have multi row templates (detail row)
        A refactor will have to be done in the future.
        There is a pending issue to do so in https://github.com/angular/material2/issues/14198
        Also related: https://github.com/angular/material2/issues/14199
    */
    const applyWorkaround = extApi.cdkTable.multiTemplateDataRows;
    if (applyWorkaround) {
      Object.defineProperty(this, 'index', { get: function() { return this.renderIndex; } });
    }

    this.table = extApi.table;

    const cells = this.cells = [];
    const { columns } = extApi.table.columnApi;
    const len = columns.length;

    for (let columnIndex = 0; columnIndex < len; columnIndex++) {
      const cellContext = new CellContext<T>(this, columns[columnIndex], extApi.table);
      cells.push(cellContext);
    }
  }

  static updateCell<T>(rowContext: PblRowContext<T>, cell: CellContext<T>): boolean {
    // if (rowContext.cells[cell.index] === cell) {
      rowContext.cells[cell.index] = cell.clone();
      return true;
    // }
    // return false;
  }

  static fromState<T>(rowContext: PblRowContext<T>, state: RowContextState<T>): void {
    rowContext.identity = state.identity;
    rowContext.firstRender = state.firstRender;
    rowContext.dataIndex = state.dataIndex;
    for (let i = 0, len = rowContext.cells.length; i < len; i++) {
      CellContext.fromState<T>(rowContext, state.cells[i], rowContext.cells[i]);
    }
  }

  static defaultState<T = any>(identity: any, dataIndex: number, cellsCount: number): RowContextState<T> {
    const cells: CellContextState<T>[] = [];
    for (let i = 0; i < cellsCount; i++) {
      cells.push(CellContext.defaultState());
    }
    return { identity, dataIndex, cells, firstRender: true };
  }

  getState(): RowContextState<T> {
    return {
      identity: this.identity,
      dataIndex: this.dataIndex,
      firstRender: this.firstRender,
      cells: this.cells.map( c => c.getState() ),
    };
  }

  updateContext(context: RowContext<T>): void {
    context.dataIndex = this.dataIndex;
    Object.assign(this, context);
  }

  /**
   * Returns the cell context for the column at the specified position.
   * > The position is relative to ALL columns (NOT RENDERED COLUMNS)
   */
  cell(index: number | PblColumn): CellContext<T> | undefined {
    const idx = typeof index === 'number' ? index : this.table.columnApi.indexOf(index);
    return this.cells[idx];
  }

  getCells(): CellContext<T>[] {
    return (this.cells && this.cells.slice()) || [];
  }

    /**
   * Updates the `outOfView` property.
   */
  updateOutOfViewState(): void {
    this.extApi.contextApi.updateOutOfViewState(this);
  }
}

export class ContextApi<T = any> {
  private viewCache = new Map<number, PblRowContext<T>>();
  private cache = new Map<any, RowContextState<T>>();
  private vcRef: ViewContainerRef;
  private columnApi: ColumnApi<T>;

  constructor(private extApi: PblNgridExtensionApi<T>) {
    this.vcRef = extApi.cdkTable._rowOutlet.viewContainer;
    this.columnApi = extApi.table.columnApi;

    const updateContext = () => {
      const viewPortRect = this.getViewRect();
      const lastView = new Set(Array.from(this.viewCache.values()).map( v => v.identity ));
      const unmatchedRefs = new Map<T, [number, number]>();

      let keepProcessOutOfView = !!viewPortRect;
      for (let i = 0, len = this.vcRef.length; i < len; i++) {
        const viewRef = this.findViewRef(i);
        const rowContext = this.findRowContext(viewRef, i);
        this.viewCache.set(i, rowContext);
        lastView.delete(rowContext.identity);

        // Identity did not change but context did change
        // This is probably due to trackBy with index reference or that matched data on some property but the actual data reference changed.
        // We log these and handle them later, they come in pair and we need to switch the context between the values in the pair.

        // The pair is a 2 item tuple - 1st item is new index, 2nd item is the old index.
        // We build the pairs, each pair is a switch
        if (viewRef.context.$implicit !== rowContext.$implicit) {
          let pair = unmatchedRefs.get(rowContext.$implicit) || [-1, -1];
          pair[1] = i;
          unmatchedRefs.set(rowContext.$implicit, pair);

          pair = unmatchedRefs.get(viewRef.context.$implicit) || [-1, -1];
          pair[0] = i;
          unmatchedRefs.set(viewRef.context.$implicit, pair);
        }

        if (keepProcessOutOfView) {
          keepProcessOutOfView = processOutOfView(viewRef, viewPortRect, 'top');
        }
      }

      if (unmatchedRefs.size > 0) {
        // We have pairs but we can't just start switching because when the items move or swap we need
        // to update their values and so we need to cache one of them.
        // The operation will effect all items (N) between then origin and destination.
        // When N === 2 its a swap, when N > 2 its a move.
        // In both cases the first and last operations share the same object.
        // Also, we need to make sure that the order of operations does not use the same row as the source more then once.
        // For example, If I copy row 5 to to row 4 and then 4 to 3 I need to start from 3->4->5, if I do 5->4->3 I will get 5 in all rows.
        //
        // We use the source (pair[1]) for sorting, the sort order depends on the direction of the move (up/down).
        const arr = Array.from(unmatchedRefs.entries()).filter( entry => {
          const pair = entry[1];
          if (pair[0] === -1) {
            return false;
          } else if (pair[1] === -1) {
            const to = this.viewCache.get(pair[0]);
            to.$implicit = entry[0];
            return false;
          }
          return true;
        }).map( entry => entry[1] );

        unmatchedRefs.clear();

        if (arr.length) {
          const sortFn = arr[arr.length - 1][0] - arr[arr.length - 1][1] > 0 // check sort direction
            ? (a,b) => b[1] - a[1]
            : (a,b) => a[1] - b[1]
          ;
          arr.sort(sortFn);

          const lastOp = {
            data: this.viewCache.get(arr[0][0]).$implicit,
            state: this.viewCache.get(arr[0][0]).getState(),
            pair: arr.pop(),
          };

          for (const pair of arr) {
            // What we're doing here is switching the context wrapped by `RotContext` while the `RowContext` preserve it's identity.
            // Each row context has a state, which is valid for it's current context, if we switch context we must switch state as well and also
            // cache it.
            const to = this.viewCache.get(pair[0]);
            const from = this.viewCache.get(pair[1]);
            const state = from.getState();
            state.identity = to.identity;
            this.cache.set(to.identity, state);
            PblRowContext.fromState(to, state);
            to.$implicit = from.$implicit;
          }

          const to = this.viewCache.get(lastOp.pair[0]);
          lastOp.state.identity = to.identity;
          this.cache.set(to.identity, lastOp.state);
          PblRowContext.fromState(to, lastOp.state);
          to.$implicit = lastOp.data;
        }
      }

      if(viewPortRect) {
        for (let i = this.vcRef.length -1; i > -1; i--) {
          if (!processOutOfView(this.findViewRef(i), viewPortRect, 'bottom')) {
            break;
          }
        }
      }

      lastView.forEach( ident => this.cache.get(ident).firstRender = false );
    };

    updateContext();
    extApi.cdkTable.onRenderRows.subscribe(updateContext);
  }

  clear(): void {
    for (let i = 0, len = this.vcRef.length; i < len; i++) {
      const viewRef = this.findViewRef(i);
      delete viewRef.context.pblRowContext;
    }
    this.viewCache.clear();
    this.cache.clear();
  }

  getRow(row: number | HTMLElement): PblNgridRowContext<T> | undefined {
    const index = typeof row === 'number' ? row : findRowRenderedIndex(row);
    return this.rowContext(index);
  }

  getCell(cell: HTMLElement): PblNgridCellContext | undefined
  /**
   * Return the cell context for the cell at the point specified
   * @param row
   * @param col
   */
  getCell(row: number, col: number): PblNgridCellContext | undefined;
  getCell(rowOrCellElement: number | HTMLElement, col?: number): PblNgridCellContext | undefined {
    if (typeof rowOrCellElement === 'number') {
      const rowContext = this.rowContext(rowOrCellElement);
      if (rowContext) {
        return rowContext.cell(col);
      }
    } else {
      const [ r, c ] = findCellRenderedIndex(rowOrCellElement);
      const column = this.extApi.table.columnApi.findColumnAt(c);
      const columnIndex = this.extApi.table.columnApi.indexOf(column);
      const rowContext = this.rowContext(r);
      if (rowContext) {
        return rowContext.cell(columnIndex);
      }
    }
  }

  createCellContext(renderRowIndex: number, column: PblColumn): CellContext<T> {
    const rowContext = this.rowContext(renderRowIndex);
    const colIndex = this.columnApi.indexOf(column);
    return rowContext.cell(colIndex);
  }

  rowContext(renderRowIndex: number): PblRowContext<T> | undefined {
    return this.viewCache.get(renderRowIndex);
  }

  updateOutOfViewState(rowContext: PblRowContext<T>): void {
    const viewPortRect = this.getViewRect();
    const viewRef = this.findViewRef(rowContext.index);
    processOutOfView(viewRef, viewPortRect);
  }

  updateCache(rowIdentity: any, columnIndex: number, cellState: Partial<CellContextState<T>>): void;
  updateCache(rowIdentity: any, rowState: Partial<RowContextState<T>>): void;
  updateCache(rowIdentity: any, rowStateOrCellIndex: Partial<RowContextState<T>> | number, cellState?: Partial<CellContextState<T>>): void {
    const currentRowState = this.cache.get(rowIdentity);
    if (currentRowState) {
      if (typeof rowStateOrCellIndex === 'number') {
        const currentCellState = currentRowState.cells[rowStateOrCellIndex];
        if (currentCellState) {
          Object.assign(currentCellState, cellState);
        }
      } else {
        Object.assign(currentRowState, rowStateOrCellIndex);
      }
    }
  }

  private findViewRef(index: number): EmbeddedViewRef<RowContext<T>> {
    return this.vcRef.get(index) as EmbeddedViewRef<RowContext<T>>;
  }

  /**
   * Find/Update/Create the `RowContext` for the provided `EmbeddedViewRef` at the provided render position.
   *
   * A `RowContext` object is a wrapper for the internal context of a row in `CdkTable` with the purpose of
   * extending it for the table features.
   *
   * The process has 2 layers of cache:
   *
   * - `RowContext` objects are stored in a view cache which is synced with the `CdkTable` row outlet viewRefs.
   * Each view ref (row) has a matching record in the `RowContext` view cache.
   *
   * - `RowContextState` object are stored in a cache which is synced with the items in the data source.
   * Each item in the datasource has a matching row `RowContextState` item (lazy), which is used to persist context
   * when `RowContext` goes in/out of the viewport.
   *
   * @param viewRef The `EmbeddedViewRef` holding the context that the returned `RowContext` should wrap
   * @param renderRowIndex The position of the view, relative to other rows.
   * The position is required for caching the context state when a specific row is thrown out of the viewport (virtual scroll).
   * Each `RowContext` gets a unique identity using the position relative to the current render range in the data source.
   */
  private findRowContext(viewRef: EmbeddedViewRef<RowContext<T>>, renderRowIndex: number): PblRowContext<T> | undefined {
    const { context } = viewRef;
    const dataIndex = this.extApi.table.ds.renderStart + renderRowIndex;
    const identity = this.extApi.table.identityProp
      ? viewRef.context.$implicit[this.extApi.table.identityProp]
      : dataIndex
    ;

    let rowContext: PblRowContext<T> = context.pblRowContext as PblRowContext<T>;

    if (!this.cache.has(identity)) {
      this.cache.set(identity, PblRowContext.defaultState(identity, dataIndex, this.columnApi.columns.length));
    }

    if (!rowContext) {
      rowContext = context.pblRowContext = this.createRowContext(identity, dataIndex, context);
      viewRef.onDestroy(() => {
        this.viewCache.delete(renderRowIndex);
        delete context.pblRowContext;
      });
    } else if (rowContext.identity !== identity) {
      // save old state before applying new state
      this.cache.set(rowContext.identity, rowContext.getState());
      rowContext.updateContext(context);

      // We
      const gap = dataIndex - rowContext.dataIndex;
      if (gap > 0) {
        const siblingViewRef = this.findViewRef(renderRowIndex + gap);
        const siblingRowContext = siblingViewRef && siblingViewRef.context.pblRowContext as PblRowContext<T>;
        if (siblingRowContext) {
          this.cache.set(siblingRowContext.identity, siblingRowContext.getState());
        }
      }
    } else {
      return rowContext;
    }
    PblRowContext.fromState(rowContext, this.cache.get(identity));

    return rowContext;
  }

  private createRowContext(identity: any, dataIndex: number, context: RowContext<T>): PblRowContext<T> {
    const rowContext = new PblRowContext<T>(identity, dataIndex, this.extApi);

    rowContext.updateContext(context);
    return rowContext;
  }

  private getViewRect(): ClientRect | DOMRect {
    return this.extApi.table.viewport.elementRef.nativeElement.getBoundingClientRect();
  }
}

function processOutOfView(viewRef: EmbeddedViewRef<RowContext<any>>, viewPortRect: ClientRect | DOMRect, location?: 'top' | 'bottom'): boolean {
  const el: HTMLElement = viewRef.rootNodes[0];
  const rowContext = viewRef.context.pblRowContext;
  const elRect = el.getBoundingClientRect();

  let isInsideOfView: boolean;
  switch (location){
    case 'top':
      isInsideOfView = elRect.bottom >= viewPortRect.top;
      break;
    case 'bottom':
      isInsideOfView = elRect.top <= viewPortRect.bottom;
      break;
    default:
      isInsideOfView = (elRect.bottom >= viewPortRect.top && elRect.top <= viewPortRect.bottom)
      break;
  }

  if (isInsideOfView) {
    if (!rowContext.outOfView) {
      return false;
    }
    rowContext.outOfView = false;
  } else {
    rowContext.outOfView = true;
  }
  return true;
}
