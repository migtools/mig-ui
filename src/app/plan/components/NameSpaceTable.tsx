/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import planOperations from '../../plan/duck/operations';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
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
      this.props.fetchNamespacesForCluster(this.props.sourceCluster.metadata.name);
    }
  }

  componentDidUpdate(prevProps, prevState) {
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
  };

  render() {
    const { sourceCluster } = this.props;
    const { rows } = this.state;
    const StyledTextContent = styled(TextContent)`
      margin: 1em 0 1em 0;
    `;
    if (sourceCluster !== null) {
      return (
        <React.Fragment>
          <StyledTextContent>
            <TextList component="dl">
              <TextListItem component="dt">Select projects to be migrated: </TextListItem>
            </TextList>
          </StyledTextContent>

          <ReactTable
            css={css`
              font-size: 14px;
              .rt-td {
                overflow: visible;
              }
            `}
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
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Name
                  </div>
                ),
                accessor: 'metadata.name',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Display Name
                  </div>
                ),
                accessor: 'displayName',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Number of Pods
                  </div>
                ),
                accessor: 'pods',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Number of Services
                  </div>
                ),
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
  const allSourceClusterNamespaces = state.plan.sourceClusterNamespaces;
  const filteredSourceClusterNamespaces = allSourceClusterNamespaces.filter(ns => {
    const rejectedRegex = [
      RegExp('^kube-.*', 'i'),
      RegExp('^openshift-.*', 'i'),
      RegExp('^openshift$', 'i'),
      RegExp('^velero$', 'i'),
    ];

    // Short circuit the regex check if any of them match a rejected regex and filter it out
    return !rejectedRegex.some(rx => rx.test(ns.metadata.name));
  });

  return {
    sourceClusterNamespaces: filteredSourceClusterNamespaces,
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
  mapDispatchToProps
)(NamespaceTable);
