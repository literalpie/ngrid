/* @pebula-example:ex-1 */
/* @pebula-example:ex-2 */
/* @pebula-example:ex-3 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import { createDS, columnFactory } from '@pebula/ngrid';
import { PblNgridRowEvent, PblNgridCellEvent } from '@pebula/ngrid/target-events';

import { Person, DemoDataSource } from '@pebula/apps/ngrid/shared';

function isCellEvent<T>(event: PblNgridRowEvent<T> | PblNgridCellEvent<T>): event is PblNgridCellEvent<T> {
  return !!(event as  PblNgridCellEvent<T>).cellTarget;
}

const COLUMNS = columnFactory()
  .default({minWidth: 100})
  .table(
    { prop: 'id', sort: true, width: '40px' },
    { prop: 'name', sort: true },
    { prop: 'gender', width: '50px' },
    { prop: 'birthdate', type: 'date' }
  )
  .build();

const COLUMNS2 = columnFactory()
  .default({minWidth: 100})
  .table(
    { prop: 'id', sort: true, width: '40px' },
    { prop: 'name', sort: true },
    { prop: 'gender', width: '50px' },
    { prop: 'birthdate', type: 'date' },
    { prop: 'bio' },
    { prop: 'email', minWidth: 250, width: '250px' },
    { prop: 'language', headerType: 'language' },
    { prop: 'lead' },
    { prop: 'settings.avatar' },
    { prop: 'settings.background' },
    { prop: 'settings.timezone' },
    { prop: 'settings.emailFrequency' },
    { prop: 'lastLoginIp' }
  )
  .header(
    { id: 'HEADER', label: 'A SIMPLE 1 CELL HEADER' },
  )
  .headerGroup(
    {
      prop: 'name',
      span: 4,
      label: 'Personal Info',
    },
    {
      prop: 'settings.avatar',
      span: 3,
      label: 'User Settings',
    }
  )
  .footer(
    { id: 'FOOTER', label: 'A SIMPLE 1 CELL FOOTER' },
  )
  .build();

@Component({
  selector: 'pbl-target-events-grid-example-component',
  templateUrl: './target-events.component.html',
  styleUrls: ['./target-events.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TargetEventsGridExampleComponent {


  columns = COLUMNS;
  columns2 = COLUMNS2;

  ds1 = createDS<Person>().onTrigger( () => this.datasource.getPeople(0, 500) ).create();
  ds2 = createDS<Person>().onTrigger( () => this.datasource.getPeople(0, 5) ).create();

  constructor(private datasource: DemoDataSource) { }

  onClickEvents(event: PblNgridRowEvent<Person> | PblNgridCellEvent<Person>) {
    let cellSuffix = '';
    if (isCellEvent(event)) {
      cellSuffix = `  CELL: ${event.colIndex}`;
      event.cellTarget.focus();
    } else {
      if (event.root)  {
        cellSuffix = ` [Bubbled from CELL: ${event.root.colIndex}]`;
      }
    }
    // alert(`CLICK EVENT at ROW: ${event.rowIndex}${cellSuffix}\nType: ${event.type}\nSubType: ${event.subType}`);
  }

  onKeyDown(event: PblNgridRowEvent<Person> | PblNgridCellEvent<Person>) {
    const source: KeyboardEvent = event.source as any;
    if (isCellEvent(event)) {
      const sourceCell = event.cellTarget;


      switch (source.keyCode) {
        case UP_ARROW:
          this.focusCell(this.moveFocusVertically(sourceCell, -1));
          break;
        case DOWN_ARROW:
          this.focusCell(this.moveFocusVertically(sourceCell, 1));
          break;
        case LEFT_ARROW:
          this.focusCell(this.moveFocusHorizontally(sourceCell, -1));
          break;
        case RIGHT_ARROW:
          this.focusCell(this.moveFocusHorizontally(sourceCell, 1));
          break;
      }
    }
  }

  onEnterLeaveEvents(event: PblNgridRowEvent<Person> | PblNgridCellEvent<Person>, isEnter = false) {
    if (isCellEvent(event)) {
      if (isEnter) {
        event.cellTarget.classList.add('cell-hovered');
        event.rowTarget.classList.add('row-cell-hovered');
      } else {
        event.cellTarget.classList.remove('cell-hovered');
        event.rowTarget.classList.remove('row-cell-hovered');
      }
    } else {
      if (isEnter) {
        event.rowTarget.classList.add('row-hovered');
      } else {
        event.rowTarget.classList.remove('row-hovered');
        event.rowTarget.classList.remove('row-cell-hovered');
      }
    }
  }

  private focusCell(cell: HTMLElement): void {
    if (cell) {
      cell.focus();
    }
  }

  private moveFocusVertically(currentCell: HTMLElement, offset: number): HTMLElement | undefined {
    const currentRow = currentCell.closest('pbl-ngrid-row');
    const rows = Array.from(currentRow.closest('pbl-ngrid').querySelectorAll('pbl-ngrid-row'));
    const currentRowIndex = rows.indexOf(currentRow);
    const currentIndexWithinRow = Array.from(currentRow.childNodes).indexOf(currentCell);
    const newRowIndex = currentRowIndex + offset;

    if (rows[newRowIndex]) {
      return rows[newRowIndex].childNodes[currentIndexWithinRow] as HTMLElement;
    }
  }

  private  moveFocusHorizontally(currentCell: HTMLElement, offset: number): HTMLElement | undefined {
    const cells = Array.from(currentCell.closest('pbl-ngrid').querySelectorAll('pbl-ngrid-cell')) as HTMLElement[];
    const currentIndex = cells.indexOf(currentCell);
    const newIndex = currentIndex + offset;
    return cells[newIndex];
  }

}
/* @pebula-example:ex-3 */
/* @pebula-example:ex-2 */
/* @pebula-example:ex-1 */
