import { PblColumn } from '@pebula/ngrid';

declare module '@pebula/ngrid/lib/table/columns/column' {
  interface PblColumn {
    resize: boolean;
  }
}


declare module '@pebula/ngrid/lib/table/columns/types' {
  interface PblColumnDefinition {
    resize?: boolean;
  }
}

PblColumn.extendProperty('resize');
