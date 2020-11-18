import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader, cellWidth, sortable, IRow } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import MigrationActions from './MigrationActions';
import {
  Bullseye,
  EmptyState,
  Title,
  Progress,
  ProgressSize,
  ProgressVariant,
  Spinner,
  Level,
  LevelItem,
  Pagination,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
const styles = require('./MigrationsTable.module');

import { IMigration } from '../../../../plan/duck/types';
import { useSortState } from '../../../../common/duck/hooks';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
import PipelineSummary from './PipelineSummary/PipelineSummary';

interface IProps {
  migrations: IMigration[];
  id: string;
  type: string;
  isPlanLocked: boolean;
  planName: string;
}

const MigrationsTable: React.FunctionComponent<IProps> = ({
  migrations,
  isPlanLocked,
  planName,
}) => {
  const getSortValues = (migration: any) => {
    const type = migration.spec.stage ? 'Stage' : 'Migration';
    const { tableStatus } = migration;
    return [type, tableStatus.start, tableStatus.end, ''];
  };

  const columns = [
    { title: 'Type', transforms: [sortable] },
    { title: 'Start Time', transforms: [sortable] },
    { title: 'End Time', transforms: [sortable] },
    {
      title: 'Status',
      transforms: [cellWidth(30)],
    },
    '',
  ];

  const { sortBy, onSort, sortedItems } = useSortState(migrations, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const rows: IRow[] = [];
  currentPageItems.forEach((migration) => {
    const { tableStatus } = migration;
    // Type should be rollback if spec.rollback=true, else use value in spec.stage
    if (migration.spec.rollback == true) {
      const type = 'Rollback';
    } else if (migration.spec.stage == true) {
      const type = 'Stage';
    } else {
      const type = 'Migrate';
    }
    const getMigrationPipelineStatus = (migrationStatus) => {
      return migrationStatus;
    };

    rows.push({
      cells: [
        {
          title: (
            <>
              <Link to={`/plans/${planName}/migrations/${migration.metadata.name}`}>{type}</Link>
            </>
          ),
        },

        { title: migration.tableStatus.start },
        { title: migration.tableStatus.end },
        {
          title: <PipelineSummary status={getMigrationPipelineStatus(migration?.status)} />,
        },
        {
          title: <MigrationActions migration={migration} />,
          props: {
            className: 'pf-c-table__action',
          },
        },
      ],
    });
  });

  if (isPlanLocked) {
    return (
      <Bullseye>
        <EmptyState variant="small">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>

          {/* <Title headingLevel="h2" size="xl">
          TODO: ** need to evaluate what text to show here **
          </Title> */}
        </EmptyState>
      </Bullseye>
    );
  }
  return (
    <>
      {migrations.length > 0 ? (
        <>
          <Level>
            <LevelItem />
            <LevelItem>
              <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
            </LevelItem>
          </Level>
          <Table
            aria-label="migration-analytics-table"
            cells={columns}
            rows={rows}
            onSort={onSort}
            className={`${spacing.mtMd}`}
          >
            <TableHeader />
            <TableBody />
          </Table>

          <Pagination
            variant="bottom"
            {...paginationProps}
            widgetId="providers-table-pagination-top"
          />
        </>
      ) : (
        <Bullseye>
          <EmptyState variant="small">
            <Title headingLevel="h2" size="xl">
              No migrations started
            </Title>
          </EmptyState>
        </Bullseye>
      )}
    </>
  );
};

export default MigrationsTable;
