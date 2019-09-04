/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, sortable, SortByDirection } from '@patternfly/react-table';
import { EmptyState, ProgressVariant } from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Flex, Box } from '@rebass/emotion';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import moment from 'moment';
import { MigrationIcon } from '@patternfly/react-icons';
import { Progress, ProgressSize } from '@patternfly/react-core';
import Loader from 'react-loader-spinner';
import theme from '../../../../../theme';

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
      const StyledBox = styled(Box)`
          position: absolute;
          left: 40px;
        `;
      const type = migration.spec.stage ? 'Stage' : 'Migration';
      const progressVariant = migration.tableStatus.isSucceeded ? ProgressVariant.success :
        (migration.tableStatus.isFailed ? ProgressVariant.danger : ProgressVariant.info);
      const rowCells = [
        {
          title: (
            <Flex>
              <StyledBox>
                <StatusIcon isReady={!migration.tableStatus.isFailed} />
              </StyledBox>
              <Box>{type}</Box>
            </Flex>
          ),
        },
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
      <Flex>
        <Box flex="1" m="auto"
          css={css`
            height: 100%;
            text-align: center;
          `}
        >
          <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
        </Box>
      </Flex>
    );
  }

  return (
    <React.Fragment>
      {migrations.length > 0 ? (
        <Table
          aria-label="migrations-history-table"
          //@ts-ignore
          cells={columns}
          rows={currentRows}
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