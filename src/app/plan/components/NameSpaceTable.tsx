import React from 'react';
import { Title } from '@patternfly/react-core';
import { Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import planOperations from '../../plan/duck/operations';

interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
  rows: any;
  selectAll: any;
  checked: any;
}
interface IProps {
  sourceCluster: any;
  sourceClusterNamespaces: any;
  fetchNamespacesForCluster: any;
  setFieldValue: (fieldName, fieldValue) => void;
}

class NamespaceTable extends React.Component<IProps, IState> {
  state = {
    page: 1,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    checked: [],
    selectAll: false,
  };

  componentDidMount() {
    if (this.props.sourceCluster) {
      this.setState({ rows: this.props.sourceCluster.metadata.namespaces });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.sourceCluster !== this.props.sourceCluster) {
      this.props.fetchNamespacesForCluster(this.props.sourceCluster.metadata.name);
    }
    if (prevProps.sourceClusterNamespaces !== this.props.sourceClusterNamespaces) {
      this.setState({ rows: this.props.sourceClusterNamespaces });
    }
  }
  selectRow = row => {
    const index = row.index;
    const checkedCopy = this.state.checked;
    checkedCopy[index] = !this.state.checked[index];

    this.setState({
      checked: checkedCopy,
    });
    const itemList = this.props.sourceCluster.metadata.namespaces;
    const formValuesForNamespaces = itemList.filter((item, itemIndex) => {
      for (let i = 0; checkedCopy.length > i; i++) {
        if (itemIndex === i) {
          if (checkedCopy[i]) {
            return item;
          }
        }
      }
    });
    this.props.setFieldValue('selectedNamespaces', formValuesForNamespaces);
  }
  render() {
    const { sourceCluster } = this.props;
    const { rows } = this.state;

    if (sourceCluster !== null) {
      return (
        <React.Fragment>
          <Card>
            <CardHeader>
              <Title headingLevel="h2" size="3xl">
                {sourceCluster.metadata.name || 'nothing'}
              </Title>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={this.state.rows}
                columns={[
                  {
                    accessor: 'id',
                    Cell: row => (
                      <input
                        type="checkbox"
                        onChange={() => this.selectRow(row)}
                        checked={this.state.checked[row.index]}
                      />
                    ),
                  },
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

function mapStateToProps(state) {
  return {
    sourceClusterNamespaces: state.plan.sourceClusterNamespaces,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchNamespacesForCluster: clusterName => {
      dispatch(planOperations.fetchNamespacesForCluster(clusterName));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NamespaceTable);
