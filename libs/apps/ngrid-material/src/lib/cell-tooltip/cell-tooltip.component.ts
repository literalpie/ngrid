/* @pebula-example:ex-1 */
/* @pebula-example:ex-2 */
/* @pebula-example:ex-3 */
import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { createDS, columnFactory } from '@pebula/ngrid';
import { PblNgridCellEvent } from '@pebula/ngrid/target-events';

import { Person, DemoDataSource } from '@pebula/apps/ngrid/shared';

const COLUMNS = columnFactory()
  .default({minWidth: 100})
  .table(
    { prop: 'id', sort: true, width: '40px' },
    { prop: 'name', sort: true },
    { prop: 'gender', width: '50px' },
    { prop: 'birthdate', type: 'date' },
    { prop: 'bio' },

  )
  .build();

@Component({
  selector: 'pbl-cell-tooltip-grid-example-component',
  templateUrl: './cell-tooltip.component.html',
  styleUrls: ['./cell-tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellTooltipGridExampleComponent {


  columns = COLUMNS;

  ds1 = createDS<Person>().onTrigger( () => this.datasource.getPeople(0, 15) ).create();

  ds2 = createDS<Person>().onTrigger( () => this.datasource.getPeople(0, 15) ).create();

  constructor(private datasource: DemoDataSource) { }

  getTooltipMessage(event: PblNgridCellEvent<Person>): string {
    return `${event.colIndex} / ${event.rowIndex} -> ${event.rowIndex % 2 ? 'ODD' : 'EVEN'} ROW\n\n${event.cellTarget.innerText}`;
  }
}
/* @pebula-example:ex-3 */
/* @pebula-example:ex-2 */
/* @pebula-example:ex-1 */
