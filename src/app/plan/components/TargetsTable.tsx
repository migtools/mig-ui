import React from 'react';
import { Title } from '@patternfly/react-core';
import { Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
  rows: any;
  selectAll: any;
  checked: any;
}
interface IProps {
  values: any;
}

class TargetsTable extends React.Component<IProps, IState> {
  state = {
    page: 1,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    checked: [],
    selectAll: false,
  };

  componentDidMount() {
    if (this.props.values.selectedNamespaces) {
      this.setState({ rows: this.props.values.selectedNamespaces });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.values !== this.props.values) {
      this.setState({ rows: this.props.values.selectedNamespaces });
    }
  }
  //   selectRow = row => {
  //     const index = row.index;
  //     var checkedCopy = this.state.checked;
  //     checkedCopy[index] = !this.state.checked[index];
  //     // if (checkedCopy[index] === false) {
  //     //   this.setState({ selectAll: false });
  //     // }

  //     this.setState({
  //       checked: checkedCopy
  //     });
  //     const itemList = this.props.sourceCluster.metadata.namespaces;
  //     const formValuesForNamespaces = itemList.filter((item, itemIndex) => {
  //       for (var i = 0; checkedCopy.length > i; i++) {
  //         if (itemIndex === i) {
  //           if (checkedCopy[i]) {
  //             return item;
  //           }
  //         }
  //       }
  //     });
  //     this.props.setFieldValue("selectedNamespaces", formValuesForNamespaces);
  //   };
  render() {
    const { values } = this.props;
    const { rows } = this.state;

    if (values.selectedNamespaces !== null && values.targetCluster !== null) {
      return (
        <React.Fragment>
          <Card>
            <CardHeader>
              <Title headingLevel="h2" size="3xl">
                Source - Target Project Mapping
              </Title>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={this.state.rows}
                columns={[
                  //   {
                  //     accessor: "id",
                  //     Cell: row => (
                  //       <input
                  //         type="checkbox"
                  //         // onChange={() => this.selectRow(row)}
                  //         // checked={this.state.checked[row.index]}
                  //       />
                  //     )
                  //   },
                  {
                    Header: 'Name',
                    accessor: 'name',
                  },
                  {
                    Header: 'Info',
                    accessor: 'info',
                  },
                ]}
                defaultPageSize={10}
                className="-striped -highlight"
              />
            </CardBody>
            <CardFooter />
          </Card>
        </React.Fragment>
      );
    } else {
      return <div />;
    }
  }
}
export default TargetsTable;
