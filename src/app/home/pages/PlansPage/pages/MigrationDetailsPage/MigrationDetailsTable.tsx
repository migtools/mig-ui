import React from 'react';
import { Table, TableBody, TableHeader, cellWidth, IRow } from '@patternfly/react-table';
import { Bullseye, EmptyState, Title, Progress, ProgressSize } from '@patternfly/react-core';
import { useParams, Link } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IMigration, IStep } from '../../../../../plan/duck/types';
import { getElapsedTime, getProgressValues } from '../../helpers';
import { IProgressInfoObj } from '../../types';
import MigrationStepStatusIcon from './MigrationStepStatusIcon';
const styles = require('./MigrationDetailsTable.module');

interface IProps {
  migration: IMigration;
  id: string;
}

const MigrationDetailsTable: React.FunctionComponent<IProps> = ({ migration }) => {
  const { planName } = useParams();
  const columns = [
    { title: 'Step', transforms: [cellWidth(20)] },
    { title: 'Elapsed time', transforms: [cellWidth(20)] },
    {
      title: 'Status',
      transforms: [cellWidth(30)],
    },
    '',
  ];

  const rows: IRow[] = [];
  migration?.status?.pipeline.forEach((step: IStep) => {
    const progressInfo: IProgressInfoObj = getProgressValues(step, migration);
    rows.push({
      cells: [
        {
          title: step.name,
        },
        { title: getElapsedTime(step, migration) },
        {
          title: (
            <>
              <MigrationStepStatusIcon migration={migration} step={step} />
              &nbsp;
              {progressInfo.title}
            </>
          ),
        },
        {
          title:
            progressInfo.consolidatedProgress.progressBarApplicable &&
            !progressInfo.detailsAvailable ? (
              <>
                {
                  <Progress
                    value={progressInfo.consolidatedProgress.progressPercentage}
                    title={progressInfo.consolidatedProgress.progressMessage}
                    size={ProgressSize.sm}
                    variant={progressInfo.consolidatedProgress.progressVariant}
                  />
                }
              </>
            ) : progressInfo.detailsAvailable ? (
              <>
                <Link to={`/plans/${planName}/migrations/${migration.metadata.name}/${step.name}`}>
                  View Details
                </Link>
              </>
            ) : (
              ''
            ),
        },
      ],
    });
  });

  if (!migration.status.pipeline) {
    return null;
  }
  return (
    <>
      {migration.status.pipeline.length > 0 ? (
        <>
          <Table
            aria-label="migration-analytics-table"
            cells={columns}
            rows={rows}
            className={`${spacing.mtMd}`}
          >
            <TableHeader />
            <TableBody />
          </Table>
        </>
      ) : (
        <Bullseye>
          <EmptyState variant="small">
            <Title headingLevel="h2" size="xl">
              No steps available.
            </Title>
          </EmptyState>
        </Bullseye>
      )}
    </>
  );
};

export default MigrationDetailsTable;
