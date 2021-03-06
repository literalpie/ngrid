/* @pebula-example:ex-1 ex-2 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { createDS, columnFactory } from '@pebula/ngrid';
import { Person, DemoDataSource } from '@pebula/apps/ngrid/shared';

const COLUMNS = columnFactory()
  .default({minWidth: 100})
  .table(
    { prop: 'id', sort: true, width: '40px' },
    { prop: 'name', sort: true },
    { prop: 'gender', width: '50px' },
    { prop: 'birthdate', type: 'date' }
  )
  .build();


@Component({
  selector: 'pbl-virtual-scroll-grid-example-component',
  templateUrl: './virtual-scroll.component.html',
  styleUrls: ['./virtual-scroll.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualScrollGridExampleComponent {

  columns = COLUMNS;

  /* @pebula-ignore:ex-2 */
  ds = this.createDatasource();
  /* @pebula-ignore:ex-2 */
  /* @pebula-ignore:ex-1 */
  dsScrollingEvents = this.createDatasource();
  isScrolling: -1 | 0 | 1 = 0;
  /* @pebula-ignore:ex-1 */

  constructor(private datasource: DemoDataSource) {}

  /* @pebula-ignore:ex-2 */
  removeDatasource(): void {
    if (this.ds) {
      this.ds.dispose();
      this.ds = undefined;
    }
  }

  createDatasource() {
    return createDS<Person>()
      .onTrigger( () => this.datasource.getPeople(0, 1500) )
      .create();
  }
  /* @pebula-ignore:ex-2 */
}
/* @pebula-example:ex-1 ex-2 */
