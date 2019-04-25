import React from 'react';
import { Title } from '@patternfly/react-core';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import planOperations from '../../plan/duck/operations';
import matchSorter from 'match-sorter';
import {
  Button,
  TextInput,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@patternfly/react-core';
import { css } from '@emotion/core';
import styled from '@emotion/styled';
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
      this.setState({
        rows: [{
          name: 'robot-shop',
          displayName: '',
          pods: '12',
          services: '12',
          targetName: 'robot-shop',
        }, {
          name: 'sandbox',
          displayName: '',
          pods: '3',
          services: '1',
          targetName: 'sandbox',
        }],
      });
      //temporary for ui development
      // this.props.fetchNamespacesForCluster(
      //   this.props.sourceCluster.metadata.name,
      // );

      // this.setState({ rows: this.props.sourceCluster.metadata.namespaces });
    }
  }
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.sourceCluster !== this.props.sourceCluster) {
  //     this.setState({
  //       rows: [
  //         { name: 'OCP_Project1', displayName: 'My Project 1', pods: '3', services: '6' },
  //         { name: 'OCP_Project2', displayName: 'My Project 2', pods: '4', services: '5' },
  //         { name: 'OCP_Project3', displayName: 'My Project 3', pods: '4', services: '7' },
  //       ],
  //     });
  //     //temporary for ui development
  //     // this.props.fetchNamespacesForCluster(
  //     //   this.props.sourceCluster.metadata.name,
  //     // );
  //   }
  //   if (
  //     prevProps.sourceClusterNamespaces !== this.props.sourceClusterNamespaces
  //   ) {
  //     this.setState({
  //       rows: [
  //         { name: 'OCP_Project1', displayName: 'My Project 1', pods: '3', services: '6' },
  //         { name: 'OCP_Project2', displayName: 'My Project 2', pods: '4', services: '5' },
  //         { name: 'OCP_Project3', displayName: 'My Project 3', pods: '4', services: '7' },
  //       ],
  //     });
  //     //temporary for ui development
  //     // this.setState({ rows: this.props.sourceClusterNamespaces });
  //   }
  // }
  selectRow = row => {
    const index = row.index;
    const checkedCopy = this.state.checked;
    checkedCopy[index] = !this.state.checked[index];

    this.setState({
      checked: checkedCopy,
    });
    //temporary for ui development
    // const itemList = this.props.sourceCluster.metadata.namespaces
    const itemList = this.state.rows;
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
    const StyledTextContent = styled(TextContent)`
      margin: 1em 0 1em 0;
    `;
    if (sourceCluster !== null) {
      return (
        <React.Fragment>
          <StyledTextContent
          >
            <TextList component="dl">
              <TextListItem component="dt" >Select projects to be migrated: </TextListItem>
            </TextList>
          </StyledTextContent>

          <ReactTable
            data={rows}
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
                Header: 'Display Name',
                accessor: 'displayName',
              },
              {
                Header: 'Number of Pods',
                accessor: 'pods',
              },
              {
                Header: 'Number of Services',
                accessor: 'services',
              },
            ]}
            defaultPageSize={5}
            className="-striped -highlight"
          />
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
