# Target Events

<docsi-mat-example-with-source title="Cell/Row -> Click Events" contentClass="table-height-300 mat-elevation-z7" [query]="[{section: 'ex-1'}]">
  <!--@pebula-example:ex-1-->
  <pbl-ngrid blockUi [dataSource]="ds1" [columns]="columns" identityProp="name"
            focusMode="cell"
            (cellClick)="onClickEvents($event)"
            (rowClick)="onClickEvents($event)"></pbl-ngrid>
  <!--@pebula-example:ex-1-->
</docsi-mat-example-with-source>

<docsi-mat-example-with-source title="Cell/Row -> Enter/Leave Events" contentClass="table-height-300 mat-elevation-z7" [query]="[{section: 'ex-2'}]">
  <!--@pebula-example:ex-2-->
  <pbl-ngrid blockUi [dataSource]="ds2" [columns]="columns2" vScrollNone showFooter
            (cellEnter)="onEnterLeaveEvents($event, true)" (cellLeave)="onEnterLeaveEvents($event)"
            (rowEnter)="onEnterLeaveEvents($event, true)" (rowLeave)="onEnterLeaveEvents($event)"></pbl-ngrid>
  <!--@pebula-example:ex-2-->
</docsi-mat-example-with-source>

i> The plugin `@pebula/ngrid/detail-row` requires this plugin
