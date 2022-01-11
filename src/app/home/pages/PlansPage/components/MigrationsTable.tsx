import React, { useEffect } from 'react';
import { Table, TableBody, TableHeader, cellWidth, sortable, IRow } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import MigrationActions from './MigrationActions';
import {
  Bullseye,
  EmptyState,
  Title,
  Spinner,
  Level,
  LevelItem,
  Pagination,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

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
  const getSortValues = (migration: IMigration) => {
    const stateMigrationAnnotation =
      migration.metadata.annotations &&
      migration.metadata.annotations['migration.openshift.io/state-transfer'];

    const type = stateMigrationAnnotation
      ? 'State migration'
      : migration?.spec?.rollback
      ? 'Rollback'
      : migration?.spec?.stage
      ? 'Stage'
      : 'Cutover';

    const { tableStatus } = migration;
    return [type, tableStatus.start, tableStatus.end, ''];
  };

  const columns = [
    { title: 'Type', transforms: [sortable] },
    { title: 'Start Time', transforms: [sortable] },
    { title: 'End Time', transforms: [sortable] },
    {
      title: 'Status',
      transforms: [cellWidth(40)],
    },
    '',
  ];

  const { sortBy, onSort, sortedItems } = useSortState(migrations, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);
  const rows: IRow[] = [];
  currentPageItems.forEach((migration) => {
    // Type should be rollback if spec.rollback=true, else use value in spec.stage
    const stateMigrationAnnotation =
      migration.metadata.annotations &&
      migration.metadata.annotations['migration.openshift.io/state-transfer'];

    // TODO this needs to do a better job with types for SCC/state migrations
    const type = stateMigrationAnnotation
      ? 'State migration'
      : migration?.spec?.rollback
      ? 'Rollback'
      : migration?.spec?.stage
      ? 'Stage'
      : 'Cutover';

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
          title: (
            <>
              <PipelineSummary migration={migration} />
            </>
          ),
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
            aria-label="migrations-table"
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
