<pbl-ngrid identityProp="id" rowReorder columnReorder
           blockUi
           matSort vScrollFixed
           cellTooltip
           matCheckboxSelection="selection"
           [stickyHeader]="['table']"
           [dataSource]="dataSource"
           [columns]="columns"
           (cellClick)="$event.context && $event.context.startEdit()"
           style="height: 500px"
           class=" pbl-ngrid-cell-ellipsis pbl-ngrid-header-cell-ellipsis">
  <pbl-demo-action-row filter label="Sellers" (refresh)="refresh()" ></pbl-demo-action-row>
  <div *pblNgridCellTypeDef="'countryNameDynamic'; col as col; row as row">{{ col.type.data.name(row) }}</div>

  <div *pblNgridHeaderCellTypeDef="'pbl-groupby-row'; col as col; table as table" pblAggregationContainer #agg="pblAggregationContainer"
       fxLayoutAlign="start center"
       style="position: absolute; height: 100%; width: 100%;">
    <mat-icon>format_list_bulleted</mat-icon>
    <mat-chip-list>
      <mat-chip *ngFor="let c of table.columnApi.groupByColumns"
                (removed)="table.columnApi.removeGroupBy(c)">
        {{ c.label }}
        <mat-icon matChipRemove>cancel</mat-icon>
      </mat-chip>
      <mat-chip *ngIf="agg.pending">
        {{ agg.pending.label }}
      </mat-chip>
    </mat-chip-list>
    <div *cdkDragPlaceholder></div>
  </div>
</pbl-ngrid>
