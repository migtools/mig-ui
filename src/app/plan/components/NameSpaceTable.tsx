import React from "react";
import { Pagination, Title } from "@patternfly/react-core";
import { Card, CardHeader, CardBody, CardFooter } from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
class NamespaceTable extends React.Component<any, any> {
  state = {
    page: 1,
    perPage: 20,
    pageOfItems: [],
    columns: ["name", "info"],
    rows: [["one", "two"]]
  };
  handleAction = (e, data) => {};

  onChangePage = pageOfItems => {
    this.setState({ pageOfItems: pageOfItems });
  };

  onSetPage = (_event, pageNumber) => {
    this.setState({
      page: pageNumber
    });
  };

  onPerPageSelect = (_event, perPage) => {
    this.setState({
      perPage
    });
  };

  render() {
    const { selectedCluster } = this.props;
    const { columns, rows } = this.state;

    if (selectedCluster !== null) {
      debugger;
      let myRows = [];
      for (var i = 0; i < selectedCluster.metadata.namespaces.length; i++) {
        myRows[i] = new Array(selectedCluster.metadata.namespaces[i]);
      }
      return (
        <React.Fragment>
          <Card>
            <CardHeader>
              <Title headingLevel="h2" size="3xl">
                {selectedCluster.metadata.name || "nothing"}
              </Title>
            </CardHeader>
            <CardBody>
              <Table caption="Simple Table" cells={columns} rows={myRows}>
                <TableHeader />
                <TableBody />
              </Table>
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
