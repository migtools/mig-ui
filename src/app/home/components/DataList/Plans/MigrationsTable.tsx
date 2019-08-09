import React from 'react';
import { Table, TableHeader, TableBody, sortable, SortByDirection } from '@patternfly/react-table';
import { EmptyState, ProgressVariant } from '@patternfly/react-core';
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
                <StatusIcon isReady={true} />
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
              {status.progress && (
                <Progress 
                  value={status.progress} 
                  title={status.stepName} 
                  size={ProgressSize.sm}
                  variant={status.isRunning ? ProgressVariant.info: ProgressVariant.success}
                />
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
      start: 'TBD',
      end: 'TBD',
      moved: 0,
      copied: 0,
      stepName: 'Not started',
      isSucceeded: false,
      isRunning: false,
    };

    if (migration.status) {
      if (migration.status.startTimestamp) {
        status.start = moment(migration.status.startTimestamp).format('LLL');
      }
      let endTime;
      endTime = migration.status.conditions
        .filter(c => c.type === 'Succeeded')
        .map(c => c.lastTransitionTime)
        .toString();
      status.end = endTime ? moment(endTime).format('LLL') : 'TBD';

      const serverErrorMessage = migration.status.errors;
      if (serverErrorMessage) {
        status.stepName = serverErrorMessage.pop();
        status.progress = null;
        return status;
      } else {

        if (migration.status.conditions.length) {
          
          // Handle completed migrations: successful and failed
          if (migration.status.phase === "Completed") {
            status.stepName = "Completed";
            // For successful migrations, show green 100% progress
            let succeededCondition = migration.status.conditions.find(c => {
              return c.type === 'Succeeded';
            });
            if (succeededCondition != undefined) {
              status.isSucceeded = true;
              status.progress = 100;
            }
            // TODO: For failed migrations, show red 100% progress
          }
          
          // For running migrations, calculate percent progress
          let runningCondition = migration.status.conditions.find(c => {
            return c.type === 'Running';
          });
          if (runningCondition != undefined) {
            status.isRunning = true;
            status.stepName = runningCondition.reason;
            // Match string in format 'Step: 16/26'. Capture both numbers.
            let matches = runningCondition.message.match(/(\d+)\/(\d+)/);
            if (matches && matches.length === 3) {
              let currentStep = parseInt(matches[1]);
              let totalSteps = parseInt(matches[2]);
              if (currentStep != NaN && totalSteps != NaN) {
                status.progress = (currentStep / totalSteps) * 100;
              }
            }
          }
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
                  <StatusIcon isReady={true} />
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
                <div>
                  {status.progress && (
                    <Progress 
                      value={status.progress} 
                      title={status.stepName} 
                      size={ProgressSize.sm} 
                      variant={status.isRunning ? ProgressVariant.info: ProgressVariant.success}
                    />
                  )}
                </div>
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
