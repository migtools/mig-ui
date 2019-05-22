import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  SortByDirection,
  headerCol,
  TableVariant,
  expandable,
  cellWidth,
} from '@patternfly/react-table';
import { EmptyState } from '@patternfly/react-core';
import { migrationSuccess } from '../../../../plan/duck/reducers';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Flex, Box } from '@rebass/emotion';
import styled from '@emotion/styled';
export default class SortableTable extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { title: 'Type', transforms: [sortable] },
        { title: 'Start Time' },
        { title: 'End Time' },
        'PVs Moved',
        'PVs Copied',
        'Status',
      ],
      rows: [],
      sortBy: {},
    };
    this.onSort = this.onSort.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (this.props.migrations !== prevProps.migrations) {
      const mappedRows = this.props.migrations.map((migration, migrationIndex) => {
        const StyledBox = styled(Box)`
          position: absolute;
          left: 40px;
        `;
        return [
          {
            title: (
              <Flex>
                <StyledBox>
                  <StatusIcon status="Ready" />
                </StyledBox>
                <Box>{migration.type}</Box>
              </Flex>
            ),
          },
          { title: migration.start },
          { title: migration.end },
          { title: migration.moved },
          { title: migration.copied },
          { title: migration.status },
        ];
      });

      this.setState({ rows: mappedRows });
    }
  }
  onSort(_event, index, direction) {
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
  }

  render() {
    const { columns, rows, sortBy } = this.state;
    const { type, migrations } = this.props;
    return (
      <React.Fragment>
        {migrations.length > 0 ? (
          <Table sortBy={sortBy} onSort={this.onSort} cells={columns} rows={rows}>
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
