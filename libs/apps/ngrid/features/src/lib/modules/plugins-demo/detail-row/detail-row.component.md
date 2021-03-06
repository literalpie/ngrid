# Detail Row

I> Requires `@pebula/ngrid/target-event` plugin

W> Currently not compatible with virtual scroll, make sure virtual scroll is not enabling on the table when detail rows are used

<docsi-mat-example-with-source title="Detail Row" contentClass="table-height-300 mat-elevation-z7" [query]="[{section: 'ex-1'}]">
  <!--@pebula-example:ex-1-->
  <pbl-ngrid blockUi [dataSource]="ds1" [columns]="columns1" detailRow vScrollNone>
    <div *pblNgridDetailRowDef="let row" class="pbl-detail-row">
      <div>
        <h1>Detail Row</h1>
        <pre>{{row | json}}</pre>
      </div>
    </div>
  </pbl-ngrid>
  <!--@pebula-example:ex-1-->
</docsi-mat-example-with-source>

<docsi-mat-example-with-source title="Detail Row custom parent" contentClass="table-height-300 mat-elevation-z7" [query]="[{section: 'ex-2'}]">
  <!--@pebula-example:ex-2-->
  <pbl-ngrid blockUi [dataSource]="ds2" [columns]="columns2" detailRow vScrollNone>
    <div *pblNgridDetailRowDef="let row" class="pbl-detail-row">
      <div>
        <h1>Detail Row</h1>
        <pre>{{row | json}}</pre>
      </div>
    </div>
    <pbl-ngrid-row *pblNgridDetailRowParentRef="let row; table as table" [detailRow]="row" matRipple></pbl-ngrid-row>
    <div *pblNgridCellTypeDef="'detailRowHandle'" class="detail-row-handle">⊞</div>
  </pbl-ngrid>
  <!--@pebula-example:ex-2-->
</docsi-mat-example-with-source>

<docsi-mat-example-with-source title="Detail Row Single mode & exclude toggle mode" contentClass="table-height-300 mat-elevation-z7" [query]="[{section: 'ex-3'}]">
  <!--@pebula-example:ex-3-->
  <pbl-ngrid blockUi [dataSource]="ds3" [columns]="columns3"
            detailRow [singleDetailRow]="forceSingle" [excludeToggleFrom]="disableName" vScrollNone>
    <div *pblNgridDetailRowDef="let row" class="pbl-detail-row">
      <div>
        <h1>Detail Row</h1>
        <pre>{{row | json}}</pre>
      </div>
    </div>
  </pbl-ngrid>
  <mat-checkbox [checked]="forceSingle" (change)="forceSingle = $event.checked">Force single row</mat-checkbox>
  <mat-checkbox [checked]="disableName.length > 0" (change)="disableName = disableName.length === 0 ? ['name'] : []">Disable toggle from 'Name'</mat-checkbox>
  <!--@pebula-example:ex-3-->
</docsi-mat-example-with-source>

<docsi-mat-example-with-source title="Detail Row predicate" contentClass="table-height-300 mat-elevation-z7" [query]="[{section: 'ex-4'}]">
  <!--@pebula-example:ex-4-->
  <pbl-ngrid blockUi [dataSource]="ds4" [columns]="columns4"
            [detailRow]="detailRowPredicate" vScrollNone>
    <div *pblNgridDetailRowDef="let row" class="pbl-detail-row">
      <div>
        <h1>Detail Row</h1>
        <pre>{{row | json}}</pre>
      </div>
    </div>
  </pbl-ngrid>
  <mat-radio-group (change)="onDetailRowChange($event.value)" [value]="detailRow">
    <mat-radio-button value="off">Off</mat-radio-button>
    <mat-radio-button value="on">On</mat-radio-button>
    <mat-radio-button value="predicate">Predicate (Even rows only)</mat-radio-button>
  </mat-radio-group>
  <!--@pebula-example:ex-4-->
</docsi-mat-example-with-source>
