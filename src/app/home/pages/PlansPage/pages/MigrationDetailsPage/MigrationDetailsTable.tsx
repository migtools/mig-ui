import React, { useEffect } from 'react';
import { Table, TableBody, TableHeader, cellWidth, IRow } from '@patternfly/react-table';
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
import { useParams, useHistory, Link } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IMigration, IStep } from '../../../../../plan/duck/types';
import { usePaginationState } from '../../../../../common/duck/hooks/usePaginationState';
import {
  getElapsedTime,
  getProgressValues,
  IProgressInfoObj,
  showConsolidatedProgressBar,
} from '../../helpers';
import MigrationStepStatusIcon from './MigrationStepStatusIcon';
const styles = require('./MigrationDetailsTable.module');

interface IProps {
  migration: IMigration;
  id: string;
}

const MigrationDetailsTable: React.FunctionComponent<IProps> = ({ migration }) => {
  const { planName } = useParams();
  const columns = [
    { title: 'Step' },
    { title: 'Elapsed time', transforms: [cellWidth(10)] },
    {
      title: 'Status',
      transforms: [cellWidth(30)],
    },
    '',
  ];

  const filteredPipelineSteps = migration.status.pipeline.filter((step: IStep) => {
    const regex = RegExp('((?:^|W)Restore(?:$|W))|((?:^|W)Backup(?:$|W))', 'i');
    const isStageRelatedStep = regex.test(step.name);
    if (!isStageRelatedStep) {
      return step.name;
    }
  });
  const type = migration.spec.stage ? 'Stage' : 'Migration';

  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(
    migration.spec.stage ? filteredPipelineSteps : migration.status.pipeline,
    10
  );
  useEffect(() => setPageNumber(1), [setPageNumber]);

  const rows: IRow[] = [];
  currentPageItems.forEach((step: IStep) => {
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
            showConsolidatedProgressBar(step) &&
            progressInfo.progressBarApplicable &&
            step.started &&
            step.progress?.length > 0 ? (
              <>
                {
                  <Progress
                    value={progressInfo.percentComplete}
                    title={progressInfo.progressBarMessage}
                    size={ProgressSize.sm}
                    variant={progressInfo.variant}
                    className={progressInfo.isWarning && styles.warnProgressStyle}
                  />
                }
              </>
            ) : step.progress?.length > 0 ? (
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
              No steps available.
            </Title>
          </EmptyState>
        </Bullseye>
      )}
    </>
  );
};

export default MigrationDetailsTable;
