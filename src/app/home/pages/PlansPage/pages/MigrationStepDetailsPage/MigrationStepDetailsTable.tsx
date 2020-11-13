import React, { useEffect } from 'react';
import { Table, TableBody, TableHeader, cellWidth, sortable, IRow } from '@patternfly/react-table';
import {
  Bullseye,
  EmptyState,
  Title,
  Progress,
  ProgressSize,
  Level,
  LevelItem,
  Pagination,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IMigration, IStep } from '../../../../../plan/duck/types';
import { usePaginationState } from '../../../../../common/duck/hooks/usePaginationState';
import { getMigrationStepProgress, getElapsedTime } from '../../helpers';

interface IStepProps {
  step: IStep;
  migration: IMigration;
  id: string;
}

const MigrationStepDetailsTable: React.FunctionComponent<IStepProps> = ({ step, migration }) => {
  const columns = [
    { title: 'Resource (Namespace/Name)' },
    { title: 'Elapsed time', transforms: [cellWidth(10)] },
    {
      title: 'Status',
    },
  ];

  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(
    step.progress,
    10
  );

  useEffect(() => setPageNumber(1), [setPageNumber]);

  const rows: IRow[] = [];
  currentPageItems.forEach((progress) => {
    const stepProgressInfo = getMigrationStepProgress(progress);
    const duration =
      stepProgressInfo.duration === ''
        ? getElapsedTime(step, migration)
        : stepProgressInfo.duration;
    if (stepProgressInfo.message !== '') {
      rows.push({
        cells: [
          {
            title: stepProgressInfo.metadata,
          },
          { title: duration },
          {
            title: stepProgressInfo.progressBarApplicable ? (
              <Progress
                value={stepProgressInfo.percentComplete}
                title={stepProgressInfo.message}
                size={ProgressSize.sm}
                variant={stepProgressInfo.progressVariant}
              />
            ) : (
              stepProgressInfo.message
            ),
          },
        ],
      });
    }
  });

  return (
    <>
      {step.progress?.length > 0 ? (
        <>
          <Level>
            <LevelItem />
            <LevelItem>
              <Pagination {...paginationProps} widgetId="migration-details-pagination-top" />
            </LevelItem>
          </Level>
          <Table
            aria-label="migration-analytics-table"
            cells={columns}
            rows={rows}
            className={`${spacing.mtMd}`}
          >
            <TableHeader />
            <TableBody />
          </Table>

          <Pagination
            variant="bottom"
            {...paginationProps}
            widgetId="migration-details-table-pagination-top"
          />
        </>
      ) : (
        <Bullseye>
          <EmptyState variant="small">
            <Title headingLevel="h2" size="xl">
              Detailed progress data not available.
            </Title>
          </EmptyState>
        </Bullseye>
      )}
    </>
  );
};

export default MigrationStepDetailsTable;
