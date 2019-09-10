/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table';
import {
  EmptyState,
  Progress,
  ProgressSize,
  ProgressVariant
} from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

interface IProps {
  migrations: any[];
  id: string;
  type: string;
  isPlanLocked: boolean;
}
const MigrationsTable: React.FunctionComponent<IProps> = ({ migrations, isPlanLocked }) => {
  const [currentRows, setCurrentRows] = useState([]);

  const columns = [
    { title: 'Type' },
    { title: 'Start Time' },
    { title: 'End Time' },
    'PVs Moved',
    'PVs Copied',
    'Status',
  ];

  useEffect(() => {
    const mappedRows = migrations.map((migration, migrationIndex) => {
      const type = migration.spec.stage ? 'Stage' : 'Migration';
      const progressVariant = migration.tableStatus.isSucceeded ? ProgressVariant.success :
        (migration.tableStatus.isFailed ? ProgressVariant.danger : ProgressVariant.info);
      const rowCells = [
        { title: type },
        { title: migration.tableStatus.start },
        { title: migration.tableStatus.end },
        { title: migration.tableStatus.moved },
        { title: migration.tableStatus.copied },
        {
          title: (
            <div>
              <div>
                {migration.tableStatus.progress && (
                  <Progress
                    value={migration.tableStatus.progress}
                    title={migration.tableStatus.stepName}
                    size={ProgressSize.sm}
                    variant={progressVariant}
                  />
                )}
              </div>
            </div>
          ),
        },
      ];
      return {
        cells: rowCells
      };
    });
    setCurrentRows(mappedRows);

  }, [migrations]);

  if (isPlanLocked) {
    return (
      <EmptyState variant="full">
        <Spinner size="xl" />
      </EmptyState>
    );
  }

  return (
    <React.Fragment>
      {migrations.length > 0 ? (
        <Table
          aria-label="migrations-history-table"
          cells={columns}
          rows={currentRows}
          className="pf-m-vertical-align-content-center"
        >
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
          <EmptyState variant="full">No migrations started</EmptyState>
        )}
    </React.Fragment>
  );
};
export default MigrationsTable;