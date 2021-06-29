import React, { useEffect } from 'react';
const styles = require('./LogItem.module').default;
import { Grid, Level, LevelItem, Pagination } from '@patternfly/react-core';
import { Table } from '@patternfly/react-table/dist/js/components/Table/Table';
import { TableHeader } from '@patternfly/react-table/dist/js/components/Table/Header';
import { TableBody } from '@patternfly/react-table/dist/js/components/Table/Body';
import { sortable } from '@patternfly/react-table/dist/js/components/Table/utils/decorators/sortable';
import { useSortState } from '../../../../common/duck/hooks';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
import { IRow } from '@patternfly/react-table/dist/js/components/Table/TableTypes';

const LogItem = ({ log }: any) => {
  const getSortValues = (): any => {
    return [];
  };

  const columns = [{ title: 'Name', transforms: [sortable] }];
  const { sortBy, onSort, sortedItems } = useSortState(log, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);
  const rows: IRow[] = currentPageItems.map((item) => ({ cells: [item] }));

  return (
    <Grid hasGutter className={styles.container}>
      <Level>
        <LevelItem />
        <LevelItem>
          <Pagination {...paginationProps} widgetId="logs-table-pagination-top" />
        </LevelItem>
      </Level>

      <Table
        aria-label="Logs table"
        cells={columns}
        rows={rows}
        onSort={onSort}
        className={`${spacing.mtMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination variant="bottom" {...paginationProps} widgetId="logs-table-pagination-top" />
    </Grid>
  );
};

export default LogItem;
