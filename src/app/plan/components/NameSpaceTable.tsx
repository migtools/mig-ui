import React from 'react';
import { Pagination, Title } from '@patternfly/react-core';
import { Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';
import ReactDataGrid from 'react-data-grid';
// import { Table, TableHeader, TableBody } from '@patternfly/react-table';

interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
}
interface IProps {
  selectedCluster: any;
}

class NamespaceTable extends React.Component<IProps, IState> {
  state = {
    page: 1,
    perPage: 20,
    pageOfItems: [],
  };

  onChangePage = pageOfItems => {
    this.setState({ pageOfItems });
  }

  onSetPage = (_event, pageNumber) => {
    this.setState({
      page: pageNumber,
    });
  }

  onPerPageSelect = (_event, perPage) => {
    this.setState({
      perPage,
    });
  }

  render() {
    const columns = [
      { key: 'name', name: 'Name' },
      { key: 'info', name: 'Info' },
    ];
    const { selectedCluster } = this.props;
    // const { columns, rows } = this.state;

    if (selectedCluster !== null) {
      //   debugger;
      //   const myRows = [];
      //   for (let i = 0; i < selectedCluster.metadata.namespaces.length; i++) {
      //     myRows[i] = new Array(selectedCluster.metadata.namespaces[i]);
      //   }
      return (
        <React.Fragment>
          <Card>
            <CardHeader>
              <Title headingLevel="h2" size="3xl">
                {selectedCluster.metadata.name || 'nothing'}
              </Title>
            </CardHeader>
            <CardBody>
              {/* <Table caption="Simple Table" cells={columns} rows={myRows}>
                <TableHeader />
                <TableBody />
              </Table> */}
              <ReactDataGrid
                columns={columns}
                rowGetter={i => selectedCluster.metadata.namespaces[i]}
                rowsCount={3}
                minHeight={150}
              />
            </CardBody>
            <CardFooter>
              <Pagination
                itemCount={selectedCluster.metadata.namespaces.length || 0}
                perPage={this.state.perPage}
                page={this.state.page}
                onSetPage={this.onSetPage}
                widgetId="pagination-options-menu-top"
                onPerPageSelect={this.onPerPageSelect}
              />
            </CardFooter>
          </Card>
        </React.Fragment>
      );
    } else {
      return <div />;
    }
  }
}
export default NamespaceTable;
