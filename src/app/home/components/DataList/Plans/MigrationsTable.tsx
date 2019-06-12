import React from 'react';
import { Table, TableHeader, TableBody, sortable, SortByDirection } from '@patternfly/react-table';
import { EmptyState } from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Flex, Box } from '@rebass/emotion';
import styled from '@emotion/styled';
import moment from 'moment';

export default class MigrationsTable extends React.Component<any, any> {
  state = {
    columns: [
      { title: 'Type', transforms: [sortable] },
      { title: 'Start Time', transforms: [sortable] },
      { title: 'End Time', transforms: [sortable] },
      'PVs Moved',
      'PVs Copied',
      'Status',
    ],
    rows: [],
    sortBy: {},
  };
  componentDidMount() {
    const mappedRows = this.props.migrations.map((migration, migrationIndex) => {
      const StyledBox = styled(Box)`
        position: absolute;
        left: 40px;
      `;
      const type = migration.spec.stage ? 'Stage' : 'Migration';
      const startTime = moment(migration.metadata.creationTimestamp);
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
        { title: startTime.format('LLL') },
        { title: startTime.format('LLL') },
        { title: 0 },
        { title: 0 },
        { title: 'Complete' },
      ];
    });

    this.setState({ rows: mappedRows });
  }

  componentDidUpdate(prevProps) {
    if (this.props.migrations !== prevProps.migrations) {
      const mappedRows = this.props.migrations.map((migration, migrationIndex) => {
        const StyledBox = styled(Box)`
          position: absolute;
          left: 40px;
        `;
        const type = migration.spec.stage ? 'Stage' : 'Migration';
        const startTime = moment(migration.metadata.creationTimestamp);
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
          { title: startTime.format('LLL') },
          { title: startTime.format('LLL') },
          { title: 0 },
          { title: 0 },
          { title: 'Complete' },
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
    const { columns, rows, sortBy } = this.state;
    const { type, migrations } = this.props;
    return (
      <React.Fragment>
        {migrations.length > 0 ? (
          <Table
            aria-label="migrations-history-table"
            sortBy={sortBy}
            onSort={this.onSort}
            //@ts-ignore
            cells={columns}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
        ) : (
          <EmptyState variant="large">Nothing to see here</EmptyState>
        )}
      </React.Fragment>
    );
  }
}
