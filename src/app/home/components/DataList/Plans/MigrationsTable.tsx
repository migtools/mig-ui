import React from 'react';
import { Table, TableHeader, TableBody, sortable, SortByDirection } from '@patternfly/react-table';
import { EmptyState } from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Flex, Box } from '@rebass/emotion';
import styled from '@emotion/styled';
import moment from 'moment';
import { MigrationIcon } from '@patternfly/react-icons';
import { Progress, ProgressSize } from '@patternfly/react-core';

export default class MigrationsTable extends React.Component<any, any> {
  state = {
    columns: [
      { title: 'Type' },
      { title: 'Start Time' },
      { title: 'End Time' },
      'PVs Moved',
      'PVs Copied',
      'Status',
    ],
    rows: [],
  };
  componentDidMount() {
    const mappedRows = this.props.migrations.map((migration, migrationIndex) => {
      const status = this.getStatus(migration);

      const StyledBox = styled(Box)`
        position: absolute;
        left: 40px;
      `;
      const type = migration.spec.stage ? 'Stage' : 'Migration';
      return [
        {
          title: (
            <Flex>
              <StyledBox>
                <StatusIcon status="Ready" />
              </StyledBox>
              <Box>{type}</Box>
            </Flex>
          ),
        },
        { title: status.start },
        { title: status.end },
        { title: status.copied },
        { title: status.moved },
        {
          title: (
            <div>
              <div>{status.phase}</div>
              {status.progress && (
                <Progress value={status.progress} title="" size={ProgressSize.sm} />
              )}
            </div>
          ),
        },
      ];
    });

    this.setState({ rows: mappedRows });
  }
  getStatus = migration => {
    const status = {
      progress: null,
      start: null,
      end: null,
      moved: 0,
      copied: 0,
      phase: 'Not started',
    };

    if (migration.status) {
      if (migration.status.startTimestamp) {
        status.start = moment(migration.status.startTimestamp).format('LLL');
      }
      if (migration.status.completionTimestamp) {
        status.end = moment(migration.status.completionTimestamp).format('LLL');
      }

      const migPhase = migration.status.phase;
      const serverErrorMessage = migration.status.errors;
      if (serverErrorMessage) {
        status.phase = 'An error occurred';
        status.progress = null;
        return status;
      } else {
        switch (migPhase) {
          case 'WaitOnResticRestart':
            status.phase = 'Waiting';
            status.progress = 10;
            break;
          case 'BackupStarted':
            status.phase = 'Backup started';
            status.progress = 40;
            break;

          case 'WaitOnBackupReplication':
            status.phase = 'Waiting';
            status.progress = 50;
            break;
          case 'RestoreStarted':
            status.phase = 'Restoring....';
            status.progress = 60;
            break;
          case 'Completed':
            status.phase = 'Completed';
            status.progress = null;
            break;
          default:
            status.phase = 'Something went wrong...';
            status.progress = null;
            break;
        }
        return status;
      }
    } else {
      return status;
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.migrations !== prevProps.migrations) {
      const mappedRows = this.props.migrations.map((migration, migrationIndex) => {
        const StyledBox = styled(Box)`
          position: absolute;
          left: 40px;
        `;
        const type = migration.spec.stage ? 'Stage' : 'Migration';
        const status = this.getStatus(migration);
        return [
          {
            title: (
              <Flex>
                <StyledBox>
                  <StatusIcon status="Ready" />
                </StyledBox>
                <Box>{type}</Box>
              </Flex>
            ),
          },
          { title: status.start },
          { title: status.end },
          { title: status.copied },
          { title: status.moved },
          {
            title: (
              <div>
                <div>{status.phase}</div>
                {status.progress && (
                  <Progress value={status.progress} title="" size={ProgressSize.sm} />
                )}
              </div>
            ),
          },
        ];
      });

      this.setState({ rows: mappedRows });
    }
  }
  onSort = (_event, index, direction) => {
    const sortedRows = this.state.rows.sort((a, b) =>
      a[index] < b[index] ? -1 : a[index] > b[index] ? 1 : 0
    );
    this.setState({
      sortBy: {
        index,
        direction,
      },
      rows: direction === SortByDirection.asc ? sortedRows : sortedRows.reverse(),
    });
  };

  render() {
    const { columns, rows } = this.state;
    const { type, migrations } = this.props;
    return (
      <React.Fragment>
        {migrations.length > 0 ? (
          <Table
            aria-label="migrations-history-table"
            //@ts-ignore
            cells={columns}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
        ) : (
          <EmptyState variant="large">No migrations started</EmptyState>
        )}
      </React.Fragment>
    );
  }
}
