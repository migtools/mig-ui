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
  render() {
    const { values } = this.props;
    const { rows } = this.state;

    if (values.selectedNamespaces !== null && values.targetCluster !== null) {
      return (
        <ReactTable
          data={rows}
          columns={[
            {
              Header: 'Source Project Name',
              accessor: 'name',
            },
            {
              Header: 'Target Project Name',
              accessor: 'name',
            },
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
      );
    } else {
      return <div />;
    }
  }
}
export default TargetsTable;
