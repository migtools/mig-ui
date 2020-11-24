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
import { getProgressValues, getElapsedTime } from '../../helpers';
import { IStepProgressInfo } from '../../types';

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

  const progressInfoObj = getProgressValues(step, migration);

  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(
    progressInfoObj.detailedProgress,
    10
  );

  useEffect(() => setPageNumber(1), [setPageNumber]);

  const rows: IRow[] = [];
  currentPageItems.forEach((stepProgressInfo: IStepProgressInfo) => {
    const duration =
      stepProgressInfo.duration === ''
        ? getElapsedTime(step, migration)
        : stepProgressInfo.duration;
    if (stepProgressInfo.metadata && stepProgressInfo.progressMessage) {
      rows.push({
        cells: [
          {
            title: stepProgressInfo.metadata,
          },
          { title: duration, transforms: [cellWidth(10)] },
          {
            title: stepProgressInfo.progressBarApplicable ? (
              <Progress
                value={stepProgressInfo.progressPercentage}
                title={stepProgressInfo.progressMessage}
                size={ProgressSize.sm}
                variant={stepProgressInfo.progressVariant}
              />
            ) : (
              stepProgressInfo.progressMessage
            ),
            transforms: [cellWidth(30)],
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
